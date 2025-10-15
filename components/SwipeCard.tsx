"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { Costume } from "../lib/types";

interface SwipeCardProps {
  imageUrl: string;
  onSwipe: (direction: "left" | "right", cardData: Costume) => void;
  cardData: Costume;
  isTop: boolean;
  zIndex: number;
  isDarkMode?: boolean;
  isHalloweenMode?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  imageUrl,
  onSwipe,
  cardData,
  isTop,
  isDarkMode = false,
  isHalloweenMode = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for rotation and scale
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  const opacity = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0, 0.5, 1, 0.5, 0]
  );

  // Transform values for direction indicators
  const dislikeOpacity = useTransform(x, [-300, -150, 0], [1, 0.5, 0]);
  const likeOpacity = useTransform(x, [0, 150, 300], [0, 0.5, 1]);

  // Threshold for swipe detection
  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 500;

  // Image loading effect
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = imageUrl;
  }, [imageUrl]);

  const handleDragStart = () => {
    // Drag started
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Check if swipe meets threshold
    if (
      Math.abs(offset) > SWIPE_THRESHOLD ||
      Math.abs(velocity) > VELOCITY_THRESHOLD
    ) {
      const direction = offset > 0 ? "right" : "left";

      // Animate card off screen with smoother spring
      animate(x, direction === "right" ? 500 : -500, {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      });

      // Trigger callback after animation
      setTimeout(() => {
        onSwipe(direction, cardData);
      }, 250);
    } else {
      // Return to center with smoother spring
      animate(x, 0, {
        type: "spring",
        stiffness: 350,
        damping: 28,
        mass: 0.8,
      });
    }
  };

  return (
    <motion.div
      className={`w-full h-full rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-300 ${
        isHalloweenMode
          ? "bg-gradient-to-br from-purple-900 to-orange-900"
          : isDarkMode
          ? "bg-gray-800"
          : "bg-white"
      }`}
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <div
              className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent ${
                isHalloweenMode ? "border-t-orange-500" : "border-t-pink-500"
              }`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin ${
                isHalloweenMode ? "border-r-purple-500" : "border-r-red-500"
              }`}
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">{isHalloweenMode ? "👻" : "😔"}</div>
            <p
              className={`text-lg font-medium ${
                isHalloweenMode
                  ? "text-orange-300"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              Failed to load image
            </p>
          </div>
        </div>
      )}

      {/* Actual image with smooth transition */}
      <motion.img
        src={imageUrl}
        alt="Costume"
        className="w-full h-full object-cover select-none"
        draggable={false}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: imageLoaded ? 1 : 0,
          scale: imageLoaded ? 1 : 1.1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoother feel
        }}
        style={{
          display: imageLoaded ? "block" : "none",
        }}
      />

      {/* Tinder-like swipe indicators */}
      {isTop && (
        <>
          <motion.div
            className={`absolute top-8 left-8 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl border-4 border-white ${
              isHalloweenMode ? "bg-purple-600" : "bg-red-500"
            }`}
            style={{
              opacity: dislikeOpacity,
            }}
          >
            {isHalloweenMode ? "👻 NOPE" : "❌ NOPE"}
          </motion.div>
          <motion.div
            className={`absolute top-8 right-8 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl border-4 border-white ${
              isHalloweenMode
                ? "bg-gradient-to-r from-orange-500 to-purple-600"
                : "bg-gradient-to-r from-pink-500 to-red-500"
            }`}
            style={{
              opacity: likeOpacity,
            }}
          >
            {isHalloweenMode ? "🎃 LIKE" : "❤️ LIKE"}
          </motion.div>
        </>
      )}

      {/* Card overlay for better text readability */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isHalloweenMode
            ? "bg-gradient-to-t from-purple-900/30 via-transparent to-transparent"
            : "bg-gradient-to-t from-black/20 via-transparent to-transparent"
        }`}
      />
    </motion.div>
  );
};

export default SwipeCard;
