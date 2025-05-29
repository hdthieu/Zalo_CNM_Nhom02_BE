const axios = require("axios");
const DAILY_API_KEY = process.env.DAILY_API_KEY;

async function getOrCreateRoom(conversationId) {
  const roomName = `chat-${conversationId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DAILY_API_KEY}`,
  };

  try {
    const getRes = await axios.get(`https://api.daily.co/v1/rooms/${roomName}`, { headers });
    console.log("✅ Created room:", getRes.data);
    return getRes.data;

  } catch (err) {
    if (err.response && err.response.status !== 404) {
      throw new Error(`Daily GET room error: ${err.response.data.error}`);
    }
  }

  const createRes = await axios.post(
    "https://api.daily.co/v1/rooms",
    {
      name: roomName,
      properties: {
        enable_screenshare: true,
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
        lang: "en",
      },
    },
    { headers }
  );
  console.log("✅ Room created:", createRes.data);
  return createRes.data;
}

module.exports = { getOrCreateRoom }; // ✅ required
