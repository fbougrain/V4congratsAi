// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const transcribeRoute = require('./routes/transcribe'); // 🆕
const scoreRoute = require('./routes/score');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', transcribeRoute); 
app.use('/api', scoreRoute);
// const app = express();
// app.use(cors());
// app.use(express.json());

// // --- Supabase client ---
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

const jwt = require("jsonwebtoken"); // ✅ your JWT import



// --- ✅ Authentication middleware ---
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store decoded user info for later use
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// --- Routes ---
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// Example protected route
app.get("/api/profile", authenticate, async (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}` });
});

// Add your audition routes below
app.get("/api/audition/evaluate/:submissionId", authenticate, async (req, res) => {
  // ... your evaluate logic here ...
});

// --- Server start ---
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Initialize Google Speech-to-Text client (optional)
// let speechClient = null;
// const googleCredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';

// if (fs.existsSync(googleCredPath)) {
//   try {
//     speechClient = new speech.SpeechClient({
//       keyFilename: googleCredPath
//     });
//     console.log('🎤 Google Speech-to-Text client initialized');
//   } catch (error) {
//     console.warn('⚠️  Failed to initialize Google Speech-to-Text client:', error.message);
//     console.warn('   Transcription will be disabled');
//   }
// } else {
//   console.warn('⚠️  Google credentials file not found at:', googleCredPath);
//   console.warn('   Transcription will be disabled. To enable:');
//   console.warn('   1. Get credentials from Google Cloud Console');
//   console.warn('   2. Save as google-credentials.json in backend folder');
//   console.warn('   3. Or set GOOGLE_APPLICATION_CREDENTIALS env var');
// }

// Initialize Supabase client (shared instance)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Successfully loaded environment variables and connected to Supabase.');
console.log(`🔑 Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'} key for backend operations`);

// app.use(cors());
// app.use(express.json());
// app.use('/api', transcribeRoute); 
// app.use('/api', scoreRoute);


// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- MOCK DATA: Dummy Opportunities ---
const DUMMY_OPPORTUNITIES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Product Role (Internal)",
    company: "Vetted AI",
    location: "Remote (Global)",
    type: "Full-time",
    rate: "N/A",
    skills: ["Product Management", "Design", "Strategy"],
    questions: [
      { question_text: "Tell us about yourself.", time_limit_seconds: 90 },
      { question_text: "Why do you want to work at Vetted AI?", time_limit_seconds: 90 },
      { question_text: "Describe a product you built from scratch.", time_limit_seconds: 120 },
      { question_text: "How do you prioritize features in a backlog?", time_limit_seconds: 90 },
      { question_text: "What's your approach to user research?", time_limit_seconds: 90 },
      { question_text: "Tell us about a challenging stakeholder situation.", time_limit_seconds: 120 },
      { question_text: "How do you measure product success?", time_limit_seconds: 90 },
      { question_text: "Describe your experience with A/B testing.", time_limit_seconds: 90 },
      { question_text: "How do you balance user needs with business goals?", time_limit_seconds: 120 },
      { question_text: "What's your product development process?", time_limit_seconds: 90 },
      { question_text: "How do you handle conflicting feedback?", time_limit_seconds: 90 },
      { question_text: "Describe a failed product and what you learned.", time_limit_seconds: 120 },
      { question_text: "How do you work with engineering teams?", time_limit_seconds: 90 },
      { question_text: "What product management tools do you use?", time_limit_seconds: 60 },
      { question_text: "Why product management at Vetted AI?", time_limit_seconds: 90 }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Senior Backend Engineer",
    company: "CongratsAI",
    location: "Remote (Europe)",
    type: "Contract",
    rate: "$90-120/hr",
    skills: ["Node.js", "PostgreSQL", "Express", "Supabase", "TypeScript"],
    questions: [
      { question_text: "Introduce yourself and your background.", time_limit_seconds: 90 },
      { question_text: "What's your experience with Node.js at scale?", time_limit_seconds: 120 },
      { question_text: "Explain how you design RESTful APIs.", time_limit_seconds: 90 },
      { question_text: "How do you handle database optimization?", time_limit_seconds: 120 },
      { question_text: "Describe a challenging performance issue you solved.", time_limit_seconds: 120 },
      { question_text: "How do you approach microservices architecture?", time_limit_seconds: 90 },
      { question_text: "What's your experience with PostgreSQL?", time_limit_seconds: 90 },
      { question_text: "How do you handle authentication and authorization?", time_limit_seconds: 90 },
      { question_text: "Describe your testing strategy.", time_limit_seconds: 90 },
      { question_text: "How do you ensure API security?", time_limit_seconds: 120 },
      { question_text: "What's your experience with real-time systems?", time_limit_seconds: 90 },
      { question_text: "How do you handle errors and logging?", time_limit_seconds: 90 },
      { question_text: "Describe your deployment process.", time_limit_seconds: 90 },
      { question_text: "What's your experience with TypeScript?", time_limit_seconds: 60 },
      { question_text: "Why do you want to work with CongratsAI?", time_limit_seconds: 90 }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "ML Engineer (Computer Vision)",
    company: "VisionFlow AI",
    location: "Hybrid (Paris)",
    type: "Full-time",
    rate: "€80-100/hr",
    skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "Docker"],
    questions: [
      { question_text: "Tell us about your background in machine learning.", time_limit_seconds: 90 },
      { question_text: "What computer vision projects have you worked on?", time_limit_seconds: 120 },
      { question_text: "Explain your approach to model training.", time_limit_seconds: 120 },
      { question_text: "How do you handle imbalanced datasets?", time_limit_seconds: 90 },
      { question_text: "Describe your experience with deep learning frameworks.", time_limit_seconds: 90 },
      { question_text: "How do you optimize model performance?", time_limit_seconds: 120 },
      { question_text: "What's your experience with object detection?", time_limit_seconds: 90 },
      { question_text: "How do you handle data augmentation?", time_limit_seconds: 90 },
      { question_text: "Describe your model deployment experience.", time_limit_seconds: 120 },
      { question_text: "How do you evaluate model accuracy?", time_limit_seconds: 90 },
      { question_text: "What's your experience with transfer learning?", time_limit_seconds: 90 },
      { question_text: "How do you handle overfitting?", time_limit_seconds: 90 },
      { question_text: "Describe your data preprocessing pipeline.", time_limit_seconds: 90 },
      { question_text: "What hardware do you prefer for training?", time_limit_seconds: 60 },
      { question_text: "Why VisionFlow AI?", time_limit_seconds: 90 }
    ]
  }
];

