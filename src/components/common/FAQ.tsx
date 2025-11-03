import React, { useState } from 'react';
import { CURRENT_SEASON } from '../../utils/constants';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does the F1 points calculator work?",
    answer: "Our F1 championship calculator uses a drag-and-drop interface to let you predict race results. Simply drag drivers to their finishing positions for each race, and the calculator automatically updates the championship standings based on the official F1 points system."
  },
  {
    question: "What is an F1 championship calculator?",
    answer: "An F1 championship calculator is a tool that simulates Formula 1 season standings by allowing you to predict race results. It calculates driver and constructor points based on your predictions, helping you visualize different championship scenarios."
  },
  {
    question: `How are F1 points calculated in ${CURRENT_SEASON}?`,
    answer: `In ${CURRENT_SEASON}, F1 points are awarded to the top 10 finishers: 1st place gets 25 points, 2nd gets 18, 3rd gets 15, then 12, 10, 8, 6, 4, 2, and 1 point for 10th place. Sprint races award approximately 1/3 of regular race points to the top 8 finishers.`
  },
  {
    question: "Can I simulate different F1 points systems?",
    answer: "Yes! Our calculator supports multiple points systems including the current F1 system, historical systems, and alternative scoring methods. You can switch between them to see how different systems would affect the championship."
  },
  {
    question: "How do I predict F1 standings?",
    answer: "To predict F1 standings, use our drag-and-drop interface to place drivers in their predicted finishing positions for upcoming races. The calculator instantly updates the championship table, showing you how your predictions would affect the final standings."
  },
  {
    question: "Is this F1 calculator free to use?",
    answer: "Yes, our F1 points calculator is completely free. No registration required - just visit the site and start predicting race results and championship outcomes immediately."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section mt-8 mb-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
      
      <div className="max-w-3xl mx-auto">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <h3 className="text-lg font-medium text-gray-800 pr-4">{item.question}</h3>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {openIndex === index && (
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-gray-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Schema markup for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }}
      />
    </section>
  );
};

export default FAQ;