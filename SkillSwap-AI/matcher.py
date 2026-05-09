"""
Skill-Swap Matcher — prioritises complementary skill overlap.

Matching logic:
  1. Exact skill overlap  (they teach what you want & you teach what they want)
  2. Semantic similarity   (bi-encoder + cross-encoder for fuzzy skill matching)
  3. Bonus signals         (availability, location, experience)

Score is 0–100, higher = better match.
"""

# matcher.py

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, CrossEncoder, util
import os
from dotenv import load_dotenv

load_dotenv()

bi_encoder = SentenceTransformer("all-MiniLM-L6-v2")
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


# 🔥 NEW: semantic similarity for individual skills
def is_similar(skill1, skill2, threshold=0.6):
    emb1 = bi_encoder.encode(skill1, convert_to_tensor=True)
    emb2 = bi_encoder.encode(skill2, convert_to_tensor=True)
    score = util.cos_sim(emb1, emb2).item()
    return score > threshold


def _lower_list(lst):
    return [s.strip().lower() for s in (lst or []) if s.strip()]


def compute_skill_overlap(seeker, candidate):
    seeker_offers = _lower_list(seeker.get("skillsOffered", []))
    seeker_wants  = _lower_list(seeker.get("skillsToLearn", []))
    cand_offers   = _lower_list(candidate.get("skillsOffered", []))
    cand_wants    = _lower_list(candidate.get("skillsToLearn", []))

    they_teach_me = set()
    i_teach_them = set()

    # 🔥 FIX: semantic matching instead of exact only
    for want in seeker_wants:
        for offer in cand_offers:
            if want == offer or is_similar(want, offer):
                they_teach_me.add(offer)

    for want in cand_wants:
        for offer in seeker_offers:
            if want == offer or is_similar(want, offer):
                i_teach_them.add(offer)

    total_possible = max(len(seeker_wants) + len(cand_wants), 1)
    matched = len(they_teach_me) + len(i_teach_them)

    overlap_score = min(matched / total_possible, 1.0)

    if they_teach_me and i_teach_them:
        overlap_score = min(overlap_score + 0.25, 1.0)

    return {
        "score": overlap_score,
        "they_teach_me": they_teach_me,
        "i_teach_them": i_teach_them,
    }


def build_skill_query(profile):
    parts = []
    offers = profile.get("skillsOffered", [])
    wants  = profile.get("skillsToLearn", [])

    if offers:
        parts.append(f"Can teach: {', '.join(offers)}")
    if wants:
        parts.append(f"Wants to learn: {', '.join(wants)}")

    return " | ".join(parts)


def compute_bonus(seeker, candidate):
    bonus = 0.0

    if set(seeker.get("availability", [])) & set(candidate.get("availability", [])):
        bonus += 0.1

    if seeker.get("location") == candidate.get("location"):
        bonus += 0.1

    if candidate.get("timeCredits", 0) > 0:
        bonus += 0.05

    return bonus


def compute_matches(current_user, all_profiles):
    if not all_profiles:
        return []

    overlaps = [compute_skill_overlap(current_user, p) for p in all_profiles]

    seeker_text = build_skill_query(current_user)
    candidate_texts = [build_skill_query(p) for p in all_profiles]

    seeker_vec = bi_encoder.encode([seeker_text], convert_to_numpy=True)
    candidate_vecs = bi_encoder.encode(candidate_texts, convert_to_numpy=True)

    cos_scores = cosine_similarity(seeker_vec, candidate_vecs)[0]

    results = []

    for idx, profile in enumerate(all_profiles):
        overlap = overlaps[idx]
        semantic = cos_scores[idx]
        bonus = compute_bonus(current_user, profile)

        final = (overlap["score"] * 0.5 + semantic * 0.35 + bonus * 0.15) * 100
        final = round(float(np.clip(final, 0, 100)), 1)

        if final < 5:
            continue

        results.append({
            "userId": str(profile.get("userId", "")),
            "score": final,
            "reasons": generate_reasons(overlap, final),
            "matchedSkills": {
                "theyTeachYou": list(overlap["they_teach_me"]),
                "youTeachThem": list(overlap["i_teach_them"]),
            },
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)


def generate_reasons(overlap, score):
    reasons = []

    if overlap["they_teach_me"]:
        reasons.append("They can teach you relevant skills")

    if overlap["i_teach_them"]:
        reasons.append("You can teach them something")

    if overlap["they_teach_me"] and overlap["i_teach_them"]:
        reasons.append("Perfect skill swap match")

    if score > 80:
        reasons.append("Excellent match")

    return reasons