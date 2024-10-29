// app/api/todos/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import dbConnect from "../../../../lib/dbConnect";
import Todo from "../../../../models/Todo";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { block } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    if (block === "all") {
      // Clear all todos for the user
      const result = await Todo.deleteMany({ user: session.user.email });
      console.log(`Deleted ${result.deletedCount} todos`);
    } else {
      // Convert the block (date string) to Date objects for the start and end of the day
      const startDate = new Date(block);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(block);
      endDate.setHours(23, 59, 59, 999);

      // Delete todos for the specific date
      const result = await Todo.deleteMany({
        user: session.user.email,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      console.log(`Deleted ${result.deletedCount} todos for ${block}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared todos${
        block !== "all" ? ` for ${block}` : ""
      }`,
    });
  } catch (error) {
    console.error("Error clearing todos:", error);
    return NextResponse.json(
      { error: "Failed to clear todos" },
      { status: 500 }
    );
  }
}
