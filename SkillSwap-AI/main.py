from fastapi import FastAPI
from matcher import compute_matches
from models import MatchRequest, MatchResponse

app = FastAPI()

@app.post("/match", response_model=MatchResponse)
async def match_skills(req: MatchRequest):
    # Convert Pydantic models → plain dicts the matcher expects
    current_user_dict = req.seeker.to_matcher_dict()
    candidate_dicts   = [c.to_matcher_dict() for c in req.candidates]

    results = compute_matches(current_user_dict, candidate_dicts)

    # Add user_id alias for frontend compatibility
    for r in results:
        r["user_id"] = r.get("userId", "")

    # Respect top_k
    top_k = req.top_k or 20
    return {"matches": results[:top_k]}

@app.get("/health")
async def health():
    return {"status": "ok"}