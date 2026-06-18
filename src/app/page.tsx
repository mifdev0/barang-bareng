"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp, Item } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Star, 
  Car, 
  Tent, 
  Briefcase, 
  Laptop, 
  Armchair, 
  Sparkles, 
  Check, 
  AlertCircle 
} from "lucide-react";

export default function Home() {
  const { items, stores } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Solo");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = [
    { name: "Semua", icon: Sparkles, color: "from-blue-500 to-indigo-500" },
    { name: "Cars", label: "Cars", icon: Car, color: "from-emerald-500 to-teal-500" },
    { name: "Property", label: "Property", icon: Tent, color: "from-orange-500 to-amber-500" },
    { name: "Electronics", label: "Electronics", icon: Laptop, color: "from-blue-500 to-sky-500" },
    { name: "Furniture", label: "Furniture", icon: Armchair, color: "from-rose-500 to-red-500" },
    { name: "Animes", label: "Animes", icon: Sparkles, color: "from-violet-500 to-purple-500" },
  ];

  const cities = [
    { value: "Solo", label: "Solo" },
    { value: "Jakarta", label: "Jakarta (Coming Soon)", disabled: true },
    { value: "Bandung", label: "Bandung (Coming Soon)", disabled: true },
    { value: "Surabaya", label: "Surabaya (Coming Soon)", disabled: true },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search match
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    
    // City match
    const store = stores.find((s) => s.id === item.storeId);
    const matchesCity = selectedCity === "Semua" || (store && store.city === selectedCity);
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section with Light Blue Gradient & Floating Elements */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-slate-50 py-16 md:py-24">
        
        {/* Floating Abstract 3D Shapes */}
        <div className="absolute top-10 left-10 h-16 w-16 animate-bounce rounded-full bg-gradient-to-tr from-sky-300/40 to-blue-400/40 blur-sm duration-1000"></div>
        <div className="absolute top-40 right-20 h-24 w-24 rounded-full bg-gradient-to-tr from-orange-400/30 to-amber-500/30 blur-md animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 h-14 w-32 rounded-full bg-gradient-to-r from-blue-300/30 to-teal-400/30 rotate-12 blur-sm"></div>
        <div className="absolute -top-10 left-1/2 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl"></div>
        
        {/* Hero Grid */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
            
            {/* Left Smartphone Mockup */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="relative mx-auto w-full max-w-[220px] rounded-[38px] border-[8px] border-slate-900 bg-slate-900 p-2 shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500 hover:scale-105">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-24 rounded-b-xl bg-slate-900 z-20"></div>
                <div className="h-[400px] overflow-hidden rounded-[30px] bg-slate-50 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-2">
                    <span>Barang Bareng App</span>
                    <Badge className="bg-emerald-500 text-white text-[8px] px-1 h-3.5">Rental</Badge>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="h-6 w-full rounded-md bg-slate-200 animate-pulse"></div>
                    <div className="h-20 w-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-white text-[9px] font-bold">
                      Diskon Sewa Kamera 15%
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <div className="h-16 rounded-lg bg-slate-100 p-1">
                        <div className="h-8 w-full rounded bg-slate-200"></div>
                        <div className="h-2 w-3/4 rounded bg-slate-300 mt-1"></div>
                        <div className="h-1.5 w-1/2 rounded bg-teal-500 mt-1"></div>
                      </div>
                      <div className="h-16 rounded-lg bg-slate-100 p-1">
                        <div className="h-8 w-full rounded bg-slate-200"></div>
                        <div className="h-2 w-3/4 rounded bg-slate-300 mt-1"></div>
                        <div className="h-1.5 w-1/2 rounded bg-teal-500 mt-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-center text-[8px] font-bold text-slate-400 mt-2">Swipe Up to Rent</div>
                </div>
              </div>
            </div>

            {/* Center Content + Search */}
            <div className="col-span-1 lg:col-span-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] sm:text-xs font-semibold text-blue-700 mb-4 sm:mb-6 border border-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
                Marketplace Rental Terbesar & Terpercaya
              </span>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                Pinjam Barang Apa Saja <br />
                <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-500 bg-clip-text text-transparent">
                  Lebih Mudah & Hemat
                </span>
              </h1>
              
              <p className="mt-4 text-sm sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Temukan mobil, alat camping, kamera, properti cosplay, hingga furniture event terdekat. Negosiasikan harga langsung dengan pemiliknya!
              </p>

              {/* Capsule Search Bar */}
              <div className="mt-6 sm:mt-10 max-w-2xl mx-auto rounded-2xl sm:rounded-full bg-white p-2.5 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2 px-3 flex-1 w-full border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <Input
                    type="text"
                    placeholder="Cari tenda, kamera, PS5, mobil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-slate-400 w-full"
                  />
                </div>
                
                <div className="flex items-center gap-1.5 px-3 w-full sm:w-auto shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
                  <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="border-0 bg-transparent text-sm text-slate-700 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-pointer w-full sm:w-auto pr-4"
                  >
                    {cities.map((city) => (
                      <option key={city.value} value={city.value} disabled={city.disabled}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button 
                  className="w-full sm:w-auto rounded-xl sm:rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-5 sm:py-2.5 shadow-md shadow-blue-700/20 cursor-pointer"
                >
                  Cari
                </Button>
              </div>

              {/* Quick statistics */}
              <div className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs text-slate-500 font-bold px-2">
                <span>⚡ Real-time Negosiasi</span>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>🔒 Rekening Bersama Aman</span>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>💼 Komisi Rendah 10%</span>
              </div>
            </div>

            {/* Right Smartphone Mockup */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="relative mx-auto w-full max-w-[220px] rounded-[38px] border-[8px] border-slate-900 bg-slate-900 p-2 shadow-2xl rotate-[6deg] hover:rotate-0 transition-transform duration-500 hover:scale-105">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-24 rounded-b-xl bg-slate-900 z-20"></div>
                <div className="h-[400px] overflow-hidden rounded-[30px] bg-white p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold border-b border-slate-100 pb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Chat: Budi (Owner)</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto pt-2 text-[9px]">
                    <div className="bg-slate-100 p-1.5 rounded-lg rounded-tl-none max-w-[80%] self-start">
                      Halo! Boleh nego harga tenda jadi 60k?
                    </div>
                    <div className="bg-blue-500 text-white p-1.5 rounded-lg rounded-tr-none max-w-[80%] self-end">
                      Tentu kak, deal 60k/hari ya. Saya buat link order.
                    </div>
                    <div className="border border-orange-200 bg-orange-50/50 p-2 rounded-lg text-center mt-1 flex flex-col gap-1">
                      <span className="font-bold text-orange-700">Tawaran Spesial</span>
                      <span className="text-[8px] text-slate-500">Tenda Eiger: Rp 60.000 / Hari</span>
                      <Button className="h-5 text-[8px] bg-orange-500 hover:bg-orange-600 text-white mt-1 py-0 px-2 rounded">
                        Sewa Sekarang
                      </Button>
                    </div>
                  </div>
                  <div className="h-6 w-full rounded-md border border-slate-100 mt-2 bg-slate-50"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Horizontal Category Section below Hero */}
      <section className="bg-white py-10 border-y border-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Pilihan Kategori</h2>
            <p className="text-lg font-bold text-slate-800 mt-1">Telusuri Barang Sesuai Kebutuhan Anda</p>
          </div>
          
          <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto pb-2 scrollbar-none px-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/10"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white hover:text-blue-700"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-orange-400" : "text-slate-400"}`} />
                  <span>{cat.label || cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings Grid Section */}
      <section id="katalog" className="container mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Katalog Pilihan Terpopuler</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Daftar barang rental kualitas prima dengan harga terjangkau</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200/80">
            <span>Menampilkan:</span>
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-50">
              {filteredItems.length} Barang
            </Badge>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const store = stores.find((s) => s.id === item.storeId);
              
              return (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="group h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Product Image + Status Badge */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <img
                          src={item.photos[0]}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Availability Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge
                            className={`font-semibold rounded-full shadow px-2.5 py-0.5 border text-xs ${
                              item.status === "Tersedia"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                                : item.status === "Disewa"
                                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                                : "bg-slate-500 hover:bg-slate-600 text-white border-slate-600"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>

                        {/* Location Overlay */}
                        {store && (
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-orange-400" />
                            {store.city}
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          {/* Store Name & Category */}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                            <span>{item.category}</span>
                            <span className="text-blue-600">{store?.name.split(" ")[0]}</span>
                          </div>

                          {/* Product Title */}
                          <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
                            {item.name}
                          </h3>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 fill-current ${
                                    i < Math.floor(item.rating) ? "text-amber-400" : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-600 mt-0.5">{item.rating}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">({item.reviewCount || 12})</span>
                          </div>

                          {/* Specs summary */}
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 border-t border-slate-50 pt-2">
                            {item.specs}
                          </p>
                        </div>

                        {/* Price Section in Green/Teal */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Sewa harian</span>
                            <span className="text-base font-extrabold text-teal-600">
                              Rp {item.pricePerDay.toLocaleString("id-ID")}
                              <span className="text-xs font-medium text-slate-500">/hari</span>
                            </span>
                          </div>

                          <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-3">
                            Detail
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-lg mx-auto shadow-sm">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Tidak ada barang ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba bersihkan pencarian atau ubah filter kota Anda.</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua");
                setSelectedCity("Solo");
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
            >
              Reset Semua Filter
            </Button>
          </div>
        )}
      </section>

      {/* Info & About Section */}
      <section id="tentang" className="bg-slate-100/50 py-16 border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl mb-4 mx-auto md:mx-0">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-base">Cari & Negosiasi</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Telusuri barang di sekitar lokasi Anda. Gunakan fitur live chat di platform untuk tawar-menawar harga sewa secara langsung.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xl mb-4 mx-auto md:mx-0">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-base">Transfer ke Barang Bareng</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Untuk keamanan, transfer total biaya sewa ke rekening bersama Barang Bareng. Uang Anda aman sampai barang diterima.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl mb-4 mx-auto md:mx-0">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-base">Gunakan & Konfirmasi</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Ambil barang, nikmati penyewaan, lalu selesaikan order. Sistem kami akan mentransfer dana ke pemilik barang dikurangi komisi 10%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-8">
            <div className="flex items-center">
              <img 
                src="/logoBaru.png" 
                alt="Barang Bareng Logo" 
                className="h-24 w-auto object-contain"
              />
            </div>

            <div className="flex gap-8 text-sm text-slate-500 font-semibold">
              <Link href="#" className="hover:text-blue-700">Privasi</Link>
              <Link href="#" className="hover:text-blue-700">Syarat & Ketentuan</Link>
              <Link href="#" className="hover:text-blue-700">Bantuan</Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 pt-8">
            <span>&copy; {new Date().getFullYear()} Barang Bareng Marketplace. Hak Cipta Dilindungi.</span>
            <span>Made with ❤️ for Barang Bareng</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
