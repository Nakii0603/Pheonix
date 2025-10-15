"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";

interface CardData {
  _id?: string;
  imageUrl: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
}

interface CardStackProps {
  cards: CardData[];
  onSwipe: (direction: "left" | "right", cardData: CardData) => void;
  onEmpty?: () => void;
  isDarkMode?: boolean;
  isHalloweenMode?: boolean;
}

const CardStack: React.FC<CardStackProps> = ({
  cards,
  onSwipe,
  onEmpty,
  isDarkMode = false,
  isHalloweenMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<CardData[]>([]);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Show up to 3 cards at a time
    const startIndex = Math.max(0, currentIndex);
    const endIndex = Math.min(cards.length, startIndex + 3);
    setVisibleCards(cards.slice(startIndex, endIndex));
  }, [cards, currentIndex]);

  // Preload images for smoother transitions
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload = cards
        .slice(currentIndex, currentIndex + 5)
        .map((card) => card.imageUrl);

      const preloadPromises = imagesToPreload.map((url) => {
        if (preloadedImages.has(url)) return Promise.resolve();

        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setPreloadedImages((prev) => new Set([...prev, url]));
            resolve();
          };
          img.onerror = () => resolve(); // Continue even if image fails to load
          img.src = url;
        });
      });

      await Promise.all(preloadPromises);
    };

    preloadImages();
  }, [cards, currentIndex, preloadedImages]);

  const handleSwipe = (direction: "left" | "right", cardData: CardData) => {
    onSwipe(direction, cardData);

    // Move to next card
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // Check if all cards are swiped
    if (nextIndex >= cards.length) {
      setTimeout(() => {
        onEmpty?.();
      }, 500);
    }
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (visibleCards.length === 0) return;

    const topCard = visibleCards[0];
    handleSwipe(direction, topCard);
  };

  if (cards.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-96 rounded-3xl transition-colors duration-300 ${
          isHalloweenMode
            ? "bg-gradient-to-br from-purple-800 to-orange-800"
            : isDarkMode
            ? "bg-gray-800"
            : "bg-gradient-to-br from-pink-100 to-red-100"
        }`}
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-pulse">
            {isHalloweenMode ? "🎃" : "🎉"}
          </div>
          <h3
            className={`text-2xl font-bold mb-3 ${
              isHalloweenMode
                ? "text-orange-300"
                : isDarkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {isHalloweenMode ? "All Spooked!" : "All Done!"}
          </h3>
          <p
            className={`text-lg ${
              isHalloweenMode
                ? "text-purple-300"
                : isDarkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            You've voted on all costumes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-sm mx-auto sm:max-w-md"
      style={{ aspectRatio: "9/16", height: "70vh", minHeight: "500px" }}
    >
      <AnimatePresence mode="popLayout">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card._id || index}
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 50,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: -50,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoother feel
              delay: index * 0.05,
            }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: visibleCards.length - index,
            }}
          >
            <SwipeCard
              imageUrl={card.imageUrl}
              cardData={card}
              onSwipe={handleSwipe}
              isTop={index === 0}
              zIndex={visibleCards.length - index}
              isDarkMode={isDarkMode}
              isHalloweenMode={isHalloweenMode}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Tinder-like Action Buttons */}
      <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-16">
        <motion.button
          className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isHalloweenMode
              ? "bg-purple-700 hover:bg-purple-600 border-4 border-purple-400"
              : isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 border-4 border-gray-500"
              : "bg-white hover:bg-gray-50 border-4 border-gray-300"
          }`}
          onClick={() => handleButtonSwipe("left")}
          whileHover={{ scale: 1.2, rotate: -20 }}
          whileTap={{ scale: 0.85 }}
        >
          <span className="text-5xl">{isHalloweenMode ? "👻" : "❌"}</span>
        </motion.button>

        <motion.button
          className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isHalloweenMode
              ? "bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          }`}
          onClick={() => handleButtonSwipe("right")}
          whileHover={{ scale: 1.2, rotate: 20 }}
          whileTap={{ scale: 0.85 }}
        >
          <span className="text-5xl">{isHalloweenMode ? "🎃" : "❤️"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default CardStack;
