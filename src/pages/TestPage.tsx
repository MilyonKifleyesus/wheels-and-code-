import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

const TestPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        console.log("🔍 Testing Supabase connection...");
        const { data, error } = await supabase.from("todos").select("*");
        if (error) {
          setError(error.message);
          return;
        }
        setTodos((data as Todo[]) || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-matte-black p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Supabase Test</h1>
      <div className="text-gray-400 mb-4">
        URL: {import.meta.env.VITE_SUPABASE_URL ? "✅" : "❌"} | Key:{" "}
        {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅" : "❌"}
      </div>
      {loading && <div className="text-white">Loading...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && (
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li className="text-gray-400">No todos found</li>
          ) : (
            todos.map((t) => (
              <li key={t.id} className="text-white">
                {t.title} {t.completed ? "✅" : ""}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default TestPage;
