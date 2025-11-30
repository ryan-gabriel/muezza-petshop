"use client";
import { useLayoutEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add("login-page-bg");
    return () => {
      document.body.classList.remove("login-page-bg");
    };
  }, []);

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) alert(error.message);
    else alert("Password updated successfully!");
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>

      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleReset}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white w-full p-2 rounded"
      >
        {loading ? "Updating..." : "Set New Password"}
      </button>
    </div>
  );
}
