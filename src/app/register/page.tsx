"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp, Role } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { User, Store, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, currentUser } = useApp();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Customer");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      await register(name, email, role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-4xl mx-auto w-full">
          
          {/* Left side: branding/intro */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3 border border-blue-100">
                Pendaftaran Gratis
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Bergabung dengan <span className="text-blue-700">Barang Bareng</span>
              </h1>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Mendaftar sebagai Customer untuk mulai menyewa, atau sebagai Owner untuk mulai menyewakan barang fisik Anda dan hasilkan pendapatan!
              </p>
            </div>
            
            <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200/50 text-xs space-y-3 leading-relaxed text-slate-600 text-left">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">Ketentuan Pembuatan Toko:</span>
              <p>
                ✔️ Owner dapat membuat lebih dari satu toko (multi-toko).<br />
                ✔️ Komisi platform hanya 10% dipotong otomatis dari tiap penyewaan.<br />
                ✔️ Pencairan saldo Owner diproses manual dengan aman ke nomor rekening Anda.
              </p>
            </div>
          </div>

          {/* Right side: Register Form */}
          <Card className="lg:col-span-7 rounded-2xl border-slate-200/60 bg-white shadow-lg p-6 sm:p-8">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-150 text-red-800 text-xs rounded-xl flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Role tab selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Pilih Tipe Akun Anda</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Customer", label: "Penyewa (Customer)", icon: User, desc: "Ingin mencari & menyewa barang" },
                      { name: "Owner", label: "Pemilik Barang (Owner)", icon: Store, desc: "Ingin menyewakan barang" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = role === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setRole(item.name as Role)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-bold transition-all text-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="block font-black">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: Andi Wijaya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-blue-500 py-5"
                  />
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Alamat Email</label>
                  <Input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-blue-500 py-5"
                  />
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
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
                  Buat Akun Baru
                </Button>

                <p className="text-center text-xs text-slate-500 mt-4">
                  Sudah memiliki akun?{" "}
                  <Link href="/login" className="text-blue-700 font-bold hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
