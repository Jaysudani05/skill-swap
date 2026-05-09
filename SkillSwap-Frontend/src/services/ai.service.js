import API from "../APIs/api";

// Call backend proxy for AI skill matching
// POST /api/ai/match-skills
export const matchSkills = async (payload) => {
  const res = await API.post("/ai/match-skills", payload);
  return res.data;
};

