
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !data.user) {
      setError(loginError?.message || "लगइन असफल भयो।");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("store_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError) {
  console.error("Admin check error:", adminError);
  await supabase.auth.signOut();
  setError("Database error: " + adminError.message);
  setLoading(false);
  return;
}

if (!admin) {
  await supabase.auth.signOut();
  setError("Admin record not found.");
  setLoading(false);
  return;
}

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f5f0e7] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🪵</div>
          <h1 className="text-2xl font-bold text-[#593b25]">
            Langxong Furniture Udhyog
          </h1>
          <p className="mt-2 text-gray-500">
            सञ्चालक लगइन
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3 text-gray-900"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border p-3 text-gray-900"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#593b25] p-3 font-semibold text-white hover:bg-[#765033] disabled:opacity-50"
          >
            {loading ? "लगइन हुँदैछ..." : "लगइन गर्नुहोस्"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Authorized store owner only
        </p>
      </div>
    </main>
  );
}
