"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Store, 
  MessageSquare, 
  ClipboardList, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  ShieldCheck,
  RefreshCw,
  Search
} from "lucide-react";

export const Navbar = () => {
  const { currentUser, logout, login, users } = useApp();
  const pathname = usePathname();


  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Katalog", href: "/#katalog" },
    { label: "Tentang Kami", href: "/#tentang" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-32 items-center justify-between px-4 sm:px-6">
        
        {/* Logo Left */}
        <Link href="/" className="flex items-center">
          <img 
            src="/logoBaru.png" 
            alt="Barang Bareng Logo" 
            className="h-26 w-auto object-contain"
          />
        </Link>

        {/* Links Center (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 hover:text-blue-700 ${
                pathname === link.href ? "text-blue-700" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons Right (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <>

              <Badge 
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  currentUser.role === "Admin" 
                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                    : currentUser.role === "Owner"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
                variant="outline"
              >
                {currentUser.role}
              </Badge>

              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-slate-700 hover:text-blue-700">
                  <UserIcon className="h-4 w-4" />
                  <span>{currentUser.name}</span>
                </Button>
              </Link>

              {currentUser.role === "Admin" ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              ) : currentUser.role === "Owner" ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
                    <Store className="h-4 w-4" />
                    Toko Saya
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                    <ClipboardList className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <Link href="/chat" className="relative p-2 text-slate-600 hover:text-blue-700 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500"></span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-blue-900 font-semibold hover:bg-blue-50 hover:text-blue-950">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/10">
                  Daftar Sekarang
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button (Lucide Menu Icon) */}
        <div className="md:hidden flex items-center gap-3">
          {currentUser && (
            <Link href="/chat" className="relative p-2 text-slate-600 hover:text-blue-700">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500"></span>
            </Link>
          )}
          
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white">
              <div className="flex flex-col gap-6 py-6 h-full justify-between">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center border-b border-slate-100 pb-4">
                    <img 
                      src="/logoBaru.png" 
                      alt="Barang Bareng Logo" 
                      className="h-20 w-auto object-contain"
                    />
                  </div>

                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-base font-semibold ${
                          pathname === link.href ? "text-blue-700" : "text-slate-600"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {currentUser && (
                      <Link
                        href="/dashboard"
                        className="text-base font-semibold text-slate-600"
                      >
                        Dashboard & Transaksi
                      </Link>
                    )}
                  </nav>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                  {currentUser ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-1">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                          <span className="text-xs text-slate-500">{currentUser.email}</span>
                        </div>
                      </div>
                      

                      <Button
                        variant="destructive"
                        onClick={logout}
                        className="w-full mt-2 gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full text-blue-900 border-blue-200">
                          Masuk
                        </Button>
                      </Link>
                      <Link href="/register" className="w-full">
                        <Button className="w-full bg-blue-600 text-white">
                          Daftar Sekarang
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};
