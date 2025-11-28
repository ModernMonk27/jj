import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, path, detail, metadata, userRole } = body || {};

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    await prisma.activityEvent.create({
      data: {
        type,
        path: path || null,
        detail: detail || null,
        userRole: userRole || null,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
