"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { showAlert } from "@/lib/alert";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add("login-page-bg");
    return () => {
      document.body.classList.remove("login-page-bg");
    };
  }, []);

  const handleReset = async () => {
    if (!password) {
      return showAlert("Password tidak boleh kosong", "error");
    }

    if (password.length < 6) {
      return showAlert("Password minimal 6 karakter.", "error");
    }

    if (password !== confirm) {
      return showAlert("Password dan konfirmasi password tidak cocok.", "error");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      showAlert(error.message, "error");
    } else {
      showAlert("Password berhasil diperbarui!", "success");
      setTimeout(() => router.push("/login"), 1500); // redirect otomatis
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-md border border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold mt-2">
            Reset Password
          </CardTitle>
          <p className="text-sm text-slate-500">
            Masukkan password baru dan konfirmasi ulang.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Password Field */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Set New Password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
