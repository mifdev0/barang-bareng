"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useApp, OrderStatus } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  ShoppingBag,
  ExternalLink,
  Store,
  AlertCircle
} from "lucide-react";

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { orders, items, stores, currentUser, uploadPaymentProof, uploadIdentityProof, confirmPayment, completeOrder, uploadImage, showAlert } = useApp();
  
  const [proofInput, setProofInput] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [idFile, setIdFile] = useState<File | null>(null);
  const [isUploadingId, setIsUploadingId] = useState(false);

  const order = orders.find((o) => o.id === id);

  const handleUploadIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!idFile) {
      showAlert("Peringatan", "Harap pilih file kartu identitas terlebih dahulu.", "info");
      return;
    }
    
    setIsUploadingId(true);
    try {
      const idUrl = await uploadImage(idFile, "pinjamin");
      await uploadIdentityProof(order.id, idUrl);
      setIdFile(null);
      showAlert("Sukses", "Kartu identitas berhasil diunggah sebagai jaminan sewa.", "success");
    } catch (err: any) {
      showAlert("Gagal", "Gagal mengunggah kartu identitas: " + (err.message || err), "error");
    } finally {
      setIsUploadingId(false);
    }
  };

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push(`/login?redirect=/orders/${id}`);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <HelpCircle className="h-16 w-16 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Order Tidak Ditemukan</h2>
          <p className="text-slate-500 mt-2">Maaf, detail order tidak dapat ditemukan.</p>
          <Link href="/">
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const item = items.find((i) => i.id === order.itemId);
  const store = stores.find((s) => s.id === order.ownerId || s.ownerId === order.ownerId);

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      showAlert("Peringatan", "Harap pilih file bukti transfer terlebih dahulu.", "info");
      return;
    }
    
    setIsUploading(true);
    try {
      const proofUrl = await uploadImage(proofFile, "pinjamin");
      await uploadPaymentProof(order.id, proofUrl);
      setProofInput("");
      setProofFile(null);
      showAlert("Sukses", "Bukti pembayaran berhasil diunggah! Menunggu konfirmasi owner.", "success");
    } catch (err: any) {
      showAlert("Gagal", "Gagal mengunggah bukti transfer: " + (err.message || err), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    await confirmPayment(order.id);
    showAlert("Sukses", "Pembayaran berhasil dikonfirmasi! Status sewa sekarang: Dikonfirmasi (Aktif)", "success");
  };

  const handleComplete = async () => {
    await completeOrder(order.id);
    showAlert("Sukses", "Penyewaan telah diselesaikan! Terima kasih.", "success");
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Menunggu Pembayaran":
        return <Badge className="bg-amber-500 text-white border-amber-600 px-3 py-1 font-bold">Menunggu Pembayaran</Badge>;
      case "Pembayaran Dikirim":
        return <Badge className="bg-blue-500 text-white border-blue-600 px-3 py-1 font-bold">Pembayaran Dikirim</Badge>;
      case "Dikonfirmasi":
      case "Aktif":
        return <Badge className="bg-emerald-500 text-white border-emerald-600 px-3 py-1 font-bold">Sewa Aktif</Badge>;
      case "Selesai":
        return <Badge className="bg-slate-500 text-white border-slate-600 px-3 py-1 font-bold">Selesai</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-semibold mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          {/* Page Heading & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID ORDER: #{order.id.slice(-8).toUpperCase()}</span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Detail Transaksi Penyewaan</h1>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left/Middle side: Order details & Payment (cols-2) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Product Info Card */}
              <Card className="rounded-2xl border-slate-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                    Barang yang Disewa
                  </h2>

                  {item && (
                    <div className="flex gap-4 items-start">
                      <img
                        src={item.photos[0]}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.specs}</p>
                        
                        {store && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 font-medium">
                            <Store className="h-3.5 w-3.5 text-blue-600" />
                            <span>Toko: <strong>{store.name}</strong> ({store.city})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery details section */}
                  <div className="mt-6 border-t border-slate-100 pt-6 space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Metode & Informasi Pengantaran
                    </h4>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">Pilihan Pengantaran:</span>
                        <Badge className={`${
                          order.deliveryMethod === "Diantar" 
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" 
                            : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
                        } font-bold text-[10px]`}>
                          {order.deliveryMethod}
                        </Badge>
                      </div>

                      {order.deliveryMethod === "Ambil di Lokasi" ? (
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold text-[10px] uppercase">LOKASI PENGAMBILAN (ALAMAT TOKO)</span>
                          <p className="text-slate-800 font-extrabold leading-relaxed">
                            {store?.address || "Solo (Silakan hubungi owner untuk detail alamat lengkap toko)"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold text-[10px] uppercase">ALAMAT PENGANTARAN (PENGIRIMAN)</span>
                          <p className="text-slate-800 font-extrabold leading-relaxed">
                            {order.deliveryAddress || "Alamat tidak diinput (Hubungi customer untuk konfirmasi)"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rental Dates & Price Breakdown */}
                  <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block font-bold mb-1">TANGGAL MULAI</span>
                        <span className="text-slate-800 text-sm font-bold">{order.startDate}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block font-bold mb-1">TANGGAL SELESAI</span>
                        <span className="text-slate-800 text-sm font-bold">{order.endDate}</span>
                      </div>
                    </div>

                    <div className="bg-slate-55 p-4 rounded-xl border border-slate-100 text-sm space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Tarif Sewa:</span>
                        <span className="font-bold text-slate-800">
                          Rp {order.pricePerDay.toLocaleString("id-ID")} x {order.durationDays} hari
                        </span>
                      </div>
                      
                      {/* Commission transparency as requested by PRD */}
                      <div className="flex justify-between text-xs text-slate-400 border-t border-slate-100/60 pt-2.5">
                        <span>Bagian Owner (90%):</span>
                        <span>Rp {order.ownerEarnings.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 pb-1">
                        <span>Biaya Platform (10%):</span>
                        <span>Rp {order.commission.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black">
                        <span className="text-slate-800">Total Pembayaran:</span>
                        <span className="text-teal-600">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Steps Section */}
              {order.status === "Menunggu Pembayaran" && currentUser.role === "Customer" && (
                <Card className="rounded-2xl border-slate-100 bg-white shadow-md overflow-hidden">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Instruksi Pembayaran Manual
                    </h2>

                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Silakan lakukan transfer manual sejumlah total tagihan ke salah satu rekening bersama **Barang Bareng** di bawah ini:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                          <span className="text-[10px] font-bold text-blue-700 tracking-wider block uppercase mb-1">Transfer Bank BCA</span>
                          <span className="text-lg font-black text-slate-800 block">8179035726</span>
                          <span className="text-xs text-slate-500 font-semibold mt-1 block">A.N. Barang Bareng</span>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                          <span className="text-[10px] font-bold text-orange-600 tracking-wider block uppercase mb-1">DANA / GOPAY</span>
                          <span className="text-lg font-black text-slate-800 block">081354496995</span>
                          <span className="text-xs text-slate-500 font-semibold mt-1 block">A.N. Barang Bareng</span>
                        </div>
                      </div>

                      <form onSubmit={handleUploadProof} className="border-t border-slate-100 pt-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 block">
                            <Upload className="h-4 w-4 text-blue-600" />
                            Pilih File Bukti Transfer
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            required={true}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setProofFile(e.target.files[0]);
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                          />
                          {proofFile && (
                            <p className="text-[10px] text-slate-500 font-semibold">
                              File terpilih: {proofFile.name} ({(proofFile.size / 1024).toFixed(1)} KB)
                            </p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl disabled:opacity-50"
                        >
                          {isUploading ? "Mengunggah Bukti..." : "Konfirmasi Pembayaran Telah Dikirim"}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Proof Preview if uploaded */}
              {order.paymentProofUrl && (
                <Card className="rounded-2xl border-slate-100 bg-white shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Bukti Transfer Diunggah
                    </h2>
                    
                    <div className="border border-slate-100 rounded-xl overflow-hidden aspect-video bg-slate-50 flex items-center justify-center relative">
                      <img
                        src={order.paymentProofUrl}
                        alt="Bukti Transfer"
                        className="max-h-full max-w-full object-contain"
                      />
                      <a 
                        href={order.paymentProofUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-black/80 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buka Gambar
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Kolom Jaminan Customer (Upload Kartu Identitas) */}
              <Card className="rounded-2xl border-slate-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    Jaminan Penyewaan (Kartu Identitas)
                  </h2>
                  
                  {order.identityProofUrl ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 text-purple-800 text-xs rounded-xl flex items-center gap-2 border border-purple-100">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className="font-semibold">Kartu Identitas Jaminan telah diunggah & aman di sistem.</span>
                      </div>
                      
                      <div className="border border-slate-100 rounded-xl overflow-hidden aspect-video bg-slate-50 flex items-center justify-center relative">
                        <img
                          src={order.identityProofUrl}
                          alt="Kartu Identitas Jaminan"
                          className="max-h-full max-w-full object-contain"
                        />
                        <a 
                          href={order.identityProofUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-black/80 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Buka Gambar
                        </a>
                      </div>

                      {currentUser.role === "Customer" && (
                        <form onSubmit={handleUploadIdentity} className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            Ganti Kartu Identitas (KTP/SIM/Paspor)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setIdFile(e.target.files[0]);
                                }
                              }}
                              className="flex-1 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                            />
                            <Button 
                              type="submit" 
                              disabled={isUploadingId}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 text-xs"
                            >
                              {isUploadingId ? "Mengunggah..." : "Unggah Ulang"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl flex items-center gap-2 border border-amber-100">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="font-semibold">
                          {currentUser.role === "Customer" 
                            ? "Harap unggah KTP/SIM Anda sebagai jaminan sebelum serah terima barang." 
                            : "Customer belum mengunggah kartu identitas jaminan."}
                        </span>
                      </div>

                      {currentUser.role === "Customer" ? (
                        <form onSubmit={handleUploadIdentity} className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">
                              Unggah Kartu Identitas (KTP/SIM/Paspor)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              required={true}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setIdFile(e.target.files[0]);
                                }
                              }}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                            />
                            {idFile && (
                              <p className="text-[10px] text-slate-500 font-semibold">
                                File terpilih: {idFile.name} ({(idFile.size / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>

                          <Button 
                            type="submit" 
                            disabled={isUploadingId}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                          >
                            {isUploadingId ? "Mengunggah Kartu..." : "Simpan Kartu Identitas Jaminan"}
                          </Button>
                        </form>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-semibold text-center py-4">
                          Menunggu customer mengunggah kartu identitas jaminan.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Right side: Action Steps / Owner Panel (col-1) */}
            <div className="space-y-6">
              
              {/* Status Roadmap */}
              <Card className="rounded-2xl border-slate-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Alur Status Transaksi
                  </h2>

                  <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 text-xs">
                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        order.status !== "Menunggu Pembayaran" ? "border-emerald-500 bg-emerald-500" : "border-amber-500"
                      }`}>
                        {order.status !== "Menunggu Pembayaran" && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-bold text-slate-800">1. Menunggu Pembayaran</span>
                      <p className="text-slate-400 mt-0.5">Customer melakukan transfer dana.</p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        order.status === "Pembayaran Dikirim" || order.status === "Dikonfirmasi" || order.status === "Aktif" || order.status === "Selesai"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-200"
                      }`}>
                        {(order.status === "Dikonfirmasi" || order.status === "Aktif" || order.status === "Selesai") && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-bold text-slate-800">2. Pembayaran Dikirim</span>
                      <p className="text-slate-400 mt-0.5">Bukti transfer berhasil diunggah.</p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        order.status === "Dikonfirmasi" || order.status === "Aktif" || order.status === "Selesai"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-200"
                      }`}>
                        {order.status === "Selesai" && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-bold text-slate-800">3. Pembayaran Terverifikasi (Sewa Aktif)</span>
                      <p className="text-slate-400 mt-0.5">Admin memverifikasi pembayaran.</p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        order.status === "Selesai" ? "border-emerald-500 bg-emerald-500" : "border-slate-200"
                      }`}></div>
                      <span className="font-bold text-slate-800">4. Sewa Selesai</span>
                      <p className="text-slate-400 mt-0.5">Masa rental habis, barang dikembalikan.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Panels for Admin & Customer */}
              {currentUser.role === "Admin" && order.status === "Pembayaran Dikirim" && (
                <Card className="rounded-2xl border-orange-200 bg-orange-50/50 shadow-md">
                  <CardContent className="p-6 text-center space-y-4">
                    <Clock className="h-8 w-8 text-orange-500 mx-auto" />
                    <div>
                      <h3 className="font-bold text-orange-800">Verifikasi Pembayaran</h3>
                      <p className="text-xs text-orange-950 mt-1 leading-relaxed">
                        Harap periksa bukti pembayaran di samping. Jika dana transfer dari customer sudah masuk ke rekening Admin, klik tombol di bawah untuk mengaktifkan sewa.
                      </p>
                    </div>
                    <Button 
                      onClick={handleConfirm}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl"
                    >
                      Konfirmasi & Aktifkan Sewa
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Complete renting flow */}
              {(currentUser.role === "Owner" || currentUser.role === "Customer") && (order.status === "Dikonfirmasi" || order.status === "Aktif") && (
                <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50 shadow-md">
                  <CardContent className="p-6 text-center space-y-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto animate-pulse" />
                    <div>
                      <h3 className="font-bold text-emerald-800">Masa Sewa Berjalan</h3>
                      <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                        Barang sedang disewa. Jika masa rental telah selesai dan barang dikembalikan ke Owner dengan baik, selesaikan order ini.
                      </p>
                    </div>
                    {currentUser.role === "Customer" ? (
                      <Button 
                        onClick={handleComplete}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
                      >
                        Selesaikan Penyewaan
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleComplete}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl"
                      >
                        Selesai & Lepas Saldo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Safe Escrow disclaimer */}
              <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <span>Dana aman dalam jaminan sistem Barang Bareng.</span>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
