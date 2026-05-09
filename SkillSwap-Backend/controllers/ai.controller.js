const axios = require("axios");
const UserProfile = require("../models/UserProfile.model");

const AI_SERVICE_URL = (
  process.env.AI_SERVICE_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Render free tier can take 50–90s to wake the AI service; wait long enough
const AI_REQUEST_TIMEOUT_MS = 90_000;

/**
 * Convert a Mongoose profile document into the flat shape
 * that the Python AI service expects.
 */
function profileToAiPayload(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    user_id: String(p.userId?._id || p.userId || p._id),
    fullname: p.fullname || "",
    headline: p.headline || "",
    about_me: p.aboutMe || "",
    skills_offered: p.skillsOffered || [],
    skills_to_learn: p.skillsToLearn || [],
    location: p.location || "",
    availability: p.availability || [],
    time_credits: p.timeCredits || 0,
    experience: (p.experience || []).map((e) => ({
      title: e.title || "",
      company: e.company || "",
    })),
    education: (p.education || []).map((e) => ({
      degree: e.degree || "",
      institution: e.institution || "",
    })),
  };
}

/**
 * POST /api/ai/match-skills
 *
 * The frontend only needs to hit this endpoint — the backend
 * fetches ALL public profiles from MongoDB so the AI service
 * can score every candidate, not just the 6 visible on the page.
 *
 * Optional body fields:
 *   top_k  — number of top results to return (default 20)
 */
exports.matchSkills = async (req, res) => {
  try {
    // 1. Identify the logged-in user
    const userId = req.user?.id || req.user?._id || req.body?.seeker?.user_id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 2. Fetch the current user's profile
    const currentProfile = await UserProfile.findOne({ userId });
    if (!currentProfile) {
      return res
        .status(404)
        .json({ message: "Please complete your profile first." });
    }

    // 3. Fetch ALL other public profiles with populated userId for username
    const allProfiles = await UserProfile.find({
      userId: { $ne: userId },
      isProfilePublic: true,
    }).populate("userId", "_id username");

    if (!allProfiles.length) {
      return res.json({ matches: [] });
    }

    // 4. Build the AI payload with COMPLETE profile data
    const seeker = profileToAiPayload(currentProfile);
    const candidates = allProfiles.map(profileToAiPayload);
    const top_k = req.body?.top_k || 20;

    // 5. Forward to the Python AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/match`,
      { seeker, candidates, top_k },
      { timeout: AI_REQUEST_TIMEOUT_MS }
    );

    return res.json(response.data);
  } catch (error) {
    const isTimeout =
      error.code === "ECONNABORTED" || error.message?.includes("timeout");
    const isUnreachable =
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.response?.status >= 502;

    console.error("AI matchSkills error:", {
      aiServiceUrl: AI_SERVICE_URL,
      code: error.code,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (isTimeout || isUnreachable) {
      return res.status(503).json({
        message:
          "AI service is starting up or temporarily unavailable. Please try again in 30–60 seconds.",
        code: "AI_SERVICE_UNAVAILABLE",
      });
    }

    const status = error.response?.status || 500;
    return res.status(status).json({
      message: "AI service error",
      details: error.response?.data || error.message,
    });
  }
};
