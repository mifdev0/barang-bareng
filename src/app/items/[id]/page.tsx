"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  MessageSquare, 
  CalendarDays, 
  Store, 
  ShieldCheck, 
  CheckCircle,
  Truck,
  AlertCircle
} from "lucide-react";

export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { items, stores, currentUser, createChat, createOrder, showAlert } = useApp();
  
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"Ambil di Lokasi" | "Diantar">("Ambil di Lokasi");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const item = items.find((it) => it.id === id);
  if (!item) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Barang Tidak Ditemukan</h2>
          <p className="text-slate-500 mt-2 mb-6">Barang yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl">
              Kembali ke Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const store = stores.find((s) => s.id === item.storeId);

  const handleContactOwner = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/items/${item.id}`);
      return;
    }

    if (currentUser.id === store?.ownerId) {
      showAlert("Peringatan", "Anda adalah pemilik barang ini!", "info");
      return;
    }

    // Create chat or get existing
    const chat = await createChat(currentUser.id, store?.ownerId || "", item.id);
    router.push(`/chat?id=${chat.id}`);
  };

  const handleRentNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/login?redirect=/items/${item.id}`);
      return;
    }

    if (currentUser.id === store?.ownerId) {
      showAlert("Peringatan", "Anda adalah pemilik barang ini!", "info");
      return;
    }

    if (!startDate || !endDate) {
      showAlert("Peringatan", "Harap tentukan tanggal sewa.", "info");
      return;
    }

    if (deliveryMethod === "Diantar" && !deliveryAddress.trim()) {
      showAlert("Peringatan", "Harap isi alamat pengantaran.", "info");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const chat = await createChat(currentUser.id, store?.ownerId || "", item.id);
      const order = await createOrder(
        chat.id,
        item.id,
        currentUser.id,
        store?.ownerId || "",
        startDate,
        endDate,
        item.pricePerDay,
        deliveryMethod,
        deliveryMethod === "Diantar" ? deliveryAddress : ""
      );
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      showAlert("Gagal", "Gagal memproses sewa: " + (err.message || err), "error");
    } finally {
      setIsCreatingOrder(false);
      setIsRentDialogOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-semibold mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Katalog</span>
          </Link>

          {/* Product details grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Images */}
            <div className="lg:col-span-7 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm aspect-video">
                <img
                  src={item.photos[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Specs & Description Card */}
              <Card className="rounded-2xl border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Spesifikasi Detail
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      {item.specs.split(" • ").map((spec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Deskripsi Produk
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pt-4">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side: Action Panel & Store info */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Main Info Card */}
              <Card className="rounded-2xl border-slate-100 shadow-md bg-white">
                <CardContent className="p-6">
                  {/* Category & Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-bold uppercase tracking-wider text-[10px]">
                      {item.category}
                    </Badge>
                    <Badge
                      className={`font-semibold rounded-full px-2.5 py-0.5 border text-xs ${
                        item.status === "Tersedia"
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : item.status === "Disewa"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-slate-500 text-white border-slate-600"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {item.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 fill-current ${
                            i < Math.floor(item.rating) ? "text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.rating}</span>
                    <span className="text-xs text-slate-400">({item.reviewCount || 12} ulasan)</span>
                  </div>

                  {/* Price info */}
                  <div className="py-6 flex flex-col bg-slate-50/50 rounded-2xl p-4 my-6 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tarif Sewa</span>
                    <span className="text-3xl font-black text-teal-600 mt-1">
                      Rp {item.pricePerDay.toLocaleString("id-ID")}
                      <span className="text-sm font-medium text-slate-500"> / Hari</span>
                    </span>
                  </div>

                  {/* Action Button */}
                  {item.status === "Tersedia" ? (
                    <div className="space-y-3">
                      {currentUser?.id === store?.ownerId ? (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center text-xs font-bold text-orange-850 leading-relaxed">
                          Ini adalah barang listing dari toko Anda sendiri. Anda tidak dapat menyewa barang atau berkirim chat dengan diri sendiri.
                        </div>
                      ) : (
                        <>
                          <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
                            <DialogTrigger className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-base font-bold shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer">
                              <CalendarDays className="h-5 w-5" />
                              Sewa Sekarang (Pilih Tanggal)
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] bg-white">
                              <DialogHeader>
                                <DialogTitle>Tentukan Tanggal Sewa</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleRentNow} className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Tanggal Mulai</label>
                                  <Input
                                    required
                                    type="date"
                                    value={startDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setStartDate(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Tanggal Selesai</label>
                                  <Input
                                    required
                                    type="date"
                                    value={endDate}
                                    min={startDate || new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setEndDate(e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Metode Pengantaran</label>
                                  <select
                                    value={deliveryMethod}
                                    onChange={(e) => setDeliveryMethod(e.target.value as "Ambil di Lokasi" | "Diantar")}
                                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                                  >
                                    <option value="Ambil di Lokasi">Ambil di Lokasi (Pickup)</option>
                                    <option value="Diantar">Diantar ke Alamat (Delivery)</option>
                                  </select>
                                </div>

                                {deliveryMethod === "Ambil di Lokasi" && (
                                  <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-slate-700 space-y-1">
                                    <p className="font-bold text-orange-700">Alamat Toko (Pengambilan):</p>
                                    <p>{store?.address || "Solo (Hubungi owner untuk detail lokasi)"}</p>
                                  </div>
                                )}

                                {deliveryMethod === "Diantar" && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Alamat Pengantaran</label>
                                    <textarea
                                      required
                                      placeholder="Tulis alamat lengkap pengiriman di Solo..."
                                      value={deliveryAddress}
                                      onChange={(e) => setDeliveryAddress(e.target.value)}
                                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[60px]"
                                    />
                                  </div>
                                )}

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                                  <div className="flex justify-between font-semibold text-slate-600">
                                    <span>Tarif Sewa:</span>
                                    <span>Rp {item.pricePerDay.toLocaleString("id-ID")} / Hari</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold">*Total biaya sewa akan otomatis dihitung setelah Anda memilih tanggal.</p>
                                </div>

                                <Button 
                                  type="submit" 
                                  disabled={isCreatingOrder}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-xl disabled:opacity-50"
                                >
                                  {isCreatingOrder ? "Memproses Sewa..." : "Konfirmasi Sewa & Lanjut Bayar"}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            onClick={handleContactOwner}
                            variant="outline"
                            className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 py-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="h-5 w-5" />
                            Hubungi Owner & Nego
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-slate-300 text-slate-500 py-6 rounded-2xl text-base font-bold cursor-not-allowed"
                    >
                      Sedang Disewa
                    </Button>
                  )}

                  {/* Safe transaction warning */}
                  <div className="mt-4 flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                    <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Transaksi Aman:</strong> Pembayaran Anda disimpan oleh Barang Bareng dan baru akan diteruskan ke Owner setelah barang dikonfirmasi aktif disewa.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Store Info Card */}
              {store && (
                <Card className="rounded-2xl border-slate-100 shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-bold uppercase">Pemilik Toko</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Aktif
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5 mt-0.5">
                          <Store className="h-4 w-4 text-blue-600 shrink-0" />
                          {store.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                        <span>Lokasi Toko: <strong>{store.city}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-teal-600 shrink-0" />
                        <span>Metode Penyerahan: <strong>COD / Ambil Sendiri</strong></span>
                      </div>
                      <p className="text-slate-500 italic mt-3 bg-slate-50 p-2.5 rounded-lg">
                        "{store.description}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
