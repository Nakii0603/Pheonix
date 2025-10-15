"use server";

import clientPromise from "./mongodb";
import { Costume, Vote } from "./types";
import { ObjectId } from "mongodb";

export async function uploadCostume(imageUrl: string) {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");

    // Allow multiple costumes - no deletion needed

    const costume = {
      imageUrl,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
    };

    const result = await costumes.insertOne(costume);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error uploading costume:", error);
    return { success: false, error: "Failed to upload costume" };
  }
}

export async function getCurrentCostume() {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");

    // Get all costumes and return a random one
    const allCostumes = await costumes.find({}).toArray();
    if (allCostumes.length === 0) return null;

    // Get a random costume
    const randomIndex = Math.floor(Math.random() * allCostumes.length);
    const costume = allCostumes[randomIndex];

    // Convert ObjectId to string for client serialization
    return {
      ...costume,
      _id: costume._id?.toString(),
    };
  } catch (error) {
    console.error("Error fetching costume:", error);
    return null;
  }
}

export async function voteOnCostume(
  imageId: string,
  action: "like" | "dislike",
  deviceId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");
    const votes = db.collection<Vote>("votes");

    // Check if this device has already voted on this costume
    const existingVote = await votes.findOne({
      imageId,
      deviceId,
    });

    if (existingVote) {
      return {
        success: false,
        error: "You have already voted on this costume",
      };
    }

    // Record the vote
    await votes.insertOne({
      imageId,
      action,
      timestamp: new Date(),
      deviceId,
    });

    // Update costume stats - convert string ID back to ObjectId for database query
    const updateField = action === "like" ? "likes" : "dislikes";
    await costumes.updateOne(
      { _id: new ObjectId(imageId) as unknown as string },
      { $inc: { [updateField]: 1 } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error voting:", error);
    return { success: false, error: "Failed to vote" };
  }
}

export async function getTopCostumes() {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");
    const votes = db.collection<Vote>("votes");

    // Get all costumes
    const allCostumes = await costumes.find({}).toArray();

    // Count real votes for each costume
    const costumesWithRealCounts = await Promise.all(
      allCostumes.map(async (costume) => {
        const costumeId = costume._id?.toString();
        if (!costumeId) return null;

        // Count actual likes and dislikes from votes collection
        const likeCount = await votes.countDocuments({
          imageId: costumeId,
          action: "like",
        });
        const dislikeCount = await votes.countDocuments({
          imageId: costumeId,
          action: "dislike",
        });

        return {
          ...costume,
          _id: costumeId,
          likes: likeCount,
          dislikes: dislikeCount,
        };
      })
    );

    // Filter out null values and sort by real like count
    const validCostumes = costumesWithRealCounts
      .filter(
        (costume): costume is NonNullable<typeof costume> => costume !== null
      )
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 2);

    return validCostumes;
  } catch (error) {
    console.error("Error fetching top costumes:", error);
    return [];
  }
}

export async function checkVotingCompletion(deviceId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");
    const votes = db.collection<Vote>("votes");

    // Get total number of costumes
    const totalCostumes = await costumes.countDocuments();

    // Get number of costumes voted on by this device
    const votedCostumes = await votes.distinct("imageId", { deviceId });

    return {
      totalCostumes,
      votedCount: votedCostumes.length,
      isComplete: totalCostumes > 0 && votedCostumes.length >= totalCostumes,
    };
  } catch (error) {
    console.error("Error checking voting completion:", error);
    return {
      totalCostumes: 0,
      votedCount: 0,
      isComplete: false,
    };
  }
}

export async function getAllCostumes() {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const costumes = db.collection<Costume>("costumes");

    const allCostumes = await costumes.find({}).toArray();

    // Convert ObjectIds to strings for client serialization
    return allCostumes.map((costume) => ({
      ...costume,
      _id: costume._id?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching all costumes:", error);
    return [];
  }
}

export async function getVoteStats() {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const votes = db.collection<Vote>("votes");

    const totalVotes = await votes.countDocuments();
    const likeVotes = await votes.countDocuments({ action: "like" });
    const dislikeVotes = await votes.countDocuments({ action: "dislike" });

    return {
      totalVotes,
      likeVotes,
      dislikeVotes,
    };
  } catch (error) {
    console.error("Error fetching vote stats:", error);
    return {
      totalVotes: 0,
      likeVotes: 0,
      dislikeVotes: 0,
    };
  }
}
