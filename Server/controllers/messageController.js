const messageService = require("../services/MessageService");

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {receiverId, content, messageType, fileUrl} = req.body;

        if(!receiverId || !content){
            return res.status(400).json({ error: "Receiver and content are required" });
        }
        const result = await messageService.sendMessage(senderId, receiverId, content, messageType, fileUrl);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    const messages = await Message.find({ receiver: req.params.userId }).populate("sender");
    res.json({ messages });
};
