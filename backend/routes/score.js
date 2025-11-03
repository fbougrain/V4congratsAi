// routes/score.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/score-answer
router.post('/score-answer', async (req, res) => {
  try {
    const { answerId, questionText, transcript } = req.body;

    if (!answerId || !questionText || !transcript) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const prompt = `
You are an AI interviewer assistant.
Rate the following answer on a scale from 1 to 10 for:
1. Relevance to the question,
2. Clarity of speech (grammar, structure),
3. Confidence and engagement.

Return only JSON like:
{ "relevance": 8, "clarity": 9, "confidence": 7, "overall": 8 }

Question: "${questionText}"
Answer: "${transcript}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    const score = JSON.parse(content);

    // Save to database
    await supabase.from('audition_answers').update({
      ai_score: score.overall,
      ai_details: score
    }).eq('id', answerId);

    res.json({
      success: true,
      message: 'AI scoring complete',
      data: score
    });

  } catch (error) {
    console.error('❌ AI scoring error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to score answer'
    });
  }
});

module.exports = router;
