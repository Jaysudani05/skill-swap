const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    lowercase: true,
    unique: true,
    minlength: [3, "Username must be at least 3 character long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true, 
    minlength: [5, "Password must be at least 5 character long"],
  },
}, {
  timestamps: true
});

const user = mongoose.model("User", userSchema);

module.exports = user;
