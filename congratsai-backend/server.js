const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// --- Endpoint 1: Job List ---
app.get('/api/opportunities', (req, res) => {
  const opportunities = [
    {
      id: "1",
      title: "Backend Engineer",
      company: "Vetted AI",
      location: "Remote (Global)",
      type: "Contract",
      rate: "$90/hr",
      skills: ["Node.js", "Supabase", "Express"],
      questions: [
        "Tell us about a project you are proud of.",
        "How do you structure scalable APIs?",
        "Explain a time you optimized backend performance."
      ]
    },
    {
      id: "2",
      title: "Frontend Developer",
      company: "CongratsAI",
      location: "Remote (Europe)",
      type: "Full-time",
      rate: "$70/hr",
      skills: ["React", "Tailwind", "TypeScript"],
      questions: [
        "Describe your approach to responsive design.",
        "How do you handle component state efficiently?",
        "Show us your favorite UI you built."
      ]
    },
    {
      id: "3",
      title: "ML Engineer",
      company: "VisionFlow",
      location: "Hybrid (Paris)",
      type: "Contract",
      rate: "$100/hr",
      skills: ["Python", "TensorFlow", "FastAPI"],
      questions: [
        "How do you preprocess large datasets?",
        "What’s your experience with production ML pipelines?",
        "How do you handle model versioning?"
      ]
    }
  ];

  res.json(opportunities);
});

// --- Endpoint 2: Submission Inbox ---
app.post('/api/submit-audition', upload.array('audio_files'), (req, res) => {
  console.log('Received files:', req.files);
  console.log('Received body:', req.body);

  res.status(200).json({
    success: true,
    message: "Audition submitted successfully."
  });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
