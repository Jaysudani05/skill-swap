import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Briefcase, GraduationCap, Calendar, Check, Clock, Zap } from 'lucide-react';
import UserProfileService from '../services/userProfile.service';
import { useNavigate } from 'react-router';
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState({
        fullname: user?.fullname || user?.name || "",
        headline: "",
        aboutMe: "",
        location: "",
        publicEmail: user?.email || "",
        phone: "",
        linkedinUrl: "",
        experience: [],
        education: [],
        availability: [],
        timeCredits: 0,
        isProfilePublic: true,
        skillsOffered: [],
        skillsToLearn: [],
    });
    const [skillOfferedInput, setSkillOfferedInput] = useState("");
    const [skillToLearnInput, setSkillToLearnInput] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const totalSteps = 6;

    const steps = [
        { number: 1, title: "Personal Info", icon: User },
        { number: 2, title: "Skills", icon: Zap },
        { number: 3, title: "Experience", icon: Briefcase },
        { number: 4, title: "Education", icon: GraduationCap },
        { number: 5, title: "Availability", icon: Calendar },
        { number: 6, title: "Time Credits", icon: Clock },
    ];

    // Experience handlers
    const handleExperienceChange = (idx, e) => {
        const newExp = [...form.experience];
        newExp[idx][e.target.name] = e.target.value;
        setForm({ ...form, experience: newExp });
    };

    const addExperience = () => {
        setForm({
            ...form,
            experience: [...form.experience, {
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                description: ""
            }]
        });
    };

    const removeExperience = (idx) => {
        const newExp = [...form.experience];
        newExp.splice(idx, 1);
        setForm({ ...form, experience: newExp });
    };

    // Education handlers
    const handleEducationChange = (idx, e) => {
        const newEdu = [...form.education];
        newEdu[idx][e.target.name] = e.target.value;
        setForm({ ...form, education: newEdu });
    };

    const addEducation = () => {
        setForm({
            ...form,
            education: [...form.education, {
                institution: "",
                degree: "",
                startYear: "",
                endYear: ""
            }]
        });
    };

    const removeEducation = (idx) => {
        const newEdu = [...form.education];
        newEdu.splice(idx, 1);
        setForm({ ...form, education: newEdu });
    };

    // ==================== SKILLS HANDLERS ====================

    // Add Skill Offered
    const addSkillOffered = (skill) => {
        if (skill.trim() !== "" && !form.skillsOffered.includes(skill)) {
            setForm({
                ...form,
                skillsOffered: [...form.skillsOffered, skill.trim()]
            });
        }
    };

    // Remove Skill Offered
    const removeSkillOffered = (skill) => {
        setForm({
            ...form,
            skillsOffered: form.skillsOffered.filter(s => s !== skill)
        });
    };

    // Add Skill To Learn
    const addSkillToLearn = (skill) => {
        if (skill.trim() !== "" && !form.skillsToLearn.includes(skill)) {
            setForm({
                ...form,
                skillsToLearn: [...form.skillsToLearn, skill.trim()]
            });
        }
    };

    // Remove Skill To Learn
    const removeSkillToLearn = (skill) => {
        setForm({
            ...form,
            skillsToLearn: form.skillsToLearn.filter(s => s !== skill)
        });
    };

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    // ── skill chip helpers ────────────────────────────────────────────────────
    const addSkill = (field, value, setter) => {
        const trimmed = value.trim();
        if (trimmed && !form[field].includes(trimmed)) {
            setForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
        }
        setter("");
    };

    const removeSkill = (field, skill) => {
        setForm(prev => ({ ...prev, [field]: prev[field].filter(s => s !== skill) }));
    };

    const handleSkillKeyDown = (e, field, value, setter) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(field, value, setter);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const profileData = {
                userId: user._id || user.id,
                fullname: form.fullname,
                headline: form.headline,
                aboutMe: form.aboutMe,
                location: form.location,
                publicEmail: form.publicEmail,
                phone: form.phone,
                linkedinUrl: form.linkedinUrl,
                experience: form.experience,
                education: form.education,
                availability: form.availability,
                timeCredits: form.timeCredits,
                isProfilePublic: form.isProfilePublic,
                skillsOffered: form.skillsOffered,
                skillsToLearn: form.skillsToLearn,
            };

            await UserProfileService.createProfile(profileData);
            setSuccess("Profile created successfully!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            // Handle specific error messages from the controller
            if (err.response?.data?.message === "Profile already exists for this user") {
                setError("Profile already exists for this user. Please update your existing profile instead.");
            } else {
                setError(err.response?.data?.message || err.message || "Failed to create profile.");
            }
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = (step) => {
        switch (step) {
            case 1:
                return (
                    form.fullname.trim() !== "" &&
                    form.headline.trim() !== "" &&
                    form.location.trim() !== "" &&
                    form.publicEmail.trim() !== "" &&
                    form.phone.trim() !== "" &&
                    form.linkedinUrl.trim() !== "" &&
                    form.aboutMe.trim() !== ""
                );
            case 2:
                // Require at least one skill to offer and one to learn
                return form.skillsOffered.length > 0 && form.skillsToLearn.length > 0;
            case 3:
                // Experience is optional, but if added all fields must be filled
                return form.experience.length === 0 || form.experience.every((exp) =>
                    exp.title.trim() !== "" &&
                    exp.company.trim() !== "" &&
                    exp.startDate !== "" &&
                    exp.endDate !== "" &&
                    exp.description.trim() !== ""
                );
            case 4:
                // Require at least 1 education and all fields filled
                return form.education.length > 0 && form.education.every((edu) =>
                    edu.institution.trim() !== "" &&
                    edu.degree.trim() !== "" &&
                    edu.startYear !== "" &&
                    edu.endYear !== ""
                );
            case 5:
                // Require at least 1 day selected
                return form.availability.length > 0;
            case 6:
                // Require a valid time credits value (0 or more)
                return form.timeCredits !== "" && form.timeCredits !== null && form.timeCredits >= 0;
            default:
                return true;
        }
    };

    const AVAILABILITY_OPTIONS = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    placeholder="Enter your full name"
                                    value={form.fullname}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Headline *
                                </label>
                                <input
                                    type="text"
                                    name="headline"
                                    placeholder="e.g., Senior Software Engineer"
                                    value={form.headline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="City, Country"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Public Email *
                                </label>
                                <input
                                    type="email"
                                    name="publicEmail"
                                    placeholder="your.email@example.com"
                                    value={form.publicEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone *
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="+1 (555) 123-4567"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    LinkedIn URL *
                                </label>
                                <input
                                    type="text"
                                    name="linkedinUrl"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={form.linkedinUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                About Me *
                            </label>
                            <textarea
                                name="aboutMe"
                                placeholder="Tell us about yourself, your interests, and what makes you unique..."
                                value={form.aboutMe}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center mt-6">
                            <label htmlFor="isProfilePublic" className="mr-4 text-sm font-medium text-gray-700">
                                Set Public Profile
                            </label>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isProfilePublic: !form.isProfilePublic })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
            ${form.isProfilePublic ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 
                ${form.isProfilePublic ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                            <span className="ml-3 text-sm text-gray-600">
                                {form.isProfilePublic ? 'Public' : 'Private'}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            When enabled, your profile will be visible to others.
                        </p>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
                        <p className="text-gray-500 text-sm -mt-4">Add the skills you can teach and the skills you want to learn. Press Enter or click Add after each skill.</p>

                        {/* Skills I Offer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                🟢 Skills I Offer <span className="font-normal text-gray-400">(what I can teach)</span>
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="e.g. Python, Photoshop, Guitar..."
                                    value={skillOfferedInput}
                                    onChange={e => setSkillOfferedInput(e.target.value)}
                                    onKeyDown={e => handleSkillKeyDown(e, 'skillsOffered', skillOfferedInput, setSkillOfferedInput)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => addSkill('skillsOffered', skillOfferedInput, setSkillOfferedInput)}
                                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                                {form.skillsOffered.map((skill, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill('skillsOffered', skill)} className="hover:text-green-600 text-green-500 font-bold leading-none">&times;</button>
                                    </span>
                                ))}
                                {form.skillsOffered.length === 0 && (
                                    <p className="text-gray-400 text-sm italic">No skills added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Skills I Want to Learn */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                🟣 Skills I Want to Learn <span className="font-normal text-gray-400">(what I want to pick up)</span>
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="e.g. Machine Learning, Cooking, Spanish..."
                                    value={skillToLearnInput}
                                    onChange={e => setSkillToLearnInput(e.target.value)}
                                    onKeyDown={e => handleSkillKeyDown(e, 'skillsToLearn', skillToLearnInput, setSkillToLearnInput)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => addSkill('skillsToLearn', skillToLearnInput, setSkillToLearnInput)}
                                    className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                                {form.skillsToLearn.map((skill, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill('skillsToLearn', skill)} className="hover:text-purple-600 text-purple-500 font-bold leading-none">&times;</button>
                                    </span>
                                ))}
                                {form.skillsToLearn.length === 0 && (
                                    <p className="text-gray-400 text-sm italic">No skills added yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Work Experience</h2>
                            <button
                                type="button"
                                onClick={addExperience}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Add Experience
                            </button>
                        </div>

                        {form.experience.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-600">No work experience added yet</p>
                                <p className="text-gray-500 text-sm">Click "Add Experience" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {form.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Experience {idx + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeExperience(idx)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    placeholder="e.g., Software Engineer"
                                                    value={exp.title}
                                                    onChange={e => handleExperienceChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    placeholder="e.g., Tech Corp"
                                                    value={exp.company}
                                                    onChange={e => handleExperienceChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={exp.startDate}
                                                    onChange={e => handleExperienceChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    name="endDate"
                                                    value={exp.endDate}
                                                    onChange={e => handleExperienceChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                name="description"
                                                placeholder="Describe your role, responsibilities, and achievements..."
                                                value={exp.description}
                                                onChange={e => handleExperienceChange(idx, e)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Education</h2>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Add Education
                            </button>
                        </div>

                        {form.education.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-600">No education records added yet</p>
                                <p className="text-gray-500 text-sm">Click "Add Education" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {form.education.map((edu, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Education {idx + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeEducation(idx)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                                <input
                                                    type="text"
                                                    name="institution"
                                                    placeholder="e.g., University of Technology"
                                                    value={edu.institution}
                                                    onChange={e => handleEducationChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                                <input
                                                    type="text"
                                                    name="degree"
                                                    placeholder="e.g., Bachelor of Computer Science"
                                                    value={edu.degree}
                                                    onChange={e => handleEducationChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                                                <input
                                                    type="number"
                                                    name="startYear"
                                                    placeholder="e.g., 2018"
                                                    value={edu.startYear}
                                                    onChange={e => handleEducationChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                                                <input
                                                    type="number"
                                                    name="endYear"
                                                    placeholder="e.g., 2022"
                                                    value={edu.endYear}
                                                    onChange={e => handleEducationChange(idx, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Availability</h2>
                        <p className="text-gray-600">Select the days you're available for work or meetings</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {AVAILABILITY_OPTIONS.map(option => (
                                <label key={option} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={form.availability.includes(option)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setForm({ ...form, availability: [...form.availability, option] });
                                            } else {
                                                setForm({ ...form, availability: form.availability.filter(a => a !== option) });
                                            }
                                        }}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 font-medium">{option}</span>
                                </label>
                            ))}
                        </div>

                        {form.availability.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-800 mb-2">Selected Days:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {form.availability.map(day => (
                                        <span key={day} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Time Credits</h2>
                        <p className="text-gray-600">Set your initial time credits for the platform</p>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Credits
                            </label>
                            <input
                                type="number"
                                name="timeCredits"
                                placeholder="Enter time credits (e.g., 100)"
                                value={form.timeCredits}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Time credits can be used for various platform activities. You can update this later.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">About Time Credits</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Time credits are a virtual currency used within the platform for various activities and services.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );


            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {totalSteps}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.number;
                            const isCurrent = currentStep === step.number;

                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="ml-3 hidden sm:block">
                                        <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div onSubmit={handleSubmit}>
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center px-6 py-3 rounded-lg font-medium ${currentStep === 1
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Previous
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStepValid(currentStep)}
                                    className={`flex items-center px-6 py-3 rounded-lg font-medium ${isStepValid(currentStep)
                                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isStepValid(currentStep)}
                                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition duration-200 ${isStepValid(currentStep) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Complete Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
