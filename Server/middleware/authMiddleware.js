const jwt = require('jsonwebtoken');
const userService = require('../services/UserService');

exports.authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).json({ error: "Access denied. No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userService.findById(decoded._id).select("-password");
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
}