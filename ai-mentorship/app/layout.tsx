import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'AI Mentorship Network',
  description: 'Where Human Wisdom Meets AI Intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body>
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-r from-ai-purple to-ai-blue rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-ai-purple to-ai-blue bg-clip-text text-transparent">
                    Mentorship Network
                  </span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton>
                      <button className="text-gray-700 hover:text-ai-purple transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="btn-primary">
                        Get Started
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}