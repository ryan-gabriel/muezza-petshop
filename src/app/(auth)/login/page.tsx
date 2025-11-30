"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Harap isi email dan password");
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Login gagal");
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Login error:", error);
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section (Image) */}
      <div className="order-2 lg:order-1 flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Image
            src="/login/welcome-cat.webp"
            alt="Welcome Cat"
            width={400}
            height={400}
            className="w-full h-auto object-contain hidden lg:block"
            priority
          />
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="order-1 lg:order-2 flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md border-[#B0D9F0] shadow-lg">
          <CardHeader>
            <p className="text-xl font-semibold text-gray-800">
              Muezza Petshop
            </p>
            <CardTitle className="text-3xl text-[#7754F6]">
              Admin Page
            </CardTitle>
            <p className="text-sm text-gray-500">Login sebagai administrator</p>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />

              <div className="flex items-center justify-between">
                <Link
                  href="/forget-password"
                  className="text-sm text-[#7754F6] hover:text-purple-700"
                >
                  Forget Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#7754F6] hover:bg-[#9b83f3]  cursor-pointer shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Log In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
