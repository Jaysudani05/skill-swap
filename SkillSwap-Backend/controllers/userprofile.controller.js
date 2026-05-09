const UserProfile = require("../models/UserProfile.model");
const mongoose = require("mongoose");

/**
 * UserProfile Controller
 * Handles all user profile related operations
 */
// Create a new user profile
exports.createProfile = async (req, res) => {
    try {
        const {
            userId,
            fullname,
            headline,
            aboutMe,
            location,
            publicEmail,
            phone,
            linkedinUrl,
            experience,
            education,
            availability,
            timeCredits,
            isProfilePublic,
            skillsOffered,
            skillsToLearn
        } = req.body;

        // Check if profile already exists for this user
        const existingProfile = await UserProfile.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: "Profile already exists for this user"
            });
        }

        // Create new profile
        const newProfile = new UserProfile({
            userId,
            fullname,
            headline,
            aboutMe,
            location,
            publicEmail,
            phone,
            linkedinUrl,
            experience,
            education,
            availability,
            timeCredits,
            isProfilePublic,
            skillsOffered: skillsOffered || [],
            skillsToLearn: skillsToLearn || []
        });

        const savedProfile = await newProfile.save();

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: savedProfile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating profile",
            error: error.message
        });
    }
};

// Get user profile by userId
exports.getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const profile = await UserProfile.findOne({ userId }).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // increment view count if the requester is not the owner
        if (req.user && req.user.id !== profile.userId._id.toString()) {
            await UserProfile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message
        });
    }
};

// Get profile by profile ID
exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid profile ID"
            });
        }

        const profile = await UserProfile.findById(id).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // increment view count when someone besides the owner accesses this profile
        if (req.user && req.user.id !== profile.userId._id.toString()) {
            await UserProfile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        console.log(userId);
        console.log(updateData);


        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Remove userId from updateData to prevent modification
        delete updateData.userId;

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found backend"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// Delete user profile
exports.deleteProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const deletedProfile = await UserProfile.findOneAndDelete({ userId });

        if (!deletedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting profile",
            error: error.message
        });
    }
};

// Get all public profiles (for browsing/discovery)
exports.getPublicProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = { isProfilePublic: true };

        if (req.query.excludeUserId) {
            searchQuery.userId = { $ne: req.query.excludeUserId };
        }

        if (search) {
            searchQuery.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { headline: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { skillsOffered: { $elemMatch: { $regex: search, $options: 'i' } } },
                { skillsToLearn: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        const profiles = await UserProfile.find(searchQuery)
            .populate('userId', 'username email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await UserProfile.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            data: profiles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProfiles: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching public profiles",
            error: error.message
        });
    }
};

// Add experience to profile
exports.addExperience = async (req, res) => {
    try {
        const { userId } = req.params;
        const experienceData = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $push: { experience: experienceData } },
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Experience added successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding experience",
            error: error.message
        });
    }
};

// Update experience in profile
exports.updateExperience = async (req, res) => {
    try {
        const { userId, experienceId } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or experience ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId, "experience._id": experienceId },
            { $set: { "experience.$": updateData } },
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile or experience not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Experience updated successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating experience",
            error: error.message
        });
    }
};

// Remove experience from profile
exports.removeExperience = async (req, res) => {
    try {
        const { userId, experienceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or experience ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $pull: { experience: { _id: experienceId } } },
            { new: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Experience removed successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing experience",
            error: error.message
        });
    }
};

// Add education to profile
exports.addEducation = async (req, res) => {
    try {
        const { userId } = req.params;
        const educationData = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $push: { education: educationData } },
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Education added successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding education",
            error: error.message
        });
    }
};

// Update education in profile
exports.updateEducation = async (req, res) => {
    try {
        const { userId, educationId } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(educationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or education ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId, "education._id": educationId },
            { $set: { "education.$": updateData } },
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile or education not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Education updated successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating education",
            error: error.message
        });
    }
};

// Remove education from profile
exports.removeEducation = async (req, res) => {
    try {
        const { userId, educationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(educationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or education ID"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $pull: { education: { _id: educationId } } },
            { new: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Education removed successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing education",
            error: error.message
        });
    }
};

// Update time credits
exports.updateTimeCredits = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeCredits, operation = 'set' } = req.body; // operation can be 'set', 'add', 'subtract'

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        let updateQuery = {};

        switch (operation) {
            case 'add':
                updateQuery = { $inc: { timeCredits: timeCredits } };
                break;
            case 'subtract':
                updateQuery = { $inc: { timeCredits: -timeCredits } };
                break;
            default:
                updateQuery = { $set: { timeCredits: timeCredits } };
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            updateQuery,
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Time credits updated successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating time credits",
            error: error.message
        });
    }
};

// Toggle profile visibility
exports.toggleProfileVisibility = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        profile.isProfilePublic = !profile.isProfilePublic;
        await profile.save();

        res.status(200).json({
            success: true,
            message: `Profile visibility ${profile.isProfilePublic ? 'enabled' : 'disabled'}`,
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling profile visibility",
            error: error.message
        });
    }
};