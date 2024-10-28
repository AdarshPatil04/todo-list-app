"use client";

import { useState, useEffect, SetStateAction } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Sun, Moon, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos();
    } else if (status === "unauthenticated") {
      // Keep local todos if any
      const localTodos = localStorage.getItem("localTodos");
      if (localTodos) {
        setTodos(JSON.parse(localTodos));
      } else {
        setTodos([]);
      }
    }
  }, [status]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo = {
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (status === "authenticated") {
      try {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todo),
        });

        if (res.ok) {
          await fetchTodos();
        }
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    } else {
      const newTodos = [...todos, { ...todo, _id: Date.now().toString() }];
      setTodos(newTodos);
      localStorage.setItem("localTodos", JSON.stringify(newTodos));
    }

    setNewTodo("");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/todos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, completed: !completed }),
        });

        if (res.ok) {
          await fetchTodos();
        }
      } catch (error) {
        console.error("Failed to toggle todo:", error);
      }
    } else {
      const newTodos = todos.map((todo) =>
        todo._id === id ? { ...todo, completed: !completed } : todo
      );
      setTodos(newTodos);
      localStorage.setItem("localTodos", JSON.stringify(newTodos));
    }
  };

  const deleteTodo = async (id: string) => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/todos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          await fetchTodos();
        }
      } catch (error) {
        console.error("Failed to delete todo:", error);
      }
    } else {
      const newTodos = todos.filter((todo) => todo._id !== id);
      setTodos(newTodos);
      localStorage.setItem("localTodos", JSON.stringify(newTodos));
    }
  };

  const clearAllTodos = async () => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/todos/clear", { method: "DELETE" });
        if (res.ok) {
          await fetchTodos();
        }
      } catch (error) {
        console.error("Failed to clear todos:", error);
      }
    } else {
      setTodos([]);
      localStorage.removeItem("localTodos");
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const handleEditSubmit = async () => {
    if (editingTodo) {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/todos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingTodo._id, text: editText }),
          });
          if (res.ok) {
            await fetchTodos();
          }
        } catch (error) {
          console.error("Failed to update todo:", error);
        }
      } else {
        const newTodos = todos.map((todo) =>
          todo._id === editingTodo._id ? { ...todo, text: editText } : todo
        );
        setTodos(newTodos);
        localStorage.setItem("localTodos", JSON.stringify(newTodos));
      }
    }
    setEditingTodo(null);
    setEditText("");
  };

  const handleAuth = async () => {
    if (status === "authenticated") {
      await signOut();
    } else {
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        console.error("Authentication failed:", result.error);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <main className={`min-h-screen bg-gray-100 dark:bg-gray-900 p-8 ${theme}`}>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            My Todo List
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleAuth}
              className={`px-3 py-1 ${
                status === "authenticated" ? "bg-red-500" : "bg-blue-500"
              } text-white rounded`}
            >
              {status === "authenticated"
                ? "Log out"
                : "Login to save progress"}
            </button>
          </div>
        </div>
        <div className="p-4">
          <form onSubmit={addTodo} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewTodo(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Add a new task"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </form>

          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo._id, todo.completed)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                {editingTodo && editingTodo._id === todo._id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEditText(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                ) : (
                  <span
                    className={`flex-grow ${
                      todo.completed
                        ? "line-through text-gray-500"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
                {editingTodo && editingTodo._id === todo._id ? (
                  <button
                    onClick={handleEditSubmit}
                    className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(todo)}
                    className="p-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {todos.length > 0 && (
            <button
              onClick={clearAllTodos}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear All Todos
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
