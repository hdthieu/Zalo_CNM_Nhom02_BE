const groupService = require("../services/GroupService");

exports.createGroup = async (req, res) => {
    const { name, adminId, memberIds } = req.body;

    const result = await groupService.createGroup(name, adminId, memberIds);

    res.status(result.status).json(result);
};
