const mongoose = require("mongoose");


// Sub Schema
const experienceSchema = new mongoose.Schema({
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
});

const educationSchema = new mongoose.Schema({
    institution: String,
    degree: String,
    startYear: Number,
    endYear: Number,
});

// main user profile schema
const userProfileSchema = new mongoose.Schema(
    {
        // Core user reference
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Each user should have only one profile
        },

        // personal info
        fullname: {
            type: String,
            trim: true,
        },
        headline: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        aboutMe: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        location: {
            type: String,
            trim: true,
        },

        // Contact information
        publicEmail: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        linkedinUrl: {
            type: String,
            trim: true,
        },

        // Professional details
        experience: [experienceSchema],
        education: [educationSchema],

        // Skills
        skillsOffered: {
            type: [String],
            default: [],
        },
        skillsToLearn: {
            type: [String],
            default: [],
        },

        // Availability and credits
        availability: {
            type: [String],
            default: [],
        },
        timeCredits: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Settings
        isProfilePublic: {
            type: Boolean,
            default: true,
        },
        // How many times the profile has been viewed by others
        profileViews: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);