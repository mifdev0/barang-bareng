"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp, Message, Chat } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Send, 
  Tag, 
  CalendarDays, 
  MessageSquare, 
  MapPin, 
  ShoppingBag, 
  HelpCircle,
  Clock,
  ChevronRight
} from "lucide-react";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("id");
  
  const { 
    currentUser, 
    chats, 
    messages, 
    items, 
    users, 
    sendMessage, 
    createOrder,
    stores,
    showAlert
  } = useApp();

  const [inputMsg, setInputMsg] = useState("");
  const [negoPrice, setNegoPrice] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isNegoDialogOpen, setIsNegoDialogOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"Ambil di Lokasi" | "Diantar">("Ambil di Lokasi");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push("/login?redirect=/chat");
    }
  }, [currentUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  if (!currentUser) return null;

  // Filter chats belonging to this user
  const userChats = chats.filter((c) => 
    currentUser.role === "Owner" ? c.ownerId === currentUser.id : c.customerId === currentUser.id
  );

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeItem = activeChat ? items.find((i) => i.id === activeChat.itemId) : null;
  const activeStore = activeItem ? stores.find((s) => s.id === activeItem.storeId) : null;
  const activeChatMessages = activeChatId ? messages[activeChatId] || [] : [];
  
  // Find the other user details
  const getOtherUser = (chat: Chat) => {
    const otherId = currentUser.role === "Owner" ? chat.customerId : chat.ownerId;
    return users.find((u) => u.id === otherId);
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !inputMsg.trim()) return;
    await sendMessage(activeChatId, currentUser.id, inputMsg, "text");
    setInputMsg("");
  };

  const handleSendNego = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !negoPrice) return;
    const priceNum = parseInt(negoPrice.replace(/\D/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) return;

    await sendMessage(
      activeChatId, 
      currentUser.id, 
      `Mengajukan harga penawaran baru harian: Rp ${priceNum.toLocaleString("id-ID")}`, 
      "negotiation", 
      priceNum
    );
    setNegoPrice("");
    setIsNegoDialogOpen(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !activeItem || !startDate || !endDate) return;

    if (deliveryMethod === "Diantar" && !deliveryAddress.trim()) {
      showAlert("Alamat Diperlukan", "Harap isi alamat pengantaran customer.", "error");
      return;
    }

    // Determine finalized price per day. Default is item price. Check if there was a negotiation deal.
    let finalPrice = activeItem.pricePerDay;
    const negotiationMsgs = activeChatMessages.filter((m) => m.type === "negotiation");
    if (negotiationMsgs.length > 0) {
      // Use the last negotiated price
      const lastNego = negotiationMsgs[negotiationMsgs.length - 1];
      if (lastNego.negotiatedPrice) {
        finalPrice = lastNego.negotiatedPrice;
      }
    }

    const order = await createOrder(
      activeChat.id,
      activeItem.id,
      activeChat.customerId,
      activeChat.ownerId,
      startDate,
      endDate,
      finalPrice,
      deliveryMethod,
      deliveryMethod === "Diantar" ? deliveryAddress : ""
    );

    // Send order link message in chat
    await sendMessage(
      activeChat.id,
      currentUser.id,
      `Tautan Pembayaran Order #${order.id.slice(-6)} telah dibuat.`,
      "order_link",
      undefined,
      order.id
    );

    setIsOrderDialogOpen(false);
    setStartDate("");
    setEndDate("");
    setDeliveryAddress("");
    setDeliveryMethod("Ambil di Lokasi");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex container mx-auto px-4 sm:px-6 py-6 overflow-hidden h-[calc(100vh-180px)]">
        
        {/* Main grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden h-full">
          
          {/* Left Panel: Chat List (cols-4) */}
          <div className="md:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Daftar Percakapan
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {currentUser.role === "Owner" ? "Sebagai Owner (Pemberi Sewa)" : "Sebagai Customer (Penyewa)"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {userChats.length > 0 ? (
                userChats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const item = items.find((i) => i.id === chat.itemId);
                  const isSelected = chat.id === activeChatId;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => router.push(`/chat?id=${chat.id}`)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                          : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      <img
                        src={otherUser?.avatar}
                        alt={otherUser?.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-black text-slate-800 truncate">{otherUser?.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                            {new Date(chat.lastUpdated).toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})}
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-blue-600 font-bold mb-1 truncate">
                          {item?.name}
                        </div>

                        <p className="text-xs text-slate-500 truncate font-medium">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <MessageSquare className="h-8 w-8 mb-2 stroke-1" />
                  <span className="text-xs font-semibold">Belum ada chat aktif.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat (cols-8) */}
          <div className="md:col-span-8 flex flex-col h-full">
            {activeChat && activeItem ? (
              <>
                {/* Chat Header: item details + action buttons */}
                <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={activeItem.photos[0]}
                      alt={activeItem.name}
                      className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{activeItem.category}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] text-teal-600 font-bold">
                          Rp {activeItem.pricePerDay.toLocaleString("id-ID")}/hari
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm truncate hover:text-blue-700">
                        <Link href={`/items/${activeItem.id}`}>{activeItem.name}</Link>
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate font-semibold">
                        Lawan Chat: {getOtherUser(activeChat)?.name} ({getOtherUser(activeChat)?.role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* NEGO BUTTON (Both Owner & Customer can click to propose) */}
                    <Dialog open={isNegoDialogOpen} onOpenChange={setIsNegoDialogOpen}>
                      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-orange-200 hover:bg-orange-50 text-orange-700 font-semibold text-xs px-3 select-none transition-colors duration-200 cursor-pointer">
                        <Tag className="h-3.5 w-3.5" />
                        Nego Harga
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Tawarkan Harga Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSendNego} className="space-y-4 pt-4">
                          <div>
                            <span className="text-xs text-slate-500 font-medium">Harga Asli:</span>
                            <p className="text-base font-extrabold text-slate-800">
                              Rp {activeItem.pricePerDay.toLocaleString("id-ID")} / Hari
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Nominal Penawaran (Rp / hari)</label>
                            <Input
                              type="number"
                              required
                              placeholder="Masukkan nominal, contoh: 65000"
                              value={negoPrice}
                              onChange={(e) => setNegoPrice(e.target.value)}
                            />
                          </div>
                          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
                            Kirim Penawaran Nego
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* OWNER ONLY: Create Order Link */}
                    {currentUser.role === "Owner" && (
                      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                        <DialogTrigger className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 select-none transition-colors duration-200 cursor-pointer">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Buat Order
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white">
                          <DialogHeader>
                            <DialogTitle>Buat Order Sewa Baru</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateOrder} className="space-y-4 pt-4">
                            <div>
                              <span className="text-xs text-slate-500 font-medium">Barang:</span>
                              <p className="text-sm font-bold text-slate-800 truncate">{activeItem.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Tanggal Mulai</label>
                                <Input
                                  type="date"
                                  required
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Tanggal Selesai</label>
                                <Input
                                  type="date"
                                  required
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                />
                              </div>
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
                                <p className="font-bold text-orange-700">Alamat Toko Anda (Pengambilan):</p>
                                <p>{stores.find(s => s.id === activeItem.storeId)?.address || "Solo (Isi di Dashboard jika kosong)"}</p>
                              </div>
                            )}

                            {deliveryMethod === "Diantar" && (
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Alamat Pengantaran Customer</label>
                                <textarea
                                  required
                                  placeholder="Tulis alamat lengkap pengantaran customer..."
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[60px]"
                                />
                              </div>
                            )}

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Harga Kesepakatan:</span>
                                <span className="font-bold text-slate-700">
                                  Rp {(
                                    activeChatMessages.filter(m => m.type === "negotiation").pop()?.negotiatedPrice || 
                                    activeItem.pricePerDay
                                  ).toLocaleString("id-ID")} / hari
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Komisi Platform (10%):</span>
                                <span className="text-amber-600 font-medium">Auto-kalkulasi</span>
                              </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                              Kirim Link Order ke Chat
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {activeChatMessages.map((msg) => {
                    const isSelf = msg.senderId === currentUser.id;
                    
                    if (msg.type === "negotiation") {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-orange-50 border border-orange-200 text-orange-950 px-4 py-3 rounded-2xl text-center max-w-[80%] shadow-sm flex flex-col items-center gap-1.5">
                            <Tag className="h-5 w-5 text-orange-500" />
                            <span className="text-xs font-bold text-orange-700">PENAWARAN NEGO</span>
                            <span className="text-xs font-medium">{msg.content}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "order_link") {
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50 max-w-[80%] rounded-2xl shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                              <ShoppingBag className="h-7 w-7 text-blue-600 animate-bounce" />
                              <div>
                                <span className="text-xs font-black text-blue-800 uppercase tracking-widest block">ORDER DIBUAT</span>
                                <span className="text-[11px] text-slate-500 font-medium">{msg.content}</span>
                              </div>
                              <Button 
                                onClick={() => router.push(`/orders/${msg.orderId}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold size-sm text-xs rounded-xl px-4 py-1.5 flex items-center gap-1"
                              >
                                <span>Proses Order & Bayar</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                              <span className="text-[9px] text-slate-400">
                                {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})}
                              </span>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex gap-2 max-w-[70%] items-start">
                          {!isSelf && (
                            <img
                              src={getOtherUser(activeChat)?.avatar}
                              alt="Avatar"
                              className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                            />
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                              isSelf
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={`text-[9px] block text-right mt-1.5 ${
                                isSelf ? "text-blue-100" : "text-slate-400"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendText} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                  <Input
                    type="text"
                    required
                    placeholder="Tulis pesan ke owner..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:bg-white"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-slate-50/10">
                <MessageSquare className="h-16 w-16 mb-4 text-slate-300 stroke-1" />
                <h3 className="font-bold text-slate-700 text-lg">Pilih Percakapan</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Pilih salah satu percakapan di kolom kiri untuk melihat riwayat pesan dan mulai melakukan negosiasi harga sewa.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-bold">
          Memuat Percakapan...
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

