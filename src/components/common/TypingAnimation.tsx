import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  examples: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  examples,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000
}) => {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentExample = examples[currentExampleIndex];
    
    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && currentText === currentExample) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
      } else {
        setCurrentText(prev => currentExample.slice(0, prev.length + 1));
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentExampleIndex, examples, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className="flex items-center">
      <span className="text-gray-600 text-sm">Try: {'"'}</span>
      <span className="text-blue-600 text-sm font-medium">{currentText}</span>
      <span className="animate-pulse text-blue-600">|</span>
      <span className="text-gray-600 text-sm">{'"'}</span>
    </div>
  );
};

export default TypingAnimation;