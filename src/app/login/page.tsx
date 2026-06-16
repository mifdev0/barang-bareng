"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp, Role } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, User, Store, Shield } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { login, currentUser } = useApp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Customer");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      router.push(redirect);
    }
  }, [currentUser, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, role);
    if (success) {
      router.push(redirect);
    } else {
      setError(`Akun dengan email ini tidak terdaftar sebagai ${role}. Silakan periksa email atau daftar akun baru.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
      {/* Left side: branding/intro */}
      <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3 border border-blue-100">
            Sewa & Penyewaan Aman
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
            Masuk ke <span className="text-blue-700">Barang Bareng</span>
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Mulailah mengelola barang sewaan Anda atau cari barang kebutuhan harian Anda dengan negosiasi harga terbaik.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <Card className="lg:col-span-7 rounded-2xl border-slate-200/60 bg-white shadow-lg p-6 sm:p-8">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-150 text-red-800 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Tab Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Pilih Role Akun</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Customer", label: "Penyewa", icon: User },
                  { name: "Owner", label: "Pemilik Toko", icon: Store },
                  { name: "Admin", label: "Admin", icon: Shield }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setRole(item.name as Role)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Alamat Email</label>
              <Input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 py-5"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 py-5"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-md"
            >
              Masuk Akun
            </Button>

            <p className="text-center text-xs text-slate-500 mt-4">
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-700 font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
