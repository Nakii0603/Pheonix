"use client";

import { useState, useEffect } from "react";
import { getTopCostumes, getVoteStats } from "@/lib/actions";
import { Costume } from "@/lib/types";

export default function WinnersPage() {
  const [winners, setWinners] = useState<Costume[]>([]);
  const [currentWinner, setCurrentWinner] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteStats, setVoteStats] = useState({
    totalVotes: 0,
    likeVotes: 0,
    dislikeVotes: 0,
  });

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [topCostumes, stats] = await Promise.all([
        getTopCostumes(),
        getVoteStats(),
      ]);
      setWinners(topCostumes);
      setVoteStats(stats);
    } catch (error) {
      console.error("Error loading winners:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showNextWinner = () => {
    if (currentWinner === null) {
      setCurrentWinner(1); // Show 2nd place first
    } else if (currentWinner === 1) {
      setCurrentWinner(0); // Show 1st place
    } else {
      setCurrentWinner(null); // Hide all
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading winners...</p>
        </div>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Winners Yet
          </h1>
          <p className="text-gray-600 mb-6">
            No costumes have been voted on yet.
          </p>
          <a
            href="/vote"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Voting
          </a>
        </div>
      </div>
    );
  }

  const getWinnerText = () => {
    if (currentWinner === null) return "Click to reveal winners!";
    if (currentWinner === 1) return "2nd Place";
    if (currentWinner === 0) return "1st Place Winner!";
    return "Click to reveal winners!";
  };

  const getWinnerData = () => {
    if (currentWinner === null) return null;
    return winners[currentWinner];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        {/* Real Vote Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Real Vote Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {voteStats.likeVotes}
              </div>
              <div className="text-sm text-green-700">Likes</div>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">
                {voteStats.dislikeVotes}
              </div>
              <div className="text-sm text-red-700">Dislikes</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {voteStats.totalVotes}
              </div>
              <div className="text-sm text-blue-700">Total Votes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{getWinnerText()}</h2>

            {getWinnerData() ? (
              <div>
                <img
                  src={getWinnerData()!.imageUrl}
                  alt={`${getWinnerData()!.likes} likes`}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
                <div className="text-lg font-semibold text-gray-700">
                  {getWinnerData()!.likes} 👍 {getWinnerData()!.dislikes} 👎
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-gray-500 text-lg">
                  Click the button below to reveal the winners!
                </div>
              </div>
            )}

            <button
              onClick={showNextWinner}
              className="mt-6 bg-yellow-500 text-white py-3 px-8 rounded-lg hover:bg-yellow-600 text-lg font-semibold"
            >
              {currentWinner === null
                ? "Reveal Winners"
                : currentWinner === 1
                ? "Show 1st Place"
                : "Hide Winners"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
