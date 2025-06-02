const { getOrCreateRoom } = require("../services/DailyService");

exports.createDailyRoom = async (req, res) => {
  try {
    const { conversationId, toUserId, fromUser } = req.body;

    if (!conversationId || !toUserId || !fromUser) {
      return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
    }

    const room = await getOrCreateRoom(conversationId);

    if (!room || !room.url) {
      return res.status(500).json({ error: "Không tạo được phòng" });
    }

    // ✅ Emit socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incomingVideoCall", {
        from: fromUser,
        roomUrl: room.url,
      });
    }

    res.json({ url: room.url });
  } catch (err) {
    console.error("❌ createDailyRoom error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
