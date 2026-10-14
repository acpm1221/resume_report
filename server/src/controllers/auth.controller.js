const usermodel = require("../models/use.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlackList = require("../models/blackList.model");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

async function registerController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
    const isUserAlreadyExists = await usermodel.findOne({ $or: [{ username }, { email }] });
    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "user already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await usermodel.create({ username, email, password: hash });
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({
        message: "user registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function loginController(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
    const isUserExist = await usermodel.findOne({ username });
    if (!isUserExist) {
        return res.status(400).json({ message: "user not found" });
    }
    const validPassword = await bcrypt.compare(password, isUserExist.password);
    if (!validPassword) {
        return res.status(400).json({ message: "invalid password" });
    }
    const token = jwt.sign(
        { id: isUserExist._id, username: isUserExist.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(200).json({
        message: "user logged in successfully",
        token,
        user: {
            id: isUserExist._id,
            username: isUserExist.username,
            email: isUserExist.email
        }
    });
}

async function logoutController(req, res) {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies.token || headerToken;

    if (token) {
        try {
            await tokenBlackList.create({ token });
        } catch (err) {
            console.error("Error blacklisting token:", err);
        }
    }
    res.clearCookie("token", COOKIE_OPTIONS);
    return res.status(200).json({ message: "user logged out successfully" });
}

async function profileController(req, res) {
    const user = await usermodel.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    profileController,
};