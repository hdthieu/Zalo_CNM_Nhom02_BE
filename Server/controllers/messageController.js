const MessageService = require("../services/MessageService");

exports.sendMessage = async (req, res) => {
    const { sender, receiver, content, messageType, fileUrl } = req.body;

    const result = await MessageService.sendMessage(sender, receiver, content, messageType, fileUrl);
    
    res.status(result.status).json(result);
};

exports.getMessages = async (req, res) => {
    const { userId, friendId } = req.params;

    const result = await MessageService.getMessages(userId, friendId);
    
    res.status(result.status).json(result);
};
