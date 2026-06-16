"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp, Order, Store, Item } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ShoppingBag, 
  Store as StoreIcon, 
  ClipboardList, 
  Plus, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  Settings,
  User
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    orders, 
    stores, 
    items, 
    users,
    addStore, 
    updateStore,
    addItem, 
    updateItem, 
    confirmPayment, 
    completeOrder,
    confirmPayout,
    uploadImage,
    updateProfile,
    showAlert,
    showConfirm
  } = useApp();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push("/login?redirect=/dashboard");
    }
  }, [currentUser]);

  // Form states for Store creation
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategory, setStoreCategory] = useState("Cars");
  const [storeCity, setStoreCity] = useState("Solo");
  const [storeAddress, setStoreAddress] = useState("");
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);

  // Form states for Item creation
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemSpecs, setItemSpecs] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemStock, setItemStock] = useState("1");
  const [itemPhoto, setItemPhoto] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [itemCategory, setItemCategory] = useState("Cars");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  // Form states for Profile edit
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Form states for Store edit
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editStoreName, setEditStoreName] = useState("");
  const [editStoreDesc, setEditStoreDesc] = useState("");
  const [editStoreCategory, setEditStoreCategory] = useState("Cars");
  const [editStoreAddress, setEditStoreAddress] = useState("");
  const [editStoreLogoFile, setEditStoreLogoFile] = useState<File | null>(null);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);

  // Sync profile edit state
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone || "");
    }
  }, [currentUser]);

  // Filter lists based on role
  const customerOrders = orders.filter((o) => o.customerId === currentUser?.id);
  const ownerStores = stores.filter((s) => s.ownerId === currentUser?.id);
  const ownerStoreIds = ownerStores.map((s) => s.id);
  const ownerItems = items.filter((i) => ownerStoreIds.includes(i.storeId));
  const ownerOrders = orders.filter((o) => o.ownerId === currentUser?.id);

  // Owner payout stats calculations
  const ownerPendingOrders = ownerOrders.filter(
    (o) => (o.status === "Dikonfirmasi" || o.status === "Aktif" || o.status === "Selesai") && o.payoutStatus !== "Paid"
  );
  const ownerPaidOrders = ownerOrders.filter((o) => o.payoutStatus === "Paid");

  const ownerPendingPayout = ownerPendingOrders.reduce((sum, o) => sum + o.ownerEarnings, 0);
  const ownerPaidPayout = ownerPaidOrders.reduce((sum, o) => sum + o.ownerEarnings, 0);

  // Set default store when modal opens or stores change
  useEffect(() => {
    if (ownerStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(ownerStores[0].id);
    }
  }, [ownerStores]);

  if (!currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUpdatingProfile(true);
    try {
      let avatarUrl = currentUser.avatar;
      if (profileFile) {
        avatarUrl = await uploadImage(profileFile, "pinjamin");
      }
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: avatarUrl
      });
      setIsProfileDialogOpen(false);
      setProfileFile(null);
      showAlert("Sukses", "Profil Anda berhasil diperbarui!", "success");
    } catch (err: any) {
      showAlert("Gagal", "Gagal memperbarui profil: " + (err.message || err), "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOpenEditStore = (store: Store) => {
    setEditingStore(store);
    setEditStoreName(store.name);
    setEditStoreDesc(store.description);
    setEditStoreCategory(store.category);
    setEditStoreAddress(store.address || "");
    setEditStoreLogoFile(null);
    setIsEditStoreOpen(true);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setIsUpdatingStore(true);
    try {
      let logoUrl = editingStore.logo;
      if (editStoreLogoFile) {
        logoUrl = await uploadImage(editStoreLogoFile, "pinjamin");
      }
      await updateStore(editingStore.id, {
        name: editStoreName,
        description: editStoreDesc,
        category: editStoreCategory,
        address: editStoreAddress,
        logo: logoUrl
      });
      setIsEditStoreOpen(false);
      setEditingStore(null);
      showAlert("Sukses", "Toko berhasil diperbarui!", "success");
    } catch (err: any) {
      showAlert("Gagal", "Gagal memperbarui toko: " + (err.message || err), "error");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeDesc || !storeAddress) return;
    
    await addStore(storeName, storeDesc, storeCategory, storeCity, storeAddress);
    setStoreName("");
    setStoreDesc("");
    setStoreAddress("");
    setIsStoreDialogOpen(false);
    showAlert("Sukses", "Toko berhasil dibuat!", "success");
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemDesc || !itemSpecs || !itemPrice || !selectedStoreId) return;

    const priceNum = parseInt(itemPrice);
    const stockNum = parseInt(itemStock);
    
    let photoUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
    if (itemFile) {
      setIsUploading(true);
      try {
        photoUrl = await uploadImage(itemFile, "pinjamin");
      } catch (err: any) {
        showAlert("Gagal", "Gagal mengunggah gambar: " + (err.message || err), "error");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (itemPhoto.trim()) {
      photoUrl = itemPhoto.trim();
    }

    await addItem({
      storeId: selectedStoreId,
      name: itemName,
      description: itemDesc,
      specs: itemSpecs,
      pricePerDay: priceNum,
      stock: stockNum,
      photos: [photoUrl],
      category: itemCategory,
      status: "Tersedia",
    });

    setItemName("");
    setItemDesc("");
    setItemSpecs("");
    setItemPrice("");
    setItemStock("1");
    setItemPhoto("");
    setItemFile(null);
    setIsItemDialogOpen(false);
    showAlert("Sukses", "Listing barang sewaan baru berhasil ditambahkan!", "success");
  };

  // Render stats and lists for Admin
  const totalReceivedGross = orders
    .filter((o) => o.status !== "Menunggu Pembayaran")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalPlatformEarnings = orders
    .filter((o) => o.status !== "Menunggu Pembayaran")
    .reduce((sum, o) => sum + o.commission, 0);

  const totalPendingPayoutToOwners = orders
    .filter((o) => (o.status === "Dikonfirmasi" || o.status === "Aktif" || o.status === "Selesai") && o.payoutStatus !== "Paid")
    .reduce((sum, o) => sum + o.ownerEarnings, 0);

  const totalPaidPayoutToOwners = orders
    .filter((o) => o.payoutStatus === "Paid")
    .reduce((sum, o) => sum + o.ownerEarnings, 0);

  const totalStores = stores.length;
  const totalUsers = users.length;

  // Escrow Payout List for Admin
  const payoutOrders = orders.filter((o) => o.status === "Dikonfirmasi" || o.status === "Aktif" || o.status === "Selesai");
  const sortedPayoutOrders = [...payoutOrders].sort((a, b) => {
    if (a.payoutStatus === "Pending" && b.payoutStatus === "Paid") return -1;
    if (a.payoutStatus === "Paid" && b.payoutStatus === "Pending") return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dashboard Panel</span>
              <h1 className="text-3xl font-black text-slate-900 mt-1">
                Halo, {currentUser.name}
              </h1>
              <p className="text-slate-500 text-sm">
                Kelola aktivitas penyewaan Anda sebagai <strong className="text-blue-600">{currentUser.role}</strong> di sini.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-sm px-4 py-2 cursor-pointer bg-white text-slate-700 shadow-sm transition-colors duration-200">
                  <User className="h-4 w-4 text-blue-600" />
                  Edit Profil
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Edit Profil Pengguna</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img
                          src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                          alt={currentUser.name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                      <Input
                        required
                        placeholder="Nama Lengkap"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nomor Telepon (WhatsApp)</label>
                      <Input
                        placeholder="Contoh: 081234567890"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Ganti Foto Profil</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProfileFile(e.target.files[0]);
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                      />
                      {profileFile && (
                        <p className="text-[10px] text-slate-500 font-semibold">
                          File terpilih: {profileFile.name} ({(profileFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl disabled:opacity-50"
                    >
                      {isUpdatingProfile ? "Memperbarui Profil..." : "Simpan Perubahan"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {currentUser.role === "Owner" && (
              <div className="flex gap-2">
                {/* Store Creation Dialog */}
                <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
                  <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2 shadow-md shadow-orange-500/10 transition-colors duration-200 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Buat Toko Baru
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Buat Toko Rental Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateStore} className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nama Toko</label>
                        <Input
                          required
                          placeholder="Contoh: Budi Outdoors"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Deskripsi Toko</label>
                        <Input
                          required
                          placeholder="Deskripsi singkat layanan atau jenis barang"
                          value={storeDesc}
                          onChange={(e) => setStoreDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Kategori Utama</label>
                          <select
                            value={storeCategory}
                            onChange={(e) => setStoreCategory(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                          >
                            <option value="Cars">Cars</option>
                            <option value="Property">Property</option>
                            <option value="Jobs">Jobs</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Animes">Animes</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Kota Lokasi Toko</label>
                          <select
                            value={storeCity}
                            onChange={(e) => setStoreCity(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                          >
                            <option value="Solo">Solo</option>
                            <option value="Jakarta" disabled>Jakarta (Coming Soon)</option>
                            <option value="Bandung" disabled>Bandung (Coming Soon)</option>
                            <option value="Surabaya" disabled>Surabaya (Coming Soon)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Alamat Lengkap Toko</label>
                        <textarea
                          required
                          placeholder="Masukkan alamat fisik toko untuk pengambilan barang"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[60px]"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 mt-2 rounded-xl">
                        Buat Toko Sekarang
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
 
                {/* Item Listing Dialog */}
                {ownerStores.length > 0 && (
                  <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                    <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 shadow-md shadow-blue-500/10 transition-colors duration-200 cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Tambah Listing
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] bg-white">
                      <DialogHeader>
                        <DialogTitle>Tambah Barang Rental Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateItem} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Pilih Toko</label>
                            <select
                              value={selectedStoreId}
                              onChange={(e) => setSelectedStoreId(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                            >
                              {ownerStores.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Kategori Barang</label>
                            <select
                              value={itemCategory}
                              onChange={(e) => setItemCategory(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                            >
                              <option value="Cars">Cars</option>
                              <option value="Property">Property</option>
                              <option value="Jobs">Jobs</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Furniture">Furniture</option>
                              <option value="Animes">Animes</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nama Barang</label>
                          <Input
                            required
                            placeholder="Contoh: Kamera DSLR Nikon D3500"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Deskripsi Barang</label>
                          <textarea
                            required
                            placeholder="Spesifikasi kelengkapan, garansi, kondisi fisik..."
                            value={itemDesc}
                            onChange={(e) => setItemDesc(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Spesifikasi Singkat (Pisahkan dengan ' • ')</label>
                          <Input
                            required
                            placeholder="Contoh: Lensa 18-55mm • Memory 32GB • Tas Kamera"
                            value={itemSpecs}
                            onChange={(e) => setItemSpecs(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Tarif Sewa (Rp / Hari)</label>
                            <Input
                              required
                              type="number"
                              placeholder="75000"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Stok Barang</label>
                            <Input
                              required
                              type="number"
                              value={itemStock}
                              onChange={(e) => setItemStock(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Pilih Foto Barang</label>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setItemFile(e.target.files[0]);
                                }
                              }}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                            />
                            {itemFile && (
                              <p className="text-[10px] text-slate-500 font-semibold">
                                File terpilih: {itemFile.name} ({(itemFile.size / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl disabled:opacity-50"
                        >
                          {isUploading ? "Mengunggah Gambar & Menyimpan..." : "Simpan Listing Barang"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>

          {/* ========================================================
              CUSTOMER DASHBOARD
              ======================================================== */}
          {currentUser.role === "Customer" && (
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="bg-white border border-slate-200 p-1 rounded-xl max-w-full overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="orders" className="rounded-lg font-bold text-xs py-2 shrink-0">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Order Sewa Saya
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                {customerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {customerOrders.map((order) => {
                      const item = items.find((i) => i.id === order.itemId);
                      return (
                        <Card key={order.id} className="rounded-2xl border-slate-100 bg-white hover:shadow-md transition-all">
                          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-4 items-start">
                              <img
                                src={item?.photos[0]}
                                alt={item?.name}
                                className="h-16 w-16 rounded-xl object-cover border shrink-0"
                              />
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID: #{order.id.slice(-6).toUpperCase()}</span>
                                <h3 className="font-extrabold text-slate-800 text-sm mt-0.5">{item?.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                  Sewa: {order.startDate} s/d {order.endDate} ({order.durationDays} hari)
                                </p>
                                <p className="text-xs font-black text-teal-600 mt-1">
                                  Total: Rp {order.totalPrice.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
                              <Badge className="font-bold rounded text-xs px-2.5 py-0.5 self-start sm:self-end">
                                {order.status}
                              </Badge>
                              <Link href={`/orders/${order.id}`} className="w-full sm:w-auto">
                                <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-bold">
                                  Lihat Detail & Bayar
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="rounded-2xl border-slate-200/60 p-12 text-center max-w-lg mx-auto bg-white">
                    <CardContent className="p-0 space-y-4">
                      <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Belum Ada Order Aktif</h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Silakan kunjungi katalog barang sewaan kami untuk melakukan penyewaan barang pertama Anda.
                        </p>
                      </div>
                      <Link href="/#katalog">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold">
                          Jelajahi Katalog
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* ========================================================
              OWNER DASHBOARD
              ======================================================== */}
          {currentUser.role === "Owner" && (
            <div className="space-y-8">
              {/* Financial Balance Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <Card className="rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white border-0 shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-100 font-bold block uppercase tracking-wider">Saldo Pending (Belum Ditransfer Admin)</span>
                      <span className="text-2xl font-black block mt-2">
                        Rp {ownerPendingPayout.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-0 shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-100 font-bold block uppercase tracking-wider">Saldo Cair (Sudah Ditransfer Admin)</span>
                      <span className="text-2xl font-black block mt-2">
                        Rp {ownerPaidPayout.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-white border-slate-200/60 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Toko Aktif</span>
                      <span className="text-2xl font-black block text-slate-800 mt-2">
                        {ownerStores.length} Toko
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                      <StoreIcon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-white border-slate-200/60 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Listing Barang</span>
                      <span className="text-2xl font-black block text-slate-800 mt-2">
                        {ownerItems.length} Barang
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Tabs */}
              <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="bg-white border border-slate-200 p-1 rounded-xl max-w-full overflow-x-auto flex-nowrap justify-start">
                  <TabsTrigger value="orders" className="rounded-lg font-bold text-xs py-2 shrink-0">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Order Masuk ({ownerOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="stores" className="rounded-lg font-bold text-xs py-2 shrink-0">
                    <StoreIcon className="h-4 w-4 mr-2" />
                    Toko Saya ({ownerStores.length})
                  </TabsTrigger>
                  <TabsTrigger value="items" className="rounded-lg font-bold text-xs py-2 shrink-0">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Daftar Barang ({ownerItems.length})
                  </TabsTrigger>
                </TabsList>

                {/* Orders Content */}
                <TabsContent value="orders" className="space-y-4">
                  {ownerOrders.length > 0 ? (
                    <div className="space-y-4">
                      {ownerOrders.map((order) => {
                        const item = items.find((i) => i.id === order.itemId);
                        const customer = users.find((u) => u.id === order.customerId);
                        return (
                          <Card key={order.id} className="rounded-2xl border-slate-100 bg-white hover:shadow-md transition-all">
                            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex gap-4 items-start">
                                <img
                                  src={item?.photos[0]}
                                  alt={item?.name}
                                  className="h-16 w-16 rounded-xl object-cover border shrink-0"
                                />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID: #{order.id.slice(-6).toUpperCase()}</span>
                                  <h3 className="font-extrabold text-slate-800 text-sm mt-0.5">{item?.name}</h3>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Penyewa: <strong>{customer?.name}</strong> • Durasi: {order.durationDays} hari
                                  </p>
                                  <p className="text-xs font-black text-slate-800 mt-1">
                                    Hasil Bersih (90%): <span className="text-teal-600">Rp {order.ownerEarnings.toLocaleString("id-ID")}</span>
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
                                <Badge className="font-bold rounded text-xs px-2.5 py-0.5 self-start sm:self-end">
                                  {order.status}
                                </Badge>
                                
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Link href={`/orders/${order.id}`}>
                                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-9 px-3">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Detail
                                    </Button>
                                  </Link>

                                  {order.status === "Pembayaran Dikirim" && (
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-lg">
                                      Menunggu Verifikasi Admin
                                    </span>
                                  )}

                                  {(order.status === "Dikonfirmasi" || order.status === "Aktif" || order.status === "Selesai") && (
                                    <Badge className={`text-[10px] font-bold shadow-none ${
                                      order.payoutStatus === "Paid" 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50" 
                                        : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50"
                                    }`}>
                                      Pencairan: {order.payoutStatus === "Paid" ? "Sudah Dibayar" : "Pending Transfer"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="rounded-2xl border-slate-200/60 p-12 text-center max-w-lg mx-auto bg-white">
                      <CardContent className="p-0 space-y-3">
                        <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
                        <h3 className="font-bold text-slate-800 text-base">Belum Ada Order Masuk</h3>
                        <p className="text-slate-500 text-xs">
                          Tautan order baru akan muncul setelah Anda berdiskusi dan membuat kesepakatan harga sewa dengan customer di halaman chat.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Stores Content */}
                <TabsContent value="stores" className="space-y-4">
                  {ownerStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {ownerStores.map((store) => (
                        <Card key={store.id} className="rounded-2xl border-slate-100 bg-white p-5 shadow-sm space-y-4">
                          <div className="flex gap-4 items-center border-b border-slate-100 pb-4">
                            <img
                              src={store.logo}
                              alt={store.name}
                              className="h-12 w-12 rounded-xl object-cover border"
                            />
                            <div>
                              <h3 className="font-extrabold text-slate-800 text-sm">{store.name}</h3>
                              <div className="flex flex-col gap-1 mt-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3 text-orange-500" />
                                  <span>{store.city}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                  <span>{store.category}</span>
                                </div>
                                {store.address && (
                                  <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                                    Alamat: {store.address}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            "{store.description}"
                          </p>

                          <div className="flex justify-between items-center pt-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Aktif</Badge>
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={() => handleOpenEditStore(store)}
                                variant="outline" 
                                size="sm" 
                                className="h-8 rounded-lg text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer px-2.5 py-0"
                              >
                                <Settings className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                Edit Toko
                              </Button>
                              <span className="text-xs text-slate-400 font-medium">
                                {items.filter(i => i.storeId === store.id).length} Barang Terlisting
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white border rounded-2xl max-w-sm mx-auto">
                      <StoreIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="font-bold text-slate-800 text-sm">Anda Belum Membuat Toko</h3>
                      <p className="text-slate-500 text-xs mt-1">Harap buat toko rental pertama Anda terlebih dahulu menggunakan tombol di pojok kanan atas.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Items Content */}
                <TabsContent value="items" className="space-y-4">
                  {ownerItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {ownerItems.map((item) => (
                        <Card key={item.id} className="rounded-2xl border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                            <img
                              src={item.photos[0]}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="font-semibold text-[10px] rounded px-2 py-0.5 bg-black/60 text-white">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col justify-between h-[120px]">
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.category}</p>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-2">
                              <span className="font-black text-sm text-teal-600">
                                Rp {item.pricePerDay.toLocaleString("id-ID")}/hari
                              </span>
                              <Link href={`/items/${item.id}`}>
                                <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-blue-600 px-2">
                                  Lihat
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white border rounded-2xl max-w-sm mx-auto">
                      <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Listing Barang</h3>
                      <p className="text-slate-500 text-xs mt-1">Tambahkan listing barang rental baru agar customer dapat melihat dan menyewanya di katalog.</p>
                    </div>
                  )}
                </TabsContent>

              </Tabs>
            </div>
          )}

          {/* ========================================================
              ADMIN DASHBOARD
              ======================================================== */}
          {currentUser.role === "Admin" && (
            <div className="space-y-8">
              {/* Financial Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <Card className="rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white border-0 shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-100 font-bold block uppercase tracking-wider">Total Uang Masuk (Gross)</span>
                      <span className="text-2xl font-black block mt-2">
                        Rp {totalReceivedGross.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 text-white border-0 shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-rose-100 font-bold block uppercase tracking-wider">Harus Dibayar ke Owner (Pending)</span>
                      <span className="text-2xl font-black block mt-2">
                        Rp {totalPendingPayoutToOwners.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-0 shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-100 font-bold block uppercase tracking-wider">Sudah Dibayar ke Owner (Cair)</span>
                      <span className="text-2xl font-black block mt-2">
                        Rp {totalPaidPayoutToOwners.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-white border-slate-200/60 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Komisi Platform Bersih (10%)</span>
                      <span className="text-2xl font-black block text-slate-800 mt-2">
                        Rp {totalPlatformEarnings.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Escrow Payouts Payout Management */}
              <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                  Daftar Pencairan Saldo Owner (Escrow Payout)
                </h2>

                {sortedPayoutOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Order ID</th>
                          <th className="py-3 px-2">Nama Toko</th>
                          <th className="py-3 px-2">Owner (Penerima)</th>
                          <th className="py-3 px-2">No. HP Owner</th>
                          <th className="py-3 px-2">Jumlah Transfer (90%)</th>
                          <th className="py-3 px-2">Status Payout</th>
                          <th className="py-3 px-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                        {sortedPayoutOrders.map((o) => {
                          const storeObj = stores.find(s => s.ownerId === o.ownerId || s.id === o.itemId);
                          const ownerObj = users.find(u => u.id === o.ownerId);
                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-2 font-bold text-slate-500">#{o.id.slice(-6).toUpperCase()}</td>
                              <td className="py-4 px-2 font-bold">{storeObj?.name || "Toko Solo"}</td>
                              <td className="py-4 px-2">{ownerObj?.name}</td>
                              <td className="py-4 px-2">{ownerObj?.phone || "-"}</td>
                              <td className="py-4 px-2 font-black text-slate-800">Rp {o.ownerEarnings.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-2">
                                <Badge className={`text-[10px] px-1.5 py-0.5 rounded shadow-none font-semibold ${
                                  o.payoutStatus === "Paid" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50" 
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                                }`}>
                                  {o.payoutStatus === "Paid" ? "Sudah Ditransfer" : "Pending"}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 text-right">
                                {o.payoutStatus === "Pending" ? (
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      showConfirm(
                                        "Konfirmasi Transfer",
                                        `Apakah Anda yakin telah mentransfer Rp ${o.ownerEarnings.toLocaleString("id-ID")} ke Owner ${ownerObj?.name}?`,
                                        async () => {
                                          try {
                                             await confirmPayout(o.id);
                                             showAlert("Sukses", "Payout berhasil dicairkan/dikonfirmasi!", "success");
                                          } catch (err: any) {
                                             showAlert("Gagal", "Gagal mencairkan: " + err.message, "error");
                                          }
                                        }
                                      );
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] h-7 px-2.5 rounded-lg cursor-pointer"
                                  >
                                    Konfirmasi Transfer
                                  </Button>
                                ) : (
                                  <span className="text-slate-400 text-[10px] font-semibold italic">Selesai</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-12 text-slate-400">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <span>Belum ada order sewa yang dikonfirmasi untuk pencairan saldo.</span>
                  </div>
                )}
              </Card>

              {/* Transactions logs table */}
              <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                  Semua Riwayat Transaksi Platform
                </h2>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Order ID</th>
                          <th className="py-3 px-2">Penyewa</th>
                          <th className="py-3 px-2">Total Sewa</th>
                          <th className="py-3 px-2">Komisi Barang Bareng (10%)</th>
                          <th className="py-3 px-2">Bagian Owner (90%)</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                        {orders.map((o) => {
                          const customerObj = users.find(u => u.id === o.customerId);
                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-2 font-bold text-slate-500">#{o.id.slice(-6).toUpperCase()}</td>
                              <td className="py-4 px-2">{customerObj?.name}</td>
                              <td className="py-4 px-2 font-black text-slate-800">Rp {o.totalPrice.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-2 text-purple-600 font-bold">Rp {o.commission.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-2 text-teal-600 font-bold">Rp {o.ownerEarnings.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-2">
                                <Badge className="text-[10px] px-1.5 py-0.5 rounded shadow-none font-semibold">
                                  {o.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 text-right">
                                <Link href={`/orders/${o.id}`}>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-blue-600">
                                    Detail
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-12 text-slate-400">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <span>Belum ada transaksi di platform.</span>
                  </div>
                )}
              </Card>

              {/* Stores & Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Users List */}
                <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4.5 w-4.5 text-blue-600" />
                    Pengguna Terdaftar ({users.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <div key={u.id} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-50 bg-slate-50/30 text-xs">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover border" />
                          <div>
                            <span className="font-bold text-slate-800 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                        <Badge className="font-bold text-[9px] px-1.5 py-0.5 rounded">{u.role}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Stores List */}
                <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                    <StoreIcon className="h-4.5 w-4.5 text-orange-500" />
                    Toko Terdaftar ({stores.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {stores.map((s) => {
                      const owner = users.find(u => u.id === s.ownerId);
                      return (
                        <div key={s.id} className="p-2.5 rounded-xl border border-slate-50 bg-slate-50/30 text-xs flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Pemilik: {owner?.name || "N/A"}</span>
                            <span className="text-[10px] text-slate-500 block">Kota: {s.city} | Kategori: {s.category}</span>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-150">Aktif</Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Store Edit Dialog */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Informasi Toko</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStore} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Toko</label>
              <Input
                required
                placeholder="Nama Toko"
                value={editStoreName}
                onChange={(e) => setEditStoreName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi Toko</label>
              <textarea
                required
                placeholder="Deskripsi..."
                value={editStoreDesc}
                onChange={(e) => setEditStoreDesc(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kategori Toko</label>
                <select
                  value={editStoreCategory}
                  onChange={(e) => setEditStoreCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="Cars">Cars</option>
                  <option value="Property">Property</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Animes">Animes</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kota Lokasi Toko</label>
                <Input
                  disabled
                  value="Solo"
                  className="rounded-lg border-slate-200 bg-slate-50 text-slate-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Alamat Lengkap Toko</label>
              <textarea
                required
                placeholder="Masukkan alamat fisik toko..."
                value={editStoreAddress}
                onChange={(e) => setEditStoreAddress(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Ganti Logo Toko (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditStoreLogoFile(e.target.files[0]);
                  }
                }}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white cursor-pointer"
              />
              {editStoreLogoFile && (
                <p className="text-[10px] text-slate-500 font-semibold">
                  File terpilih: {editStoreLogoFile.name} ({(editStoreLogoFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isUpdatingStore}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-xl disabled:opacity-50"
            >
              {isUpdatingStore ? "Memperbarui Toko..." : "Simpan Perubahan Toko"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
