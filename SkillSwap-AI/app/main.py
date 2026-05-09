from typing import List, Optional
import os

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import numpy as np


app = FastAPI(
    title="SkillSwap AI Service",
    description="Transformer-based skill matching for Skill Swap platform",
    version="1.0.0",
)


class ProfileIn(BaseModel):
    user_id: str
    fullname: Optional[str] = None
    headline: Optional[str] = None
    about_me: Optional[str] = None
    skills_offered: List[str] = []
    skills_to_learn: List[str] = []
    location: Optional[str] = None


class MatchQuery(BaseModel):
    seeker: ProfileIn
    candidates: List[ProfileIn]
    top_k: int = 10


class MatchResult(BaseModel):
    user_id: str
    score: float
    reason: str


class MatchResponse(BaseModel):
    matches: List[MatchResult]


_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """
    Lazy-load the transformer model once per process.
    Uses a lightweight sentence-transformer suitable for semantic similarity.
    """
    global _model
    if _model is None:
        # Smaller model reduces memory usage on low-memory instances (Render, etc).
        # You can override in environment.
        model_name = os.getenv(
            "EMBEDDING_MODEL", "sentence-transformers/paraphrase-MiniLM-L3-v2"
        )
        _model = SentenceTransformer(model_name)
    return _model


def build_profile_text(profile: ProfileIn, focus: str = "offered") -> str:
    """Convert a profile into a single text string for embedding."""
    parts: list[str] = []

    if profile.fullname:
        parts.append(profile.fullname)
    if profile.headline:
        parts.append(profile.headline)
    if profile.about_me:
        parts.append(profile.about_me)

    if focus == "offered":
        skills = profile.skills_offered
    else:
        skills = profile.skills_to_learn

    if skills:
        parts.append("Skills: " + ", ".join(skills))

    if profile.location:
        parts.append(f"Location: {profile.location}")

    return " | ".join(parts)


@app.get("/health")
async def health():
    return {"status": "ok"}

# Some platforms/probes (e.g., Render) may check `HEAD /`.
# Provide a lightweight root endpoint so those checks don't 404.
@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/match-skills", response_model=MatchResponse)
async def match_skills(payload: dict) -> MatchResponse:
    """
    Rank candidate profiles for a seeker using semantic similarity.

    Intuition:
    - We want people whose **skills_offered** match what the seeker wants to learn.
    - We also lightly reward overlap between offered skills (mutual expertise).
    """
    # Accept flexible payloads from Node/Frontend and coerce to our models.
    seeker_raw = payload.get("seeker") or {}
    candidates_raw = payload.get("candidates") or []
    top_k_raw = payload.get("top_k", 10)
    max_candidates_raw = payload.get("max_candidates") or os.getenv("MAX_CANDIDATES", 20)

    try:
      top_k = int(top_k_raw)
    except Exception:
      top_k = 10

    try:
      max_candidates = int(max_candidates_raw)
    except Exception:
      max_candidates = 20

    if not candidates_raw:
        return MatchResponse(matches=[])

    # Convert raw dicts into ProfileIn instances
    seeker = ProfileIn(
        user_id=str(seeker_raw.get("user_id", "")),
        fullname=seeker_raw.get("fullname"),
        headline=seeker_raw.get("headline"),
        about_me=seeker_raw.get("about_me"),
        skills_offered=seeker_raw.get("skills_offered") or [],
        skills_to_learn=seeker_raw.get("skills_to_learn") or [],
        location=seeker_raw.get("location"),
    )

    candidates: list[ProfileIn] = []
    for c in candidates_raw:
        try:
            candidates.append(
                ProfileIn(
                    user_id=str(c.get("user_id", "")),
                    fullname=c.get("fullname"),
                    headline=c.get("headline"),
                    about_me=c.get("about_me"),
                    skills_offered=c.get("skills_offered") or [],
                    skills_to_learn=c.get("skills_to_learn") or [],
                    location=c.get("location"),
                )
            )
        except Exception:
            continue

    if not candidates:
        return MatchResponse(matches=[])

    # Cap candidates to prevent memory spikes.
    candidates = candidates[:max_candidates]

    model = get_model()

    # Text standing for "what the seeker is looking for"
    seeker_need_text = build_profile_text(seeker, focus="to_learn")
    seeker_offer_text = build_profile_text(seeker, focus="offered")

    # Fallbacks if seeker fields are empty
    if not seeker_need_text.strip():
        seeker_need_text = seeker_offer_text or "general learning interests"
    if not seeker_offer_text.strip():
        seeker_offer_text = seeker_need_text or "general skills"

    # Use NumPy embeddings (not torch tensors) to reduce memory.
    # With normalize_embeddings=True, dot-product equals cosine similarity.
    seeker_need_emb = model.encode(
        seeker_need_text, convert_to_numpy=True, normalize_embeddings=True
    )  # (dim,)
    seeker_offer_emb = model.encode(
        seeker_offer_text, convert_to_numpy=True, normalize_embeddings=True
    )  # (dim,)

    cand_need_texts: list[str] = []
    cand_offer_texts: list[str] = []

    for c in candidates:
        cand_need_texts.append(build_profile_text(c, focus="to_learn"))
        cand_offer_texts.append(build_profile_text(c, focus="offered"))

    # 1) How well candidate's offered skills match seeker's learning needs
    cand_offer_embs = model.encode(
        cand_offer_texts, convert_to_numpy=True, normalize_embeddings=True
    )  # (n, dim)
    need_match_scores = cand_offer_embs @ seeker_need_emb  # (n,)
    del cand_offer_embs

    # 2) How well candidate wants to learn what seeker can offer (mutual exchange)
    cand_need_embs = model.encode(
        cand_need_texts, convert_to_numpy=True, normalize_embeddings=True
    )  # (n, dim)
    mutual_match_scores = cand_need_embs @ seeker_offer_emb  # (n,)
    del cand_need_embs

    # Weighted combination
    need_weight = 0.7
    mutual_weight = 0.3
    combined_np = (
        need_weight * need_match_scores + mutual_weight * mutual_match_scores
    ).astype(float)

    # Sort by score desc, keep top_k
    top_k = min(top_k, len(candidates))
    top_indices = np.argsort(-combined_np)[:top_k]

    matches: list[MatchResult] = []
    for idx in top_indices:
        c = candidates[int(idx)]
        score = float(combined_np[int(idx)])
        reason = (
            "Strong match between their offered skills and what you want to learn; "
            "plus some alignment in mutual learning interests."
        )
        matches.append(
            MatchResult(
                user_id=c.user_id,
                score=round(score, 4),
                reason=reason,
            )
        )

    return MatchResponse(matches=matches)


# For local development:
# uvicorn app.main:app --host 0.0.0.0 --port 8001

