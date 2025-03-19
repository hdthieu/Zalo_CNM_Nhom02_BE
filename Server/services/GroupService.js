const group = require("../Models/Group"); 
const userService = require("../services/UserService");

exports.createGroup = async (name, adminId, memberIds) => {
    try {
        const admin = await userService.findById(adminId);
        if (!admin) {
            return { error: "Admin không tồn tại", status: 404 };
        }
        if (!Array.isArray(memberIds) || memberIds.length < 2) {
            return { error: "Cần ít nhất 2 người để có thể tạo nhóm", status: 400 };
        }
        const members = [adminId, ...memberIds];
        const newGroup = new group({ 
            name,
            members,
            admin: adminId
        });

        await newGroup.save();
        return { message: "Nhóm được tạo thành công", group: newGroup, status: 201 };
    } catch (error) {
        return { error: error.message, status: 500 };
    }
};
