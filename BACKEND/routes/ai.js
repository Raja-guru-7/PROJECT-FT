const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

router.post('/chat-stream', auth, async (req, res) => {
  try {
    // Headers for Server-Sent Events (Streaming)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Clean the API Key from .env
    const rawKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawKey.replace(/['"]/g, '').trim();

    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ text: "[SYSTEM ERROR]: GEMINI_API_KEY missing in .env!" })}\n\n`);
      return res.end();
    }

    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      res.write(`data: ${JSON.stringify({ text: "Please say something." })}\n\n`);
      return res.end();
    }

    // 🚀 STEP 1: Auto-Detect Allowed Model for your specific API Key
    const checkModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelList = await checkModels.json();

    let targetModel = "gemini-1.5-flash"; // Default backup

    if (modelList && modelList.models) {
      const valid = modelList.models.find(m =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        m.name.includes("flash")
      ) || modelList.models.find(m => m.supportedGenerationMethods?.includes("generateContent"));

      if (valid) {
        targetModel = valid.name.replace('models/', '');
        console.log("🔥 AI Assistant using model:", targetModel);
      }
    }

    // 🚀 STEP 2: Custom System Instruction for AroundU
    let promptString = `You are the "AroundU Concierge", a smart and helpful AI for AroundU. 
    AroundU is a peer-to-peer asset sharing platform. 
    Focus on helping users with rentals, smart escrow, and PeerShare details. 
    Keep responses concise and professional.\n\n`;

    messages.forEach(m => {
      const roleName = m.role === 'user' ? 'User' : 'AroundU Concierge';
      promptString += `${roleName}: ${m.content}\n`;
    });
    promptString += "AroundU Concierge: ";

    // 🚀 STEP 3: Generate Content Stream
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: targetModel });
    const result = await model.generateContentStream(promptString);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("AI Error:", error.message);
    const safeError = error.message ? error.message.replace(/"/g, "'") : "Unknown Error";
    res.write(`data: ${JSON.stringify({ text: `\n\n[API Error]: ${safeError}` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;