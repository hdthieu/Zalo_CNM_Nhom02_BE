// const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
    const { sender, receiver, content } = req.body;
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.json({ message });
};

exports.getMessages = async (req, res) => {
    const messages = await Message.find({ receiver: req.params.userId }).populate("sender");
    res.json({ messages });
};
