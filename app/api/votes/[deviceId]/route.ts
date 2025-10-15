import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "Device ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("costume-voting");
    const votes = db.collection("votes");

    // Get votes for specific device
    const deviceVotes = await votes
      .find({ deviceId })
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
      data: deviceVotes,
      count: deviceVotes.length,
      deviceId,
    });
  } catch (error) {
    console.error("Error fetching device votes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch device votes" },
      { status: 500 }
    );
  }
}
