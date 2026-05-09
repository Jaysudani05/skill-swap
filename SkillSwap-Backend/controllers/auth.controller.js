const User = require("../models/User.model");
const UserProfile = require("../models/UserProfile.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // checking if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User is already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create User
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // saving into DB
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", data: newUser });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

// login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid  email or password" });

    // create JWT sign
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    // Cookie options: cross-origin (Vercel→Render) requires sameSite: "none" + secure
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "strict",
      secure: isProduction,
    };

    res
      .cookie("token", token, cookieOptions)
      .json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// logout user
exports.logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res
      .clearCookie("token", {
        sameSite: isProduction ? "none" : "strict",
        secure: isProduction,
      })
      .json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAuth = async (req, res) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return res.status(401).json({ message: "No token, auth denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    // Check if profile exists
    const profile = await UserProfile.findOne({ userId: user._id });
    return res.status(200).json({ ...user.toObject(), hasProfile: !!profile });
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
