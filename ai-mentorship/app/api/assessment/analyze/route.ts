import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    const { responses, userProfile } = await request.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
      You are a senior career strategist analyzing responses from a ${userProfile.lifeStage} interested in ${userProfile.field} with the goal of ${userProfile.goal}.
      
      User Profile: ${JSON.stringify(userProfile)}
      Assessment Responses: ${JSON.stringify(responses)}
      
      Provide a comprehensive analysis that is:
      1. HIGHLY SPECIFIC to their life stage and field
      2. References their actual responses with quotes
      3. Includes realistic timelines and salary ranges for their level
      4. Accounts for their current situation and goals
      5. Provides actionable next steps appropriate for their stage
      
      For HIGH SCHOOL STUDENTS: Focus on college preparation, major selection, early career exploration
      For COLLEGE STUDENTS: Focus on internships, skill building, entry-level career paths  
      For WORKING PROFESSIONALS: Focus on advancement, skill development, industry trends
      For CAREER CHANGERS: Focus on transferable skills, transition strategies, retraining needs
      
      Return ONLY valid JSON with NO markdown formatting:
      
      {
        "personalityProfile": {
          "type": "[Create a unique profile type based on their specific answers]",
          "description": "[300+ word analysis referencing their specific responses and life stage]",
          "strengths": ["[5-6 strengths derived from their responses]"],
          "workStyle": "[Work style analysis appropriate for their level and goals]"
        },
        "skillsAssessment": {
          "technical": [
            {"skill": "[Relevant technical skill for their field/level]", "level": [Realistic score], "growth": "[Specific development plan with timeline]"}
          ],
          "soft": [
            {"skill": "[Relevant soft skill]", "level": [Score], "growth": "[Concrete improvement strategy]"}
          ]
        },
        "careerRecommendations": [
          {
            "title": "[Specific role appropriate for their level and field]",
            "match": [Realistic percentage],
            "reasoning": "[150+ word explanation connecting their responses to role, including salary ranges and growth potential appropriate for their level]",
            "growthPath": "[Career progression path realistic for their starting point]",
            "timeToTransition": "[Timeline appropriate for their current stage]"
          }
        ],
        "actionPlan": {
          "immediate": ["[5 specific actions appropriate for their life stage and goals]"],
          "shortTerm": ["[4 strategic moves with specific outcomes for their level]"],
          "longTerm": ["[3 major milestones appropriate for their career stage]"]
        },
        "mentoringNeeds": [
          "[Specific mentor type based on their stage and goals]",
          "[Different mentorship need based on their field]"
        ]
      }
      
      Make this so personalized that it could only apply to someone with their exact profile and responses.
    `;
    
    const result = await model.generateContent(prompt);
    
    // Clean the AI response before parsing
    const rawText = result.response.text();
    console.log('Raw AI analysis response:', rawText);
    
    let cleanText = rawText
      .replace(/```/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const objStart = cleanText.indexOf('{');
    const objEnd = cleanText.lastIndexOf('}');
    
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      cleanText = cleanText.substring(objStart, objEnd + 1);
    }
    
    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Analysis JSON Parse Error:', parseError);
      
      // Enhanced fallback based on profile
      analysis = generateProfileBasedFallback(userProfile, responses);
    }
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateProfileBasedFallback(userProfile: any, responses: any[]) {
  const lifeStage = userProfile.lifeStage.toLowerCase();
  const field = userProfile.field.toLowerCase();
  const responseCount = responses.length;
  
  let profileType, description, recommendations;
  
  if (lifeStage.includes('high school')) {
    profileType = "Emerging Explorer";
    description = `As a high school student exploring ${field}, you're at an exciting stage of discovery. Your ${responseCount} thoughtful responses show curiosity and self-awareness that will serve you well in college and beyond. You demonstrate the kind of reflective thinking that helps students make informed decisions about their future paths.`;
    recommendations = [
      {
        "title": "College Major in " + field,
        "match": 85,
        "reasoning": `Based on your interest in ${field} and your thoughtful responses, this major would allow you to explore your interests while building foundational knowledge. College programs typically cost $10,000-50,000 per year, but lead to entry-level positions earning $40,000-60,000 annually.`,
        "growthPath": "College Student → Internships → Entry-level Role → Mid-level Professional",
        "timeToTransition": "4-5 years (college + early career)"
      }
    ];
  } else if (lifeStage.includes('college')) {
    profileType = "Academic Achiever";
    description = `As a college student in ${field}, your responses reveal someone who's thinking strategically about their future. You're in the perfect position to explore internships, build relevant skills, and network within your chosen field.`;
    recommendations = [
      {
        "title": "Entry-level " + field + " Role",
        "match": 88,
        "reasoning": `Your academic background in ${field} combined with your thoughtful approach to career planning positions you well for entry-level roles. These typically pay $45,000-65,000 for new graduates, with strong growth potential.`,
        "growthPath": "Graduate → Entry-level → Mid-level → Senior Professional",
        "timeToTransition": "6-12 months post-graduation"
      }
    ];
  } else {
    profileType = "Strategic Professional";
    description = `As an experienced professional interested in ${field}, your responses show the kind of strategic thinking that leads to career success. You understand the importance of continuous learning and growth in today's dynamic workplace.`;
    recommendations = [
      {
        "title": "Senior " + field + " Role",
        "match": 90,
        "reasoning": `Your professional experience combined with your interest in ${field} suggests you're ready for senior-level responsibilities. These roles typically command $80,000-120,000+ depending on location and industry.`,
        "growthPath": "Current Role → Senior Role → Leadership → Executive",
        "timeToTransition": "1-3 years with strategic skill building"
      }
    ];
  }
  
  return {
    "personalityProfile": {
      "type": profileType,
      "description": description,
      "strengths": [
        "Strategic thinking",
        "Self-awareness",
        "Growth mindset",
        "Communication skills",
        "Adaptability"
      ],
      "workStyle": "Collaborative with strong independent work capabilities"
    },
    "skillsAssessment": {
      "technical": [
        {"skill": "Analysis", "level": 75, "growth": "Continue developing through coursework and practice"},
        {"skill": "Communication", "level": 80, "growth": "Strong foundation - leverage in leadership opportunities"}
      ],
      "soft": [
        {"skill": "Leadership", "level": 70, "growth": "Seek opportunities to lead projects or teams"},
        {"skill": "Adaptability", "level": 85, "growth": "Key strength - use to navigate career transitions"}
      ]
    },
    "careerRecommendations": recommendations,
    "actionPlan": {
      "immediate": [
        "Research specific roles in " + field,
        "Update LinkedIn profile with career interests",
        "Connect with professionals in target field",
        "Identify skill gaps to address",
        "Set 90-day learning goals"
      ],
      "shortTerm": [
        "Complete relevant certification or course",
        "Gain hands-on experience through projects",
        "Build professional network in target industry",
        "Develop portfolio showcasing relevant skills"
      ],
      "longTerm": [
        "Establish expertise in specialized area",
        "Build mentor and sponsor relationships",
        "Consider advanced education if needed",
        "Develop leadership and strategic skills"
      ]
    },
    "mentoringNeeds": [
      "Industry professional in " + field + " who can provide insider perspective",
      "Career coach specializing in " + lifeStage.replace(/student|professional/, '').trim() + " transitions",
      "Peer mentor network for accountability and support"
    ]
  };
}