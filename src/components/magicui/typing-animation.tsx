"use client";

import React, { useEffect, useState, useMemo } from "react";

interface TypingAnimationProps {
  children: string;
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
  className?: string;
  showCursor?: boolean;
}

export function TypingAnimation({
  children,
  words = [],
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBeforeDelete = 2000,
  delayBeforeType = 500,
  className,
  showCursor = false,
}: TypingAnimationProps) {
  // Use useMemo to memoize the words array to avoid dependency changes
  const allWords = useMemo(() => 
    words.length > 0 ? words : [children], 
    [words, children]
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(typingSpeed);

  useEffect(() => {
    const word = allWords[currentWordIndex];

    const timer = setTimeout(() => {
      // If deleting
      if (isDeleting) {
        setCurrentText((prev) => prev.substring(0, prev.length - 1));
        setCurrentSpeed(deletingSpeed);

        // When done deleting, start typing the next word
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % allWords.length);
          setCurrentSpeed(delayBeforeType);
        }
      } 
      // If typing
      else {
        setCurrentText(word.substring(0, currentText.length + 1));
        setCurrentSpeed(typingSpeed);

        // When done typing, pause before deleting
        if (currentText === word) {
          setCurrentSpeed(delayBeforeDelete);
          setTimeout(() => {
            setIsDeleting(true);
            setCurrentSpeed(deletingSpeed);
          }, delayBeforeDelete);
        }
      }
    }, currentSpeed);

    return () => clearTimeout(timer);
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    currentSpeed,
    allWords,
    typingSpeed,
    deletingSpeed,
    delayBeforeDelete,
    delayBeforeType,
  ]);

  return (
    <span className={className}>
      {currentText}
      {showCursor && <span className="inline-block w-0.5 h-6 ml-1 -mb-px bg-current animate-blink"></span>}
    </span>
  );
} 