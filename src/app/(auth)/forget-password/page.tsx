/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLayoutEffect, useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showAlert } from "@/lib/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showAlert("Email wajib diisi!", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "Gagal mengirim link reset.", "error");
        return;
      }

      showAlert(
        "Link reset password telah dikirim. Silakan cek email Anda.",
        "success"
      );
      setEmail("");
    } catch (err: any) {
      showAlert(err.message || "Terjadi kesalahan server.", "error");
    } finally {
      setLoading(false);
    }
  };

    useLayoutEffect(() => {
      document.body.classList.add("login-page-bg");
      return () => {
        document.body.classList.remove("login-page-bg");
      };
    }, []);
  

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lupa Password
          </h1>
          <p className="text-slate-600 text-sm">
            Masukkan email Anda untuk menerima link reset password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                type="email"
                placeholder="youremail@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full h-11 text-base"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Mengirim...
              </span>
            ) : (
              "Kirim Link Reset"
            )}
          </Button>
        </form>

        <div className="text-center">
          <a href="/login" className="text-sm text-blue-600 hover:underline">
            Kembali ke Login
          </a>
        </div>
      </div>
    </section>
  );
}
