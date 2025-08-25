'use client';
import { useUser } from '@clerk/nextjs';
import {
  SignedIn,
  SignedOut,
  SignUpButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ai-purple"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName}! 
                  <span className="inline-block ml-3 animate-bounce">🎉</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Your AI-powered career development journey continues...
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Assessment Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Journey Progress</h3>
                <span className="text-sm text-gray-500">Start your assessment below</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl text-white">🎯</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Career Assessment</p>
                  <p className="text-xs text-gray-500">Take your first step</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gray-300 rounded-full opacity-20"></div>
                    <div className="relative bg-gray-300 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl text-gray-500">🤝</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Mentor Matching</p>
                  <p className="text-xs text-gray-500">After assessment</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gray-300 rounded-full opacity-20"></div>
                    <div className="relative bg-gray-300 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl text-gray-500">📈</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Growth Plan</p>
                  <p className="text-xs text-gray-500">Personalized roadmap</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Career Assessment Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-white">🎯</span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    START HERE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Career Assessment</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Discover your unique strengths, ideal career paths, and personalized next steps with our intelligent assessment system.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Adaptive questions based on your background</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Comprehensive personality & skills analysis</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Personalized career recommendations</span>
                  </div>
                </div>
                <Link href="/assessment">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                    Start Assessment →
                  </button>
                </Link>
              </div>
            </div>

            {/* Find Mentors Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-white">🤝</span>
                  </div>
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Mentors</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with industry professionals who can guide your career journey with real-world experience and insights.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Curated network of verified professionals</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>AI-powered mentor matching</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Structured guidance sessions</span>
                  </div>
                </div>
                <button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  Available After Assessment
                </button>
              </div>
            </div>

            {/* Growth Plan Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-white">📈</span>
                  </div>
                  <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Growth Roadmap</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Receive a personalized action plan with concrete steps, milestones, and resources to achieve your career goals.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Step-by-step career roadmaps</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Progress tracking and milestones</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Curated learning resources</span>
                  </div>
                </div>
                <button 
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  Available After Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Get Started CTA */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Discover Your Career Path?</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Take the first step towards a more fulfilling career with our AI-powered assessment.
            </p>
            <Link href="/assessment">
              <button className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg">
                Start Your Assessment Now 🚀
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Professional Landing Page for Non-Signed-In Users
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20 lg:py-28">
          <div className="mb-8">
            <span className="bg-gradient-to-r from-ai-purple to-ai-blue text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
              🚀 The Future of Career Development
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where <span className="bg-gradient-to-r from-ai-purple to-ai-blue bg-clip-text text-transparent">
              Human Wisdom
            </span><br />
            Meets <span className="bg-gradient-to-r from-ai-blue to-ai-green bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            The first platform to combine AI-powered career assessment with real industry mentorship. 
            Get personalized guidance that adapts to your unique background, goals, and aspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <SignUpButton>
              <button className="bg-gradient-to-r from-ai-purple to-ai-blue hover:from-ai-purple hover:to-ai-blue text-white font-bold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Start Free Assessment
              </button>
            </SignUpButton>
            <button className="bg-white text-gray-700 font-semibold text-lg px-10 py-5 rounded-xl border-2 border-gray-300 hover:border-ai-purple hover:text-ai-purple transition-all duration-300 shadow-md hover:shadow-lg">
              Learn More
            </button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 text-sm font-medium">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              No Credit Card Required
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              5-Minute Assessment
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Instant Results
            </span>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="py-20 bg-white rounded-3xl shadow-xl mb-20 border border-gray-100">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Career Development Challenge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most professionals struggle to find clear direction in their career journey, often relying on generic advice that doesn't fit their unique situation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-red-600">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Generic Career Advice</h3>
              <p className="text-gray-600">
                One-size-fits-all recommendations that ignore your unique background, skills, and goals.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-orange-600">💸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expensive Career Coaches</h3>
              <p className="text-gray-600">
                Professional guidance costs alot, making it inaccessible for most people.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-gray-600">❓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lack of Personalization</h3>
              <p className="text-gray-600">
                Traditional assessments provide generic results without considering your specific context.
              </p>
            </div>
          </div>
        </div>

        {/* Our Solution */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our AI-Powered Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine advanced AI technology with human expertise to provide personalized, actionable career guidance that adapts to your unique journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🧠</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Intelligent Assessment</h3>
              <p className="text-gray-600 mb-6">
                Our AI adapts questions based on your background - whether you're a high school student, college graduate, or experienced professional.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Personalized for your education level</li>
                <li>• Field-specific recommendations</li>
                <li>• Goal-oriented guidance</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">📊</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Comprehensive Analysis</h3>
              <p className="text-gray-600 mb-6">
                Get detailed insights into your personality, work style, skills, and potential career paths with concrete next steps.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Personality & work style analysis</li>
                <li>• Skills assessment & growth areas</li>
                <li>• Career compatibility scoring</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Actionable Roadmap</h3>
              <p className="text-gray-600 mb-6">
                Receive a personalized action plan with specific steps, timelines, and resources tailored to your career goals.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Step-by-step career roadmap</li>
                <li>• Timeline & milestone tracking</li>
                <li>• Curated resources & tools</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Get personalized career guidance in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"></div>
              
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Setup</h3>
                <p className="text-gray-600">
                  Tell us about your background, current situation, and career goals so we can personalize your experience.
                </p>
              </div>
              
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Assessment</h3>
                <p className="text-gray-600">
                  Complete our intelligent assessment that adapts based on your profile and responses.
                </p>
              </div>
              
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Roadmap</h3>
                <p className="text-gray-600">
                  Receive personalized recommendations, action steps, and resources for your career journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why AI Mentorship Network?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Built by Career Development Experts</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personalized for Every Career Stage</h4>
                    <p className="text-gray-600">From high school students to experienced professionals, our AI understands your unique context.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Industry-Specific Insights</h4>
                    <p className="text-gray-600">Get recommendations tailored to your field of interest, from tech to healthcare to creative industries.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Actionable Recommendations</h4>
                    <p className="text-gray-600">No generic advice - get specific steps you can take immediately to advance your career.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">What You'll Discover</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-700">Your unique personality profile and work style</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700">Skills assessment with growth recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Top career matches with compatibility scores</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-700">Personalized action plan with next steps</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-700">Resources and tools for career development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20 bg-gradient-to-r from-ai-purple via-ai-blue to-ai-green rounded-3xl text-white text-center shadow-2xl">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join the future of career development. Get AI-powered insights that adapt to your unique background and goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <SignUpButton>
                <button className="bg-white text-purple-600 font-bold py-5 px-10 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg">
                  Start Your Free Assessment 🚀
                </button>
              </SignUpButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm opacity-90">
              <div className="flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>5-minute intelligent assessment</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🎯</span>
                <span>Personalized career recommendations</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>📈</span>
                <span>Actionable growth strategies</span>
              </div>
            </div>
            
            <p className="mt-8 text-sm opacity-75">
              Free assessment • No credit card required • Instant results
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}