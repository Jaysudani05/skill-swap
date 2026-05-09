# models.py
from pydantic import BaseModel
from typing import Optional

class Experience(BaseModel):
    title: str = ""
    company: str = ""

class Education(BaseModel):
    degree: str = ""
    institution: str = ""

class UserProfile(BaseModel):
    """Accepts the full payload sent by the Node.js backend."""
    user_id: str = ""
    fullname: str = ""
    headline: str = ""
    about_me: str = ""
    skills_offered: list[str] = []
    skills_to_learn: list[str] = []
    location: str = ""
    availability: list[str] = []
    time_credits: float = 0
    experience: list[Experience] = []
    education: list[Education] = []

    def to_matcher_dict(self) -> dict:
        """Convert to the dict format expected by matcher.py."""
        return {
            "_id": self.user_id,
            "userId": self.user_id,
            "fullname": self.fullname,
            "headline": self.headline,
            "aboutMe": self.about_me,
            "skillsOffered": self.skills_offered,
            "skillsToLearn": self.skills_to_learn,
            "location": self.location,
            "availability": self.availability,
            "timeCredits": self.time_credits,
            "experience": [{"title": e.title, "company": e.company} for e in self.experience],
            "education": [{"degree": e.degree, "institution": e.institution} for e in self.education],
        }

class MatchRequest(BaseModel):
    seeker: UserProfile
    candidates: list[UserProfile]
    top_k: Optional[int] = 20

class MatchResult(BaseModel):
    userId: str
    user_id: Optional[str] = None
    score: float
    reasons: list[str]
    matchedSkills: Optional[dict] = None

class MatchResponse(BaseModel):
    matches: list[MatchResult]