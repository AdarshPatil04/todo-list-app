// pages/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import dbConnect from "../../../lib/dbConnect";
import Todo from "../../../models/Todo";

let cachedDbConnection: typeof import("mongoose") | null = null;

async function getDbConnection() {
  if (!cachedDbConnection) {
    cachedDbConnection = await dbConnect();
  }
  return cachedDbConnection;
}

async function getSession(request: NextRequest) {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getDbConnection();
  try {
    // Fetch only necessary fields
    const todos = await Todo.find({ user: session.user.email }, 'text completed createdAt').sort({
      createdAt: -1,
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  let todoData;

  try {
    todoData = await request.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, createdAt } = todoData;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getDbConnection();
  try {
    const todo = await Todo.create({ text, user: session.user.email, createdAt });
    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  const { id, text, completed } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getDbConnection();
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
  const session = await getSession(request);
  const { id } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getDbConnection();
  await Todo.findByIdAndDelete(id);

  return NextResponse.json({ message: "Todo deleted" });
}
