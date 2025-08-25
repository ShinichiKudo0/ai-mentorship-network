import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    const { userProfile, responses, currentQuestionIndex } = await request.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    if (currentQuestionIndex === 0) {
      const prompt = `
        You are an expert career counselor. Generate 3 career assessment questions that are perfectly tailored to someone with this profile:
        
        Life Stage: ${userProfile.lifeStage}
        Field/Interest: ${userProfile.field}
        Goal: ${userProfile.goal}
        
        CRITICAL: Use only "multiple_choice" and "text" as type values (no underscores, no escaping)
        
        ADAPTATION RULES:
        - For HIGH SCHOOL STUDENTS: Focus on subjects, interests, learning styles, future aspirations, school projects
        - For COLLEGE STUDENTS: Focus on studies, internships, extracurriculars, post-graduation plans, academic projects  
        - For WORKING PROFESSIONALS: Focus on work experiences, challenges, skills, career satisfaction, achievements
        - For CAREER CHANGERS: Focus on motivations for change, transferable skills, new interests, transition goals
        
        IMPORTANT: Return ONLY valid JSON array with NO markdown formatting, NO escaped characters.
        
        Format exactly like this:
        [
          {
            "id": 1,
            "question": "Your contextually appropriate question here",
            "type": "multiple_choice",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
          },
          {
            "id": 2,
            "question": "Another contextually appropriate question",
            "type": "text",
            "placeholder": "Helpful placeholder for their context"
          }
        ]
      `;
      
      const result = await model.generateContent(prompt);
      
      // 🔧 ENHANCED: Better cleaning with escape character handling
      const rawText = result.response.text();
      console.log('Raw AI response:', rawText);
      
      let cleanText = rawText
        .replace(/```\s*/g, '')
        .replace(/\\\_/g, '_') // Fix escaped underscores
        .replace(/\\\"/g, '"') // Fix escaped quotes
        .replace(/\\\\/g, '\\') // Fix double escapes
        .trim();
      
      // Find JSON boundaries
      const jsonStart = Math.min(
        cleanText.indexOf('[') === -1 ? Infinity : cleanText.indexOf('['),
        cleanText.indexOf('{') === -1 ? Infinity : cleanText.indexOf('{')
      );
      if (jsonStart !== Infinity && jsonStart > 0) {
        cleanText = cleanText.substring(jsonStart);
      }
      
      const jsonEnd = Math.max(
        cleanText.lastIndexOf(']'),
        cleanText.lastIndexOf('}')
      );
      if (jsonEnd !== -1 && jsonEnd < cleanText.length - 1) {
        cleanText = cleanText.substring(0, jsonEnd + 1);
      }
      
      console.log('Cleaned text for parsing:', cleanText);
      
      let questions;
      try {
        questions = JSON.parse(cleanText);
        
        // 🔧 NEW: Validate and fix question types
        questions = questions.map((q: any) => ({
          ...q,
          type: q.type === 'multiple_choice' || q.type === 'multiple\_choice' ? 'multiple_choice' : 'text'
        }));
        
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Failed to parse:', cleanText);
        
        // Adaptive fallback questions based on profile
        questions = generateFallbackQuestions(userProfile);
      }
      
      return NextResponse.json({ questions });
    } else {
      // Generate next contextual question
      const prompt = `
        Based on this user profile and their previous responses, generate the next insightful question:
        
        User Profile:
        - Life Stage: ${userProfile.lifeStage}
        - Field: ${userProfile.field}
        - Goal: ${userProfile.goal}
        
        Previous Responses: ${JSON.stringify(responses)}
        
        CRITICAL: Use only "multiple_choice" or "text" as type values (no escaping, no underscores with backslashes)
        
        IMPORTANT: Return ONLY valid JSON object with NO markdown formatting.
        
        Format exactly like this:
        {
          "id": ${currentQuestionIndex + 1},
          "question": "Contextual follow-up question based on their profile and previous answers",
          "type": "multiple_choice",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
        }
        
        OR for text:
        
        {
          "id": ${currentQuestionIndex + 1},
          "question": "Contextual follow-up question",
          "type": "text",
          "placeholder": "Relevant placeholder text"
        }
      `;
      
      const result = await model.generateContent(prompt);
      
      const rawText = result.response.text();
      console.log('Raw AI response for next question:', rawText);
      
      let cleanText = rawText
        .replace(/```\s*/g, '')
        .replace(/\\\_/g, '_') // Fix escaped underscores
        .replace(/\\\"/g, '"') // Fix escaped quotes
        .replace(/\\\\/g, '\\') // Fix double escapes
        .trim();
      
      const objStart = cleanText.indexOf('{');
      const objEnd = cleanText.lastIndexOf('}');
      
      if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
        cleanText = cleanText.substring(objStart, objEnd + 1);
      }
      
      console.log('Cleaned next question text:', cleanText);
      
      let question;
      try {
        question = JSON.parse(cleanText);
        
        // 🔧 NEW: Validate and fix question type
        if (question.type === 'multiple\_choice') {
          question.type = 'multiple_choice';
        }
        
      } catch (parseError) {
        console.error('JSON Parse Error for next question:', parseError);
        console.error('Failed to parse:', cleanText);
        
        // Adaptive fallback
        question = generateFallbackNextQuestion(userProfile, currentQuestionIndex);
      }
      
      return NextResponse.json({ question });
    }
  } catch (error) {
    console.error('Assessment API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateFallbackQuestions(userProfile: any) {
  const lifeStage = userProfile.lifeStage.toLowerCase();
  
  if (lifeStage.includes('high school')) {
    return [
      {
        "id": 1,
        "question": "Which school subjects do you find most engaging and why?",
        "type": "multiple_choice",
        "options": ["STEM subjects (Math, Science, Engineering)", "Humanities (English, History, Social Studies)", "Creative subjects (Art, Music, Drama)", "Practical subjects (Business, Technology, Life Skills)"]
      },
      {
        "id": 2,
        "question": "Describe a school project or activity you're proud of. What did you enjoy most about it?",
        "type": "text",
        "placeholder": "Think about what aspects excited you - the research, creativity, teamwork, problem-solving..."
      },
      {
        "id": 3,
        "question": "When working on group projects, what role do you naturally take?",
        "type": "multiple_choice",
        "options": ["The organizer who keeps everyone on track", "The creative idea generator", "The researcher who finds information", "The presenter who communicates findings"]
      }
    ];
  } else if (lifeStage.includes('college') || lifeStage.includes('student')) {
    return [
      {
        "id": 1,
        "question": "What initially drew you to your current field of study?",
        "type": "text",
        "placeholder": "Consider your motivations, interests, or experiences that influenced your choice..."
      },
      {
        "id": 2,
        "question": "Which aspects of your studies do you find most engaging?",
        "type": "multiple_choice",
        "options": ["Theoretical concepts and research", "Practical applications and hands-on work", "Collaborative projects and teamwork", "Independent study and analysis"]
      },
      {
        "id": 3,
        "question": "How do you envision applying your studies in the real world after graduation?",
        "type": "text",
        "placeholder": "Think about specific roles, industries, or ways you'd like to make an impact..."
      }
    ];
  } else {
    return [
      {
        "id": 1,
        "question": "What aspects of your current work give you the most satisfaction?",
        "type": "multiple_choice",
        "options": ["Solving complex problems", "Leading and mentoring others", "Creating something new", "Making a positive impact"]
      },
      {
        "id": 2,
        "question": "Describe a significant challenge you've overcome in your career. What skills did you use?",
        "type": "text",
        "placeholder": "Focus on the situation, your actions, and the skills that helped you succeed..."
      },
      {
        "id": 3,
        "question": "How do you prefer to collaborate with colleagues?",
        "type": "multiple_choice",
        "options": ["Leading cross-functional teams", "Contributing expertise to group efforts", "Mentoring and developing others", "Working independently with occasional check-ins"]
      }
    ];
  }
}

function generateFallbackNextQuestion(userProfile: any, questionIndex: number) {
  const questions = [
    {
      "id": questionIndex + 1,
      "question": "What type of work environment helps you perform at your best?",
      "type": "multiple_choice",
      "options": ["Fast-paced and dynamic", "Structured and organized", "Creative and flexible", "Collaborative and social"]
    },
    {
      "id": questionIndex + 1,
      "question": "When facing a difficult decision, what approach do you typically take?",
      "type": "multiple_choice",
      "options": ["Analyze data and research thoroughly", "Seek input from others", "Trust your intuition", "Consider long-term impact"]
    },
    {
      "id": questionIndex + 1,
      "question": "What motivates you most in your career journey?",
      "type": "text",
      "placeholder": "Consider what drives you - impact, growth, recognition, stability, creativity..."
    }
  ];
  
  return questions[questionIndex % questions.length];
}