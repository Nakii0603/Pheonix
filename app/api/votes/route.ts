import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("costume-voting");
    const votes = db.collection("votes");

    // Get all votes with only the essential fields
    const allVotes = await votes
      .find({})
      .project({
        _id: 1,
        imageId: 1,
        action: 1,
        timestamp: 1,
        deviceId: 1,
      })
      .sort({ timestamp: -1 }) // Most recent first
      .toArray();

    return NextResponse.json({
      success: true,
      data: allVotes,
      count: allVotes.length,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
