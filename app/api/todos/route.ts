import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Todo from "@/models/Todo";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const todos = await Todo.find({ user: session.user.email }).sort({
    createdAt: -1,
  });
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();
  await dbConnect();
  const todo = await Todo.create({ text, user: session.user.email });
  return NextResponse.json(todo);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, text, completed } = await request.json();
  await dbConnect();
  const todo = await Todo.findOneAndUpdate(
    { _id: id, user: session.user.email },
    { text, completed },
    { new: true }
  );
  return NextResponse.json(todo);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await dbConnect();
  await Todo.findOneAndDelete({ _id: id, user: session.user.email });
  return NextResponse.json({ message: "Todo deleted" });
}
