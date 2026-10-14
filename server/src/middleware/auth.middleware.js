const jwt = require("jsonwebtoken");
const blackListToken = require("../models/blackList.model");

async function authUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "token not provided"
        });
    }

    const isTokenBlacklisted = await blackListToken.findOne({ token });
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token blacklisted"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "invalid token"
        });
    }
}

module.exports = authUser;
module.exports.authUser = authUser;
