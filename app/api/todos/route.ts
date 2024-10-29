// pages/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import dbConnect from "../../../lib/dbConnect";
import Todo from "../../../models/Todo";

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
  const { text, createdAt } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const todo = await Todo.create({ text, user: session.user.email, createdAt });
  return NextResponse.json(todo);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { id, text, completed } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const todo = await Todo.findById(id);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  if (text !== undefined) todo.text = text;
  if (completed !== undefined) todo.completed = completed;
  await todo.save();

  return NextResponse.json(todo);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { id } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  await Todo.findByIdAndDelete(id);

  return NextResponse.json({ message: "Todo deleted" });
}
