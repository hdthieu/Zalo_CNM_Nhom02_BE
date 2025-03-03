const userService = require("../services/UserService");

exports.checkUser = async (req, res) => {
    try {
        const { username } = req.params;
        const exists = await userService.checkUserExists(username);
        res.json({ exists });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.userId);
        res.json({ user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ users });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
