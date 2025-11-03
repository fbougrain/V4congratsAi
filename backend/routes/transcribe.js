const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios"); // for Gemini AI

const router = express.Router(); // ✅ define router
const upload = multer({ dest: "uploads/" });

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read audio file as base64
    const audioData = fs.readFileSync(filePath, { encoding: "base64" });

    // Call Gemini API
    const response = await axios.post(
      "https://gemini.googleapis.com/v1/audio:transcribe",
      {
        audio: audioData,
        language: "en"
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    fs.unlinkSync(filePath); // delete after use
    res.json({ text: response.data.text });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Transcription failed" });
  }
});
module.exports = router;