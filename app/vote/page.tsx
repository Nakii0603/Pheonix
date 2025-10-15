"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  voteOnCostume,
  checkVotingCompletion,
  getAllCostumes,
} from "@/lib/actions";
import { generateDeviceId } from "@/lib/deviceId";
import { Costume } from "@/lib/types";
import CardStack from "@/components/CardStack";
import { toast } from "react-toastify";

export default function VotePage() {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [votingProgress, setVotingProgress] = useState({ voted: 0, total: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHalloweenMode, setIsHalloweenMode] = useState(false);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("vote-theme");
    const savedHalloween = localStorage.getItem("vote-halloween");

    if (savedTheme === "dark") {
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
    } else {
      // Default to system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    if (savedHalloween === "true") {
      setIsHalloweenMode(true);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("vote-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("vote-halloween", isHalloweenMode ? "true" : "false");
  }, [isHalloweenMode]);

  const checkCompletion = useCallback(async () => {
    if (!deviceId) return;

    try {
      const completion = await checkVotingCompletion(deviceId);
      setVotingProgress({
        voted: completion.votedCount,
        total: completion.totalCostumes,
      });

      if (completion.isComplete) {
        setShowThankYouModal(true);
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  }, [deviceId]);

  const loadCostumes = useCallback(async () => {
    setLoading(true);
    try {
      const allCostumes = await getAllCostumes();
      setCostumes(allCostumes);

      // Check voting completion
      await checkCompletion();
    } catch (error) {
      console.error("Error loading costumes:", error);
      toast.error("Failed to load costume data");
    } finally {
      setLoading(false);
    }
  }, [checkCompletion]);

  useEffect(() => {
    // Generate device ID on component mount
    const id = generateDeviceId();
    setDeviceId(id);
    loadCostumes();
  }, [loadCostumes]);

  const handleSwipe = async (
    direction: "left" | "right",
    cardData: Costume
  ) => {
    if (voting || !deviceId) return;

    setVoting(true);

    const action = direction === "right" ? "like" : "dislike";

    try {
      const result = await voteOnCostume(cardData._id!, action, deviceId);
      if (result.success) {
        // Check if voting is complete after this vote
        const completion = await checkVotingCompletion(deviceId);
        setVotingProgress({
          voted: completion.votedCount,
          total: completion.totalCostumes,
        });

        if (completion.isComplete) {
          setShowThankYouModal(true);
          return;
        }
      } else {
        toast.error(result.error || "Failed to vote. Please try again.");
      }
    } catch (error) {
      toast.error("Vote failed. Please try again.");
      console.error("Vote error:", error);
    }

    setVoting(false);
  };

  const handleEmpty = () => {
    setShowThankYouModal(true);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isHalloweenMode
            ? "bg-gradient-to-br from-purple-900 via-black to-orange-900"
            : isDarkMode
            ? "bg-gray-900"
            : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto mb-6 ${
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
          <p
            className={`text-lg font-medium ${
              isHalloweenMode
                ? "text-orange-300"
                : isDarkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            {isHalloweenMode
              ? "Summoning costumes..."
              : "Finding costumes for you..."}
          </p>
          <p
            className={`text-sm mt-2 ${
              isHalloweenMode
                ? "text-purple-300"
                : isDarkMode
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Swipe right to like, left to pass
          </p>
        </div>
      </div>
    );
  }

  if (costumes.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isHalloweenMode
            ? "bg-gradient-to-br from-purple-900 via-black to-orange-900"
            : isDarkMode
            ? "bg-gray-900"
            : "bg-gray-50"
        }`}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6">{isHalloweenMode ? "🎃" : "😔"}</div>
          <h1
            className={`text-3xl font-bold mb-4 ${
              isHalloweenMode
                ? "text-orange-300"
                : isDarkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {isHalloweenMode ? "No Spooky Costumes Yet" : "No Costumes Yet"}
          </h1>
          <p
            className={`text-lg mb-8 ${
              isHalloweenMode
                ? "text-purple-300"
                : isDarkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            {isHalloweenMode
              ? "No costumes have been summoned yet. Check back later!"
              : "No costumes have been uploaded yet. Check back later!"}
          </p>
          <div className="space-y-4">
            <Link
              href="/admin"
              className={`inline-block py-3 px-8 rounded-full font-semibold transition-colors shadow-lg ${
                isHalloweenMode
                  ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700"
                  : "bg-pink-500 text-white hover:bg-pink-600"
              }`}
            >
              {isHalloweenMode ? "🎭 Summon Costumes" : "Upload Costumes"}
            </Link>
            <div>
              <Link
                href="/"
                className={`text-sm ${
                  isHalloweenMode
                    ? "text-purple-300 hover:text-orange-300"
                    : isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                } transition-colors`}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isHalloweenMode
          ? "bg-gradient-to-br from-purple-900 via-black to-orange-900"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-b from-pink-50 to-red-50"
      }`}
    >
      {/* Main Card Container */}
      <div className="px-4 py-4 max-w-sm mx-auto sm:max-w-md">
        <CardStack
          cards={costumes}
          onSwipe={handleSwipe}
          onEmpty={handleEmpty}
          isDarkMode={isDarkMode}
          isHalloweenMode={isHalloweenMode}
        />

        {/* Progress Indicator */}
      </div>

      {/* Thank You Full Screen */}
      {showThankYouModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-colors duration-300 ${
            isHalloweenMode
              ? "bg-gradient-to-br from-purple-900 via-black to-orange-900"
              : isDarkMode
              ? "bg-gray-900"
              : "bg-gradient-to-br from-pink-100 to-red-100"
          }`}
        >
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-9xl mb-8 animate-bounce">
              {isHalloweenMode ? "🎃" : "🎉"}
            </div>
            <h1
              className={`text-5xl font-bold mb-6 ${
                isHalloweenMode
                  ? "text-orange-300"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              {isHalloweenMode ? "Spooktacular!" : "Amazing!"}
            </h1>
            <p
              className={`text-xl mb-4 ${
                isHalloweenMode
                  ? "text-purple-300"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              You&apos;ve voted on all {votingProgress.total} costumes!
            </p>
            <p
              className={`text-lg mb-12 ${
                isHalloweenMode
                  ? "text-orange-200"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {isHalloweenMode
                ? "Thanks for helping us find the spookiest costumes! 🎭"
                : "Thanks for helping us find the best costumes! 🏆"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
