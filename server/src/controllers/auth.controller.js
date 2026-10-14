const usermodel = require("../models/use.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlackList = require("../models/blackList.model")

async function registerController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "all fields are required" })
    }
    const isUserAlreadyExists = await usermodel.findOne({ $or: [{ username }, { email }] });
    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "user already exists" })
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await usermodel.create({ username, email, password: hash });
    const token = jwt.sign(
        { id: user._id, username: user.username },

        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(201).json({
        message: "user registered successfully",
        user: {
            id: user._id,
            username: user.username
        }
    })
}

async function loginController(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "all fields are required" })
    }
    const isUserExist = await usermodel.findOne({ username });
    if (!isUserExist) {
        return res.status(400).json({ message: "user not found" })
    }
    const validPassword = await bcrypt.compare(password, isUserExist.password);
    if (!validPassword) {
        return res.status(400).json({ message: "invalid password" })
    }
    const token = jwt.sign(
        { id: isUserExist._id, username: isUserExist.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
    res.cookie("token", token)
    res.status(201).json({ message: "user logged in successfully", user: { id: isUserExist._id, username: isUserExist.username } })
}

async function logoutController(req, res) {
    const token = req.cookies.token;
    if (token) {
        await tokenBlackList.create({ token })

    }
    res.clearCookie("token");
    return res.status(200).json({ message: "user logged out successfully" })
}

async function profileController(req, res) {
    const user = await usermodel.findById(req.user.id)
    res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


module.exports = {
    registerController,
    loginController,
    logoutController,
    profileController,

};