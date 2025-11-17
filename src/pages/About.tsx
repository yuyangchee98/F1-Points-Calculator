import React from 'react';
import { Link } from 'react-router-dom';
import IntroductionSection from '../components/common/IntroductionSection';
import FAQ from '../components/common/FAQ';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Calculator
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 flex items-center flex-wrap">
          <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
          <span className="mr-3">Points Calculator</span>
          <span className="text-gray-600">- About & FAQ</span>
        </h1>

        <IntroductionSection />

        <FAQ />
      </div>
    </div>
  );
};

export default About;