// --- Endpoint 1: Job List (Mock Data) ---
app.get('/api/opportunities', async (req, res) => {
  try {
    console.log(`✅ Returning ${DUMMY_OPPORTUNITIES.length} mock opportunities`);
    res.json(DUMMY_OPPORTUNITIES);
  } catch (error) {
    console.error('❌ Error in /api/opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities'
    });
  }
});

// --- NEW Endpoint 2: Per-Question Answer Submission ---
//const fs = require('fs');

// const fs = require('fs');
// const express = require('express');
// const multer = require('multer');
// const supabase = require('./supabaseClient'); // your supabase client
// const { TextAudioModel } = require('@google/genai'); // Gemini

// const upload = multer({ storage: multer.memoryStorage() });

// const app = express();
// // app.use(express.json());
// const genai = require('@google/genai');

// // Initialize Gemini model
// const geminiModel = genai.models.get('textaudio-gecko-001');
// Remove this incorrect code:
// const genai = require('@google/genai');
// const geminiModel = genai.models.get('textaudio-gecko-001');

// // Replace with this correct initialization:
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // Initialize Gemini client with API key
// const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model
// const geminiModel = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
// ------------------ Submit Answer Endpoint ------------------

// Initialize Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini at the top of your file (after other initializations)
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized for transcription');
  } catch (error) {
    console.warn('⚠️  Failed to initialize Gemini:', error.message);
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not found in .env');
}

