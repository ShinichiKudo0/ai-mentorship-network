'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalysisResult {
  personalityProfile: {
    type: string;
    description: string;
    strengths: string[];
    workStyle: string;
  };
  skillsAssessment: {
    technical: Array<{skill: string; level: number; growth: string}>;
    soft: Array<{skill: string; level: number; growth: string}>;
  };
  careerRecommendations: Array<{
    title: string;
    match: number;
    reasoning: string;
    growthPath: string;
    timeToTransition: string;
  }>;
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  mentoringNeeds: string[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedResults = localStorage.getItem('assessmentResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      router.push('/assessment');
    }
  }, [router]);

  // 🔧 FIX: Download Report Functionality
  const handleDownloadReport = async () => {
    if (!results) return;
    
    setDownloading(true);
    try {
      // Create a comprehensive HTML report
      const reportHtml = generateReportHTML(results);
      
      // Create a blob with the HTML content
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `AI_Career_Analysis_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const generateReportHTML = (data: AnalysisResult): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Career Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 40px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; border-left: 4px solid #6366f1; padding-left: 15px; }
        .section h3 { color: #374151; font-size: 18px; margin-bottom: 10px; }
        .skill-bar { background: #e5e7eb; height: 8px; border-radius: 4px; margin: 8px 0; }
        .skill-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #6366f1, #3b82f6); }
        .recommendation { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .match-score { font-size: 24px; font-weight: bold; color: #6366f1; }
        ul { list-style: none; padding: 0; }
        li { margin: 8px 0; padding-left: 20px; position: relative; }
        li:before { content: "✓"; color: #10b981; font-weight: bold; position: absolute; left: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #1f2937; margin: 0;">AI Career Analysis Report</h1>
            <p style="color: #6b7280; margin: 10px 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
            <h2>🧠 Your Personality Profile</h2>
            <h3>${data.personalityProfile.type}</h3>
            <p>${data.personalityProfile.description}</p>
            <h4>Key Strengths:</h4>
            <ul>
                ${data.personalityProfile.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
            <h4>Work Style:</h4>
            <p>${data.personalityProfile.workStyle}</p>
        </div>
        
        <div class="section">
            <h2>📊 Skills Assessment</h2>
            <h3>Technical Skills</h3>
            ${data.skillsAssessment.technical.map(skill => `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${skill.skill}</span>
                        <span style="font-weight: bold; color: #6366f1;">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width: ${skill.level}%;"></div>
                    </div>
                    <small style="color: #6b7280;">${skill.growth}</small>
                </div>
            `).join('')}
            
            <h3>Soft Skills</h3>
            ${data.skillsAssessment.soft.map(skill => `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${skill.skill}</span>
                        <span style="font-weight: bold; color: #3b82f6;">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width: ${skill.level}%; background: linear-gradient(90deg, #3b82f6, #10b981);"></div>
                    </div>
                    <small style="color: #6b7280;">${skill.growth}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>🎯 Top Career Recommendations</h2>
            ${data.careerRecommendations.map(career => `
                <div class="recommendation">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="margin: 0;">${career.title}</h3>
                        <span class="match-score">${career.match}%</span>
                    </div>
                    <p>${career.reasoning}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div>
                            <strong>Growth Path:</strong><br>
                            <small>${career.growthPath}</small>
                        </div>
                        <div>
                            <strong>Time to Transition:</strong><br>
                            <small>${career.timeToTransition}</small>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>🚀 Your Action Plan</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div>
                    <h3 style="color: #6366f1;">Immediate (Next 30 days)</h3>
                    <ul>
                        ${data.actionPlan.immediate.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 style="color: #3b82f6;">Short-term (3-6 months)</h3>
                    <ul>
                        ${data.actionPlan.shortTerm.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 style="color: #10b981;">Long-term (6+ months)</h3>
                    <ul>
                        ${data.actionPlan.longTerm.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🤝 Mentoring Needs</h2>
            <ul>
                ${data.mentoringNeeds.map(need => `<li>${need}</li>`).join('')}
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
                Generated by AI Mentorship Network<br>
                This report is personalized based on your assessment responses.
            </p>
        </div>
    </div>
</body>
</html>`;
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ai-purple"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI Career Analysis
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Personalized insights to accelerate your career growth
          </p>
        </div>

        {/* Personality Profile */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-white">🧠</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Personality Profile</h2>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">
              {results.personalityProfile.type}
            </h3>
            <p className="text-gray-800 mb-4 leading-relaxed">
              {results.personalityProfile.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Key Strengths:</h4>
                <ul className="space-y-2">
                  {results.personalityProfile.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-gray-800">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Work Style:</h4>
                <p className="text-gray-800">{results.personalityProfile.workStyle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Assessment */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-white">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Skills Assessment</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Technical Skills</h3>
              {results.skillsAssessment.technical.map((skill, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{skill.skill}</span>
                    <span className="text-purple-600 font-bold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{skill.growth}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Soft Skills</h3>
              {results.skillsAssessment.soft.map((skill, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{skill.skill}</span>
                    <span className="text-blue-600 font-bold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{skill.growth}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-white">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Top Career Recommendations</h2>
          </div>
          
          <div className="space-y-6">
            {results.careerRecommendations.map((career, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {career.title}
                  </h3>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {career.match}%
                    </div>
                    <div className="text-sm text-gray-600">Match</div>
                  </div>
                </div>
                <p className="text-gray-800 mb-4 leading-relaxed">{career.reasoning}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Growth Path:</h4>
                    <p className="text-sm text-gray-700">{career.growthPath}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Time to Transition:</h4>
                    <p className="text-sm text-gray-700">{career.timeToTransition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-white">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Action Plan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">
                Immediate (Next 30 days)
              </h3>
              <ul className="space-y-3">
                {results.actionPlan.immediate.map((action, index) => (
                  <li key={index} className="flex items-start text-gray-800">
                    <span className="text-purple-500 mr-3 text-lg flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Short-term (3-6 months)
              </h3>
              <ul className="space-y-3">
                {results.actionPlan.shortTerm.map((action, index) => (
                  <li key={index} className="flex items-start text-gray-800">
                    <span className="text-blue-500 mr-3 text-lg flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Long-term (6+ months)
              </h3>
              <ul className="space-y-3">
                {results.actionPlan.longTerm.map((action, index) => (
                  <li key={index} className="flex items-start text-gray-800">
                    <span className="text-green-500 mr-3 text-lg flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-ai-purple to-ai-blue rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Action?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with expert mentors who can guide your journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleDownloadReport}
              disabled={downloading}
              className="bg-white text-ai-purple px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ai-purple"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Download Report</span>
                </>
              )}
            </button>
            <Link href="/mentors" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-ai-purple transition-all">
              🤝 Find My Mentor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}