// In your submit-answer endpoint:
app.post('/api/audition/submit-answer', upload.single('audio_file'), async (req, res) => {
  try {
    const { opportunityId, userId, questionId, questionText } = req.body;

    if (!opportunityId || !userId || !questionId || !questionText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const file = req.file;
    const timestamp = Date.now();
    const filePath = `answers/${userId}/${opportunityId}/${questionId}_${timestamp}.mp3`;

    // Upload audio to Supabase
    const { error: uploadError } = await supabase.storage
      .from('audition-recordings')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new Error(`Failed to upload audio: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('audition-recordings')
      .getPublicUrl(filePath);

    // ------------------ Transcription with Gemini ------------------
    let transcript = '';
    
    if (geminiModel) {
      console.log('🎤 Transcribing audio with Gemini...');
      
      try {
        // Convert buffer to base64
        const audioBase64 = file.buffer.toString('base64');
        
        // Prepare the request with audio and prompt
        const result = await geminiModel.generateContent([
          {
            inlineData: {
              data: audioBase64,
              mimeType: file.mimetype // 'audio/mpeg' for MP3
            }
          },
          "Please transcribe this audio recording word for word. Only provide the transcription, no additional commentary."
        ]);
        
        const response = await result.response;
        transcript = response.text() || '[No speech detected]';
        
        console.log(`✅ Transcription complete: "${transcript.substring(0, 100)}..."`);
        
      } catch (transcriptionError) {
        console.error('⚠️  Transcription failed:', transcriptionError);
        transcript = `[Transcription failed: ${transcriptionError.message}]`;
      }
    } else {
      console.log('⏭️  Skipping transcription (Gemini not configured)');
      transcript = '[Transcription disabled - Gemini API key not configured]';
    }

    // Save to DB
    const { data: answerData, error: dbError } = await supabase
      .from('audition_answers')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        question_id: questionId,
        question_text: questionText,
        audio_url: publicUrl,
        audio_path: filePath,
        transcript: transcript,
        submitted_at: new Date().toISOString()
      })
      .select();

    if (dbError) throw new Error(`Failed to save answer: ${dbError.message}`);

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answerId: answerData[0].id,
        audioUrl: publicUrl,
        transcript,
        questionId
      }
    });

  } catch (error) {
    console.error('❌ Error in submit-answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ✅ Server start
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Endpoint 4: Submit Survey Feedback ---
app.post('/api/audition/submit-survey', async (req, res) => {
  try {
    console.log('📊 Received survey submission');
    
    // Get data from request body
    const { submissionId, rating, reason, feedbackText } = req.body;
    
    console.log(`  └─ Submission ID: ${submissionId}`);
    console.log(`  └─ Rating: ${rating}/5`);
    console.log(`  └─ Reason: ${reason}`);
    
    // Validate required fields
    if (!submissionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: submissionId and rating are required'
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Prepare update data
    const updateData = {
      rating: rating,
      feedback_reason: reason || null,
      feedback_text: feedbackText || null,
    };
    
    // CRITICAL: If reason is "technical", flag for technical review
    if (reason === "technical") {
      updateData.status = 'pending_technical_review';
      console.log('  └─ 🔧 Flagging for technical review');
    }
    
    console.log('💾 Updating submission with survey data...');
    
    // Update the submission in database
    const { data: submissionData, error: updateError } = await supabase
      .from('audition_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw new Error(`Failed to save survey: ${updateError.message}`);
    }
    
    if (!submissionData || submissionData.length === 0) {
      throw new Error('Submission not found');
    }
    
    console.log(`✅ Survey saved successfully for submission ${submissionId}`);
    
    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Survey submitted successfully',
      data: {
        submissionId: submissionId,
        rating: rating,
        flaggedForTechnicalReview: reason === "technical"
      }
    });
    
  } catch (error) {
    console.error('❌ Error in submit-survey:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process survey submission'
    });
  }
});

// --- Endpoint 5: Get Submission Details with Answers ---
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    console.log(`📥 Fetching submission details for ID: ${submissionId}`);

    // Fetch the main submission record
    const { data: submission, error: submissionError } = await supabase
      .from('audition_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      console.error('❌ Error fetching submission:', submissionError);
      
      // Handle "not found" error specifically
      if (submissionError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }
      
      throw new Error(`Failed to fetch submission: ${submissionError.message}`);
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    console.log(`✅ Submission found`);
    console.log(`  └─ Opportunity ID: ${submission.opportunity_id}`);
    console.log(`  └─ Status: ${submission.status}`);

    // Fetch all answers for this submission (by matching user_id and opportunity_id)
    const { data: answers, error: answersError } = await supabase
      .from('audition_answers')
      .select('id, question_id, question_text, audio_url, transcript, submitted_at')
      .eq('user_id', submission.user_id)
      .eq('opportunity_id', submission.opportunity_id)
      .order('submitted_at', { ascending: true });

    if (answersError) {
      console.error('❌ Error fetching answers:', answersError);
      throw new Error(`Failed to fetch answers: ${answersError.message}`);
    }

    console.log(`✅ Found ${answers?.length || 0} answers`);

    // Fetch opportunity details to include title, company, etc.
    const opportunity = DUMMY_OPPORTUNITIES.find(opp => opp.id === submission.opportunity_id);

    // Combine data into one response object
    const responseData = {
      id: submission.id,
      userId: submission.user_id,
      opportunityId: submission.opportunity_id,
      
      // Opportunity details (from mock data)
      title: opportunity?.title || 'Unknown Position',
      company: opportunity?.company || 'Unknown Company',
      location: opportunity?.location || 'Unknown Location',
      type: opportunity?.type || 'Full-time',
      rate: opportunity?.rate || 'N/A',
      
      // Submission details
      status: submission.status,
      submittedAt: submission.submitted_at,
      durationSeconds: submission.duration_seconds,
      
      // Survey feedback (if provided)
      rating: submission.rating,
      feedbackReason: submission.feedback_reason,
      feedbackText: submission.feedback_text,
      
      // Questions metadata (stored in submission)
      questions: submission.questions || [],
      
      // All answers with audio
      answers: answers.map(answer => ({
        id: answer.id,
        questionId: answer.question_id,
        questionText: answer.question_text,
        audioUrl: answer.audio_url,
        transcript: answer.transcript,
        submittedAt: answer.submitted_at
      }))
    };

    console.log(`✅ Sending complete submission data with ${responseData.answers.length} answers`);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error in /api/submissions/:id:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch submission details'
    });
  }
});

// --- Endpoint 6: Get All Submissions for a User ---
app.get('/api/submissions', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId query parameter is required'
      });
    }

    console.log(`📥 Fetching all submissions for user: ${userId}`);

    // Fetch all submissions for the user
    const { data: submissions, error: submissionsError } = await supabase
      .from('audition_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('❌ Error fetching submissions:', submissionsError);
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    console.log(`✅ Found ${submissions?.length || 0} submissions`);

    // Enrich each submission with opportunity details
    const enrichedSubmissions = submissions.map(submission => {
      const opportunity = DUMMY_OPPORTUNITIES.find(opp => opp.id === submission.opportunity_id);
      
      return {
        id: submission.id,
        title: opportunity?.title || 'Unknown Position',
        company: opportunity?.company || 'Unknown Company',
        location: opportunity?.location || 'Unknown Location',
        type: opportunity?.type || 'Full-time',
        rate: opportunity?.rate || 'N/A',
        status: submission.status,
        submittedAt: submission.submitted_at,
        opportunityId: submission.opportunity_id,
        durationSeconds: submission.duration_seconds,
        rating: submission.rating
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedSubmissions
    });

  } catch (error) {
    console.error('❌ Error in /api/submissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch submissions'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   GET  /api/opportunities`);
  console.log(`   POST /api/audition/submit-answer`);
  console.log(`   POST /api/audition/create-submission`);
  console.log(`   POST /api/audition/submit-survey`);
  console.log(`   GET  /api/submissions/:id`);
  console.log(`   GET  /api/submissions?userId=<id>`);
  console.log(`   POST /api/transcribe  <-- 🆕 Whisper Transcription Endpoint`);

});
