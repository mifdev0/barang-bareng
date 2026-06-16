"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type Role = "Customer" | "Owner" | "Admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  phone: string;
  balance?: number;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  city: string;
  isActive: boolean;
  logo: string;
  address: string;
}

export interface Item {
  id: string;
  storeId: string;
  name: string;
  description: string;
  specs: string;
  pricePerDay: number;
  stock: number;
  photos: string[];
  category: string;
  status: "Tersedia" | "Disewa" | "Nonaktif";
  rating: number;
  reviewCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "negotiation" | "order_link";
  negotiatedPrice?: number;
  orderId?: string;
}

export interface Chat {
  id: string;
  customerId: string;
  ownerId: string;
  itemId: string;
  lastMessage?: string;
  lastUpdated: string;
}

export type OrderStatus =
  | "Menunggu Pembayaran"
  | "Pembayaran Dikirim"
  | "Dikonfirmasi"
  | "Aktif"
  | "Selesai";

export interface Order {
  id: string;
  chatId: string;
  itemId: string;
  customerId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  pricePerDay: number;
  totalPrice: number;
  commission: number;
  ownerEarnings: number;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentConfirmedAt?: string;
  deliveryMethod: "Ambil di Lokasi" | "Diantar";
  deliveryAddress?: string;
  payoutStatus: "Pending" | "Paid";
  payoutConfirmedAt?: string;
}

import { CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";

interface AppContextType {
  users: User[];
  stores: Store[];
  items: Item[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  orders: Order[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role: Role) => Promise<boolean>;
  register: (name: string, email: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  addStore: (name: string, description: string, category: string, city: string, address: string) => Promise<Store>;
  updateStore: (storeId: string, updates: Partial<Store>) => Promise<void>;
  addItem: (item: Omit<Item, "id" | "rating" | "reviewCount">) => Promise<Item>;
  updateItem: (itemId: string, updates: Partial<Item>) => Promise<void>;
  createChat: (customerId: string, ownerId: string, itemId: string) => Promise<Chat>;
  sendMessage: (chatId: string, senderId: string, content: string, type?: "text" | "negotiation" | "order_link", negotiatedPrice?: number, orderId?: string) => Promise<void>;
  createOrder: (chatId: string, itemId: string, customerId: string, ownerId: string, startDate: string, endDate: string, finalPricePerDay: number, deliveryMethod?: "Ambil di Lokasi" | "Diantar", deliveryAddress?: string) => Promise<Order>;
  uploadPaymentProof: (orderId: string, proofUrl: string) => Promise<void>;
  confirmPayment: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  confirmPayout: (orderId: string) => Promise<void>;
  uploadImage: (file: File, bucket?: string) => Promise<string>;
  updateProfile: (updates: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  isSupabaseConfigured: boolean;
  showAlert: (title: string, message: string, type?: "success" | "error" | "info") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>, onCancel?: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Solo Area Specific Seed Data
const initialUsers: User[] = [
  {
    id: "user-1",
    email: "budi@rental.com",
    name: "Budi Solo Adventure",
    role: "Owner",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    phone: "081234567890",
    balance: 450000,
  },
  {
    id: "user-2",
    email: "siti@rent.com",
    name: "Siti Drone & Cam Solo",
    role: "Owner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    phone: "081398765432",
    balance: 135000,
  },
  {
    id: "user-3",
    email: "andi@gmail.com",
    name: "Andi Wijaya Solo",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    phone: "081987654321",
  },
  {
    id: "admin-1",
    email: "admin@pinjamin.com",
    name: "Admin Solo PinjamIn",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    phone: "081354496995",
  },
];

const initialStores: Store[] = [
  {
    id: "store-1",
    ownerId: "user-1",
    name: "Budi Solo Adventure Gear",
    description: "Rental alat camping terlengkap di Solo. Menyediakan tenda premium, carrier bag, sleeping bag, kompor, dll. Siap menemani perjalanan Anda ke Gunung Lawu, Merbabu, dan Merapi.",
    category: "Property",
    city: "Solo",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    address: "Jl. Slamet Riyadi No. 120, Solo",
  },
  {
    id: "store-2",
    ownerId: "user-2",
    name: "Siti Drone & Camera Rental Solo",
    description: "Spesialis sewa Drone DJI, kamera mirrorless, lensa, gimbal stabilizer harian di area Solo Raya untuk dokumentasi cinematic atau event.",
    category: "Electronics",
    city: "Solo",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
    address: "Jl. Adi Sucipto No. 45, Solo",
  },
];

const initialItems: Item[] = [
  {
    id: "item-1",
    storeId: "store-2",
    name: "Drone DJI Mavic 3 Pro (Full Set)",
    description: "Sewa drone DJI Mavic 3 Pro 4K harian di Solo. Kualitas gambar sinematik dengan 3 kamera optik. Paket sewa sudah termasuk remote controller DJI RC, 2 baterai cadangan, charger hub, filter ND, dan tas.",
    specs: "Kamera Hasselblad 4/3 CMOS • Video 5.1K • Waktu Terbang 43 Menit • Sensor Rintangan Omnidirectional",
    pricePerDay: 350000,
    stock: 1,
    photos: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&h=400&fit=crop"],
    category: "Electronics",
    status: "Tersedia",
    rating: 4.9,
    reviewCount: 32,
  },
  {
    id: "item-2",
    storeId: "store-1",
    name: "Tenda Dome Eiger Shaba 4 Orang",
    description: "Tenda dome kapasitas 4 orang merk Eiger Shaba. Sangat cocok untuk mendaki gunung sekitaran Solo (Lawu, Merbabu). Tahan cuaca ekstrim, double layer, frame aluminium ringan.",
    specs: "Kapasitas 4 Orang • Frame Aluminium • Double Layer • Waterproof Index 3000mm",
    pricePerDay: 60000,
    stock: 3,
    photos: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop"],
    category: "Property",
    status: "Tersedia",
    rating: 4.8,
    reviewCount: 45,
  },
  {
    id: "item-3",
    storeId: "store-2",
    name: "Kamera Sony Alpha A7 III (Body Only)",
    description: "Sewa kamera mirrorless full-frame Sony A7 III di Solo. Sangat ideal untuk hunting foto malam hari di Keraton Solo, dokumentasi wedding, maupun videografi profesional. Sensor 24.2MP dan autofokus luar biasa.",
    specs: "Full Frame 24.2 MP • 4K HDR Video • Dual SD Card Slot • 5-axis Stabilization",
    pricePerDay: 180000,
    stock: 2,
    photos: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop"],
    category: "Electronics",
    status: "Tersedia",
    rating: 4.9,
    reviewCount: 58,
  },
  {
    id: "item-4",
    storeId: "store-2",
    name: "Gimbal Stabilizer DJI Ronin RSC 2",
    description: "Stabilizer gimbal untuk kamera mirrorless/DSLR. Hasil video super smooth untuk dokumentasi cinematic. Cocok dipasangkan dengan kamera Sony A7 III.",
    specs: "Beban Maks 3kg • Baterai Tahan 14 Jam • Layar OLED 1 Inch • Desain Lipat Ringkas",
    pricePerDay: 90000,
    stock: 1,
    photos: ["https://images.unsplash.com/photo-1603178455924-ef33372953bb?w=600&h=400&fit=crop"],
    category: "Electronics",
    status: "Tersedia",
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: "item-5",
    storeId: "store-1",
    name: "Carrier Backpack Osprey Atmos AG 50L",
    description: "Tas gunung (carrier) premium Osprey Atmos AG 50 liter. Memiliki sistem sirkulasi udara punggung Anti-Gravity yang sangat nyaman untuk pendakian berat. Sudah termasuk raincover.",
    specs: "Kapasitas 50 Liter • Sistem Punggung Anti-Gravity • Bahan Nylon Kuat • Termasuk Raincover",
    pricePerDay: 45000,
    stock: 2,
    photos: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop"],
    category: "Property",
    status: "Tersedia",
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: "item-6",
    storeId: "store-1",
    name: "Meja Kursi Lipat Camping Eiger (Set)",
    description: "Satu set perlengkapan santai outdoor terdiri dari 1 meja lipat dan 4 kursi lipat mini. Sangat praktis untuk piknik sore hari di Tawangmangu, Karanganyar, atau camping santai.",
    specs: "1x Meja Lipat • 4x Kursi Lipat • Bahan Rangka Baja Kuat • Termasuk Tas Jinjing",
    pricePerDay: 25000,
    stock: 4,
    photos: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop"],
    category: "Furniture",
    status: "Tersedia",
    rating: 4.6,
    reviewCount: 12,
  },
  {
    id: "item-7",
    storeId: "store-2",
    name: "DJI Osmo Action 4 Adventure Combo",
    description: "Action camera DJI Osmo Action 4. Tahan air hingga 18 meter tanpa case tambahan, kualitas video 4K harian. Paket Adventure Combo termasuk 3 baterai, extension rod, dan casing pengisi daya.",
    specs: "Video 4K/120fps • Layar Sentuh Ganda • Tahan Air 18 Meter • Stabilisasi RockSteady 3.0",
    pricePerDay: 85000,
    stock: 2,
    photos: ["https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&h=400&fit=crop"],
    category: "Electronics",
    status: "Disewa",
    rating: 4.8,
    reviewCount: 15,
  },
];

const initialOrders: Order[] = [
  {
    id: "order-1",
    chatId: "chat-1",
    itemId: "item-7",
    customerId: "user-3",
    ownerId: "user-2",
    startDate: "2026-06-15",
    endDate: "2026-06-16",
    durationDays: 1,
    pricePerDay: 85000,
    totalPrice: 85000,
    commission: 8500,
    ownerEarnings: 76500,
    status: "Aktif",
    paymentProofUrl: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=400",
    paymentConfirmedAt: "2026-06-15T09:00:00Z",
    deliveryMethod: "Ambil di Lokasi",
    deliveryAddress: "",
    payoutStatus: "Pending",
  },
];

const initialChats: Chat[] = [
  {
    id: "chat-1",
    customerId: "user-3",
    ownerId: "user-2",
    itemId: "item-7",
    lastMessage: "Barang sudah siap diambil di toko Solo Raya.",
    lastUpdated: "2026-06-15T09:00:00Z",
  },
];

const initialMessages: Record<string, Message[]> = {
  "chat-1": [
    {
      id: "msg-1",
      chatId: "chat-1",
      senderId: "user-3",
      content: "Halo kak, DJI Osmo ready untuk disewa besok?",
      timestamp: "2026-06-15T08:00:00Z",
      type: "text",
    },
    {
      id: "msg-2",
      chatId: "chat-1",
      senderId: "user-2",
      content: "Halo! Ready kak. Silakan order.",
      timestamp: "2026-06-15T08:05:00Z",
      type: "text",
    },
    {
      id: "msg-3",
      chatId: "chat-1",
      senderId: "user-2",
      content: "Buat order DJI Osmo 1 hari",
      timestamp: "2026-06-15T08:11:00Z",
      type: "order_link",
      orderId: "order-1",
    },
    {
      id: "msg-4",
      chatId: "chat-1",
      senderId: "user-2",
      content: "Barang sudah siap diambil di toko Solo Raya.",
      timestamp: "2026-06-15T09:00:00Z",
      type: "text",
    },
  ],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Custom dialog system
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>, onCancel?: () => void) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
      onCancel,
    });
  };
  
  // Detect if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.indexOf("placeholder-project") === -1;

  // Real-time listener for multiple tables (when using Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("app-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            const list = prev[newMsg.chat_id] || [];
            if (list.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.chat_id]: [
                ...list,
                {
                  id: newMsg.id,
                  chatId: newMsg.chat_id,
                  senderId: newMsg.sender_id,
                  content: newMsg.content,
                  timestamp: newMsg.created_at,
                  type: newMsg.type,
                  negotiatedPrice: newMsg.negotiated_price,
                  orderId: newMsg.order_id,
                },
              ],
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const raw = payload.new as any;
          if (payload.eventType === "INSERT") {
            setOrders((prev) => {
              if (prev.some((o) => o.id === raw.id)) return prev;
              return [
                {
                  id: raw.id,
                  chatId: raw.chat_id,
                  itemId: raw.item_id,
                  customerId: raw.customer_id,
                  ownerId: raw.owner_id,
                  startDate: raw.start_date,
                  endDate: raw.end_date,
                  durationDays: raw.duration_days,
                  pricePerDay: Number(raw.price_per_day),
                  totalPrice: Number(raw.total_price),
                  commission: Number(raw.commission),
                  ownerEarnings: Number(raw.owner_earnings),
                  status: raw.status,
                  paymentProofUrl: raw.payment_proof_url,
                  paymentConfirmedAt: raw.payment_confirmed_at,
                  deliveryMethod: raw.delivery_method || "Ambil di Lokasi",
                  deliveryAddress: raw.delivery_address || "",
                  payoutStatus: raw.payout_status || "Pending",
                  payoutConfirmedAt: raw.payout_confirmed_at,
                },
                ...prev,
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === raw.id
                  ? {
                      ...o,
                      status: raw.status,
                      paymentProofUrl: raw.payment_proof_url,
                      paymentConfirmedAt: raw.payment_confirmed_at,
                      payoutStatus: raw.payout_status || "Pending",
                      payoutConfirmedAt: raw.payout_confirmed_at,
                    }
                  : o
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        (payload) => {
          const raw = payload.new as any;
          if (payload.eventType === "INSERT") {
            setChats((prev) => {
              if (prev.some((c) => c.id === raw.id)) return prev;
              return [
                {
                  id: raw.id,
                  customerId: raw.customer_id,
                  ownerId: raw.owner_id,
                  itemId: raw.item_id,
                  lastMessage: raw.last_message,
                  lastUpdated: raw.updated_at,
                },
                ...prev,
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            setChats((prev) =>
              prev.map((c) =>
                c.id === raw.id
                  ? {
                      ...c,
                      lastMessage: raw.last_message,
                      lastUpdated: raw.updated_at,
                    }
                  : c
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        (payload) => {
          const raw = payload.new as any;
          if (payload.eventType === "INSERT") {
            setItems((prev) => {
              if (prev.some((i) => i.id === raw.id)) return prev;
              return [
                ...prev,
                {
                  id: raw.id,
                  storeId: raw.store_id,
                  name: raw.name,
                  description: raw.description,
                  specs: raw.specs,
                  pricePerDay: Number(raw.price_per_day),
                  stock: raw.stock,
                  photos: raw.photos || [],
                  category: raw.category,
                  status: raw.status,
                  rating: Number(raw.rating || 5.0),
                  reviewCount: raw.review_count || 0,
                },
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((i) =>
                i.id === raw.id
                  ? {
                      ...i,
                      name: raw.name,
                      description: raw.description,
                      specs: raw.specs,
                      pricePerDay: Number(raw.price_per_day),
                      stock: raw.stock,
                      photos: raw.photos || [],
                      category: raw.category,
                      status: raw.status,
                    }
                  : i
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stores" },
        (payload) => {
          const raw = payload.new as any;
          if (payload.eventType === "INSERT") {
            setStores((prev) => {
              if (prev.some((s) => s.id === raw.id)) return prev;
              return [
                ...prev,
                {
                  id: raw.id,
                  ownerId: raw.owner_id,
                  name: raw.name,
                  description: raw.description,
                  category: raw.category,
                  city: raw.city,
                  isActive: raw.is_active,
                  logo: raw.logo_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150",
                  address: raw.address || "",
                },
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            setStores((prev) =>
              prev.map((s) =>
                s.id === raw.id
                  ? {
                      ...s,
                      name: raw.name,
                      description: raw.description,
                      category: raw.category,
                      isActive: raw.is_active,
                      logo: raw.logo_url || s.logo,
                      address: raw.address || s.address,
                    }
                  : s
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Sync state from Supabase OR LocalStorage
  useEffect(() => {
    if (isSupabaseConfigured) {
      const fetchSupabaseData = async () => {
        // Fetch Profiles
        const { data: dbProfiles } = await supabase.from("profiles").select("*");
        if (dbProfiles) {
          setUsers(
            dbProfiles.map((p: any) => ({
              id: p.id,
              email: p.email,
              name: p.name,
              role: p.role,
              avatar: p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              phone: p.phone || "",
              balance: p.balance,
            }))
          );
        }

        // Fetch Stores
        const { data: dbStores } = await supabase.from("stores").select("*");
        if (dbStores) {
          setStores(
            dbStores.map((s: any) => ({
              id: s.id,
              ownerId: s.owner_id,
              name: s.name,
              description: s.description,
              category: s.category,
              city: s.city,
              isActive: s.is_active,
              logo: s.logo_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150",
              address: s.address || "",
            }))
          );
        }

        // Fetch Items
        const { data: dbItems } = await supabase.from("items").select("*");
        if (dbItems) {
          setItems(
            dbItems.map((i: any) => ({
              id: i.id,
              storeId: i.store_id,
              name: i.name,
              description: i.description,
              specs: i.specs,
              pricePerDay: Number(i.price_per_day),
              stock: i.stock,
              photos: i.photos || [],
              category: i.category,
              status: i.status,
              rating: Number(i.rating),
              reviewCount: i.review_count,
            }))
          );
        }

        // Fetch Chats
        const { data: dbChats } = await supabase.from("chats").select("*");
        if (dbChats) {
          setChats(
            dbChats.map((c: any) => ({
              id: c.id,
              customerId: c.customer_id,
              ownerId: c.owner_id,
              itemId: c.item_id,
              lastMessage: c.last_message,
              lastUpdated: c.updated_at,
            }))
          );
        }

        // Fetch Messages
        const { data: dbMessages } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
        if (dbMessages) {
          const mappedMsgs: Record<string, Message[]> = {};
          dbMessages.forEach((m: any) => {
            if (!mappedMsgs[m.chat_id]) mappedMsgs[m.chat_id] = [];
            mappedMsgs[m.chat_id].push({
              id: m.id,
              chatId: m.chat_id,
              senderId: m.sender_id,
              content: m.content,
              timestamp: m.created_at,
              type: m.type,
              negotiatedPrice: m.negotiated_price,
              orderId: m.order_id,
            });
          });
          setMessages(mappedMsgs);
        }

        // Fetch Orders
        const { data: dbOrders } = await supabase.from("orders").select("*");
        if (dbOrders) {
          setOrders(
            dbOrders.map((o: any) => ({
              id: o.id,
              chatId: o.chat_id,
              itemId: o.item_id,
              customerId: o.customer_id,
              ownerId: o.owner_id,
              startDate: o.start_date,
              endDate: o.end_date,
              durationDays: o.duration_days,
              pricePerDay: Number(o.price_per_day),
              totalPrice: Number(o.total_price),
              commission: Number(o.commission),
              ownerEarnings: Number(o.owner_earnings),
              status: o.status,
              paymentProofUrl: o.payment_proof_url,
              paymentConfirmedAt: o.payment_confirmed_at,
              deliveryMethod: o.delivery_method || "Ambil di Lokasi",
              deliveryAddress: o.delivery_address || "",
              payoutStatus: o.payout_status || "Pending",
              payoutConfirmedAt: o.payout_confirmed_at,
            }))
          );
        }
      };

      fetchSupabaseData();

      // Listen to Supabase Auth State
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            if (profile) {
              setCurrentUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                phone: profile.phone || "",
                balance: profile.balance,
              });
            }
          } else {
            setCurrentUser(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // LocalStorage Load Fallbacks
      const savedUsers = localStorage.getItem("pinjamin_users");
      const savedStores = localStorage.getItem("pinjamin_stores");
      const savedItems = localStorage.getItem("pinjamin_items");
      const savedChats = localStorage.getItem("pinjamin_chats");
      const savedMessages = localStorage.getItem("pinjamin_messages");
      const savedOrders = localStorage.getItem("pinjamin_orders");
      const savedUser = localStorage.getItem("pinjamin_current_user");

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedStores) setStores(JSON.parse(savedStores));
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedChats) setChats(JSON.parse(savedChats));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        const defaultUser = initialUsers.find((u) => u.id === "user-3") || null;
        setCurrentUser(defaultUser);
        localStorage.setItem("pinjamin_current_user", JSON.stringify(defaultUser));
      }
    }
  }, [isSupabaseConfigured]);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (!isSupabaseConfigured) {
      if (user) {
        saveToStorage("pinjamin_current_user", user);
      } else {
        localStorage.removeItem("pinjamin_current_user");
      }
    }
  };

  const login = async (email: string, role: Role): Promise<boolean> => {
    if (isSupabaseConfigured) {
      // Supabase Authenticate
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: "password123", // default password
      });

      if (error) {
        console.error(error);
        return false;
      }

      // Enforce strict 1 email 1 role check by querying the profiles table
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!profile || profile.role !== role) {
          // Immediately log out if the roles do not match
          await supabase.auth.signOut();
          return false;
        }
      }

      return true;
    } else {
      // Mock Local Login (strictly matching email and role)
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      if (user) {
        handleSetCurrentUser(user);
        return true;
      }
      return false;
    }
  };

  const register = async (name: string, email: string, role: Role) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password: "password123",
        options: {
          data: {
            name,
            role,
          },
        },
      });
      if (error) throw error;
    } else {
      // Mock Register
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
        phone: "08" + Math.floor(100000000 + Math.random() * 900000000),
        balance: role === "Owner" ? 0 : undefined,
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveToStorage("pinjamin_users", updatedUsers);
      handleSetCurrentUser(newUser);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    handleSetCurrentUser(null);
  };

  const addStore = async (name: string, description: string, category: string, city: string, address: string): Promise<Store> => {
    if (!currentUser) throw new Error("Must be logged in");

    const newStoreObj: Omit<Store, "id"> = {
      ownerId: currentUser.id,
      name,
      description,
      category,
      city: "Solo", // Force to Solo as requested by user
      isActive: true,
      logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop",
      address,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("stores")
        .insert({
          owner_id: currentUser.id,
          name,
          description,
          category,
          city: "Solo",
          is_active: true,
          logo_url: newStoreObj.logo,
          address,
        })
        .select()
        .single();

      if (error) throw error;

      const created: Store = {
        id: data.id,
        ownerId: data.owner_id,
        name: data.name,
        description: data.description,
        category: data.category,
        city: data.city,
        isActive: data.is_active,
        logo: data.logo_url,
        address: data.address || "",
      };

      setStores((prev) => [...prev, created]);
      return created;
    } else {
      const created: Store = {
        ...newStoreObj,
        id: `store-${Date.now()}`,
      };
      const updated = [...stores, created];
      setStores(updated);
      saveToStorage("pinjamin_stores", updated);
      return created;
    }
  };

  const updateStore = async (storeId: string, updates: Partial<Store>) => {
    if (isSupabaseConfigured) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;

      const { error } = await supabase.from("stores").update(dbUpdates).eq("id", storeId);
      if (error) throw error;

      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, ...updates } : s)));
    } else {
      const updated = stores.map((s) => (s.id === storeId ? { ...s, ...updates } : s));
      setStores(updated);
      saveToStorage("pinjamin_stores", updated);
    }
  };

  const addItem = async (item: Omit<Item, "id" | "rating" | "reviewCount">): Promise<Item> => {
    const defaultRating = 5.0;
    const defaultReviewCount = 0;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("items")
        .insert({
          store_id: item.storeId,
          name: item.name,
          description: item.description,
          specs: item.specs,
          price_per_day: item.pricePerDay,
          stock: item.stock,
          photos: item.photos,
          category: item.category,
          status: item.status,
          rating: defaultRating,
          review_count: defaultReviewCount,
        })
        .select()
        .single();

      if (error) throw error;

      const created: Item = {
        id: data.id,
        storeId: data.store_id,
        name: data.name,
        description: data.description,
        specs: data.specs,
        pricePerDay: Number(data.price_per_day),
        stock: data.stock,
        photos: data.photos,
        category: data.category,
        status: data.status,
        rating: Number(data.rating),
        reviewCount: data.review_count,
      };

      setItems((prev) => [...prev, created]);
      return created;
    } else {
      const created: Item = {
        ...item,
        id: `item-${Date.now()}`,
        rating: defaultRating,
        reviewCount: defaultReviewCount,
      };
      const updated = [...items, created];
      setItems(updated);
      saveToStorage("pinjamin_items", updated);
      return created;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<Item>) => {
    if (isSupabaseConfigured) {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.pricePerDay) dbUpdates.price_per_day = updates.pricePerDay;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;

      const { error } = await supabase.from("items").update(dbUpdates).eq("id", itemId);
      if (error) throw error;

      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
    } else {
      const updated = items.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
      setItems(updated);
      saveToStorage("pinjamin_items", updated);
    }
  };

  const createChat = async (customerId: string, ownerId: string, itemId: string): Promise<Chat> => {
    if (customerId === ownerId) {
      throw new Error("Anda tidak bisa memulai chat atau menyewa barang milik Anda sendiri.");
    }
    const existing = chats.find(
      (c) => c.customerId === customerId && c.ownerId === ownerId && c.itemId === itemId
    );
    if (existing) return existing;

    if (isSupabaseConfigured) {
      // 1. Create chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          customer_id: customerId,
          owner_id: ownerId,
          item_id: itemId,
          last_message: "Percakapan baru dibuat",
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const newChat: Chat = {
        id: chatData.id,
        customerId: chatData.customer_id,
        ownerId: chatData.owner_id,
        itemId: chatData.item_id,
        lastMessage: chatData.last_message,
        lastUpdated: chatData.updated_at,
      };

      setChats((prev) => [newChat, ...prev]);

      return newChat;
    } else {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        customerId,
        ownerId,
        itemId,
        lastMessage: "Percakapan baru dibuat",
        lastUpdated: new Date().toISOString(),
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      saveToStorage("pinjamin_chats", updatedChats);

      return newChat;
    }
  };

  const sendMessage = async (
    chatId: string,
    senderId: string,
    content: string,
    type: "text" | "negotiation" | "order_link" = "text",
    negotiatedPrice?: number,
    orderId?: string
  ) => {
    if (isSupabaseConfigured) {
      // 1. Insert message and get the returned row
      const { data: insertedMsg, error: msgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          type,
          negotiated_price: negotiatedPrice,
          order_id: orderId,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // 2. Update chat
      const lastMsgText = type === "negotiation" 
        ? `Penawaran Harga: Rp ${negotiatedPrice?.toLocaleString("id-ID")}` 
        : type === "order_link" 
        ? "Tautan Order Baru dibuat" 
        : content;

      const { error: chatError } = await supabase
        .from("chats")
        .update({
          last_message: lastMsgText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chatId);
      
      if (chatError) throw chatError;

      // Update chats list locally
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, lastMessage: lastMsgText, lastUpdated: new Date().toISOString() } : c));

      // Update messages locally immediately for the sender
      if (insertedMsg) {
        setMessages((prev) => {
          const list = prev[chatId] || [];
          if (list.some((m) => m.id === insertedMsg.id)) return prev;
          return {
            ...prev,
            [chatId]: [
              ...list,
              {
                id: insertedMsg.id,
                chatId: insertedMsg.chat_id,
                senderId: insertedMsg.sender_id,
                content: insertedMsg.content,
                timestamp: insertedMsg.created_at,
                type: insertedMsg.type,
                negotiatedPrice: insertedMsg.negotiated_price,
                orderId: insertedMsg.order_id,
              }
            ]
          };
        });
      }
    } else {
      // Mock flow
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        chatId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        type,
        negotiatedPrice,
        orderId,
      };

      const chatMsgs = messages[chatId] || [];
      const updatedMessages = {
        ...messages,
        [chatId]: [...chatMsgs, newMsg],
      };
      setMessages(updatedMessages);
      saveToStorage("pinjamin_messages", updatedMessages);

      const updatedChats = chats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: type === "negotiation" ? `Penawaran Harga: Rp ${negotiatedPrice?.toLocaleString("id-ID")}` : type === "order_link" ? "Tautan Order Baru dibuat" : content,
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      });
      setChats(updatedChats);
      saveToStorage("pinjamin_chats", updatedChats);

      // Trigger automatic owner reply simulation in mock mode
      if (senderId === currentUser?.id && currentUser?.role === "Customer" && type === "text") {
        setTimeout(() => {
          const autoReply: Message = {
            id: `msg-${Date.now() + 1}`,
            chatId,
            senderId: chats.find((c) => c.id === chatId)?.ownerId || "owner-1",
            content: "Halo! Ya, tentu bisa. Di area Solo kami melayani COD atau bisa langsung ambil ke toko ya.",
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => {
            const updated = { ...prev, [chatId]: [...(prev[chatId] || []), autoReply] };
            saveToStorage("pinjamin_messages", updated);
            return updated;
          });
        }, 2000);
      }
    }
  };

  const createOrder = async (
    chatId: string,
    itemId: string,
    customerId: string,
    ownerId: string,
    startDate: string,
    endDate: string,
    finalPricePerDay: number,
    deliveryMethod: "Ambil di Lokasi" | "Diantar" = "Ambil di Lokasi",
    deliveryAddress: string = ""
  ): Promise<Order> => {
    if (customerId === ownerId) {
      throw new Error("Anda tidak bisa menyewa barang milik Anda sendiri.");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = finalPricePerDay * durationDays;
    
    const commission = Math.round(totalPrice * 0.1);
    const ownerEarnings = totalPrice - commission;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          chat_id: chatId,
          item_id: itemId,
          customer_id: customerId,
          owner_id: ownerId,
          start_date: startDate,
          end_date: endDate,
          duration_days: durationDays,
          price_per_day: finalPricePerDay,
          total_price: totalPrice,
          commission,
          owner_earnings: ownerEarnings,
          status: "Menunggu Pembayaran",
          delivery_method: deliveryMethod,
          delivery_address: deliveryAddress,
        })
        .select()
        .single();

      if (error) throw error;

      // Update item status in DB
      await supabase.from("items").update({ status: "Disewa" }).eq("id", itemId);

      const created: Order = {
        id: data.id,
        chatId: data.chat_id,
        itemId: data.item_id,
        customerId: data.customer_id,
        ownerId: data.owner_id,
        startDate: data.start_date,
        endDate: data.end_date,
        durationDays: data.duration_days,
        pricePerDay: Number(data.price_per_day),
        totalPrice: Number(data.total_price),
        commission: Number(data.commission),
        ownerEarnings: Number(data.owner_earnings),
        status: data.status,
        deliveryMethod: data.delivery_method || "Ambil di Lokasi",
        deliveryAddress: data.delivery_address || "",
        payoutStatus: data.payout_status || "Pending",
        payoutConfirmedAt: data.payout_confirmed_at,
      };

      setOrders((prev) => [created, ...prev]);
      setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: "Disewa" } : it));
      return created;
    } else {
      const created: Order = {
        id: `order-${Date.now()}`,
        chatId,
        itemId,
        customerId,
        ownerId,
        startDate,
        endDate,
        durationDays,
        pricePerDay: finalPricePerDay,
        totalPrice,
        commission,
        ownerEarnings,
        status: "Menunggu Pembayaran",
        deliveryMethod,
        deliveryAddress,
        payoutStatus: "Pending",
      };

      const updated = [created, ...orders];
      setOrders(updated);
      saveToStorage("pinjamin_orders", updated);

      const updatedItems = items.map((it) => (it.id === itemId ? { ...it, status: "Disewa" as const } : it));
      setItems(updatedItems);
      saveToStorage("pinjamin_items", updatedItems);

      return created;
    }
  };

  const uploadPaymentProof = async (orderId: string, proofUrl: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "Pembayaran Dikirim",
          payment_proof_url: proofUrl,
        })
        .eq("id", orderId);
      
      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Pembayaran Dikirim", paymentProofUrl: proofUrl } : o))
      );
    } else {
      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "Pembayaran Dikirim" as const,
            paymentProofUrl: proofUrl,
          };
        }
        return o;
      });
      setOrders(updated);
      saveToStorage("pinjamin_orders", updated);
    }
  };

  const confirmPayment = async (orderId: string) => {
    const o = orders.find((ord) => ord.id === orderId);
    if (!o) return;

    if (isSupabaseConfigured) {
      // 1. Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "Dikonfirmasi",
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      
      if (orderError) throw orderError;

      // 2. Update owner's balance
      const { data: ownerProfile } = await supabase.from("profiles").select("balance").eq("id", o.ownerId).single();
      const newOwnerBalance = Number(ownerProfile?.balance || 0) + o.ownerEarnings;
      await supabase.from("profiles").update({ balance: newOwnerBalance }).eq("id", o.ownerId);

      // 3. Update admin's balance
      const { data: adminProfile } = await supabase.from("profiles").select("id, balance").eq("role", "Admin").limit(1);
      if (adminProfile && adminProfile.length > 0) {
        const newAdminBalance = Number(adminProfile[0].balance || 0) + o.commission;
        await supabase.from("profiles").update({ balance: newAdminBalance }).eq("id", adminProfile[0].id);
      }

      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: "Dikonfirmasi", paymentConfirmedAt: new Date().toISOString() } : ord))
      );
    } else {
      // Mock confirm
      const updatedOrders = orders.map((ord) => {
        if (ord.id === orderId) {
          const updatedUsers = users.map((u) => {
            if (u.id === ord.ownerId) {
              return { ...u, balance: (u.balance || 0) + ord.ownerEarnings };
            }
            if (u.role === "Admin") {
              return { ...u, balance: (u.balance || 0) + ord.commission };
            }
            return u;
          });
          setUsers(updatedUsers);
          saveToStorage("pinjamin_users", updatedUsers);

          return {
            ...ord,
            status: "Dikonfirmasi" as const,
            paymentConfirmedAt: new Date().toISOString(),
          };
        }
        return ord;
      });
      setOrders(updatedOrders);
      saveToStorage("pinjamin_orders", updatedOrders);
    }
  };

  const completeOrder = async (orderId: string) => {
    const o = orders.find((ord) => ord.id === orderId);
    if (!o) return;

    if (isSupabaseConfigured) {
      const { error: orderError } = await supabase.from("orders").update({ status: "Selesai" }).eq("id", orderId);
      if (orderError) throw orderError;

      await supabase.from("items").update({ status: "Tersedia" }).eq("id", o.itemId);

      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status: "Selesai" } : ord)));
      setItems((prev) => prev.map((it) => it.id === o.itemId ? { ...it, status: "Tersedia" } : it));
    } else {
      const updatedOrders = orders.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = items.map((it) => (it.id === ord.itemId ? { ...it, status: "Tersedia" as const } : it));
          setItems(updatedItems);
          saveToStorage("pinjamin_items", updatedItems);
          return {
            ...ord,
            status: "Selesai" as const,
          };
        }
        return ord;
      });
      setOrders(updatedOrders);
      saveToStorage("pinjamin_orders", updatedOrders);
    }
  };
 
  const confirmPayout = async (orderId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("orders")
        .update({
          payout_status: "Paid",
          payout_confirmed_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      
      if (error) throw error;

      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, payoutStatus: "Paid", payoutConfirmedAt: new Date().toISOString() } : ord))
      );
    } else {
      const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, payoutStatus: "Paid" as const, payoutConfirmedAt: new Date().toISOString() } : ord));
      setOrders(updated);
      saveToStorage("pinjamin_orders", updated);
    }
  };

  const uploadImage = async (file: File, bucket: string = "pinjamin"): Promise<string> => {
    if (isSupabaseConfigured) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } else {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }
  };

  const updateProfile = async (updates: { name?: string; phone?: string; avatar?: string }) => {
    if (!currentUser) throw new Error("Must be logged in");

    const updatedUser = {
      ...currentUser,
      name: updates.name ?? currentUser.name,
      phone: updates.phone ?? currentUser.phone,
      avatar: updates.avatar ?? currentUser.avatar,
    };

    if (isSupabaseConfigured) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.avatar) dbUpdates.avatar_url = updates.avatar;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", currentUser.id);

      if (error) throw error;
    } else {
      const updatedUsers = users.map((u) => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      saveToStorage("pinjamin_users", updatedUsers);
    }

    handleSetCurrentUser(updatedUser);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        stores,
        items,
        chats,
        messages,
        orders,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        login,
        register,
        logout,
        addStore,
        updateStore,
        addItem,
        updateItem,
        createChat,
        sendMessage,
        createOrder,
        uploadPaymentProof,
        confirmPayment,
        completeOrder,
        confirmPayout,
        uploadImage,
        updateProfile,
        isSupabaseConfigured,
        showAlert,
        showConfirm,
      }}
    >
      {children}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md border border-slate-100/50 shadow-2xl p-6 flex flex-col items-center text-center scale-100 transition-transform duration-200 animate-in zoom-in-95">
            {/* Icon Banner */}
            <div className="mb-4">
              {dialog.type === "success" && (
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {dialog.type === "error" && (
                <div className="w-16 h-16 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-600 shadow-inner animate-pulse">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
              {dialog.type === "info" && (
                <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <Info className="w-8 h-8" />
                </div>
              )}
              {dialog.type === "confirm" && (
                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                  <HelpCircle className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Title & Message */}
            <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-500 mt-2 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto w-full px-2">
              {dialog.message}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 w-full">
              {dialog.type === "confirm" ? (
                <>
                  <button
                    onClick={() => {
                      setDialog((prev) => ({ ...prev, isOpen: false }));
                      if (dialog.onCancel) dialog.onCancel();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      setDialog((prev) => ({ ...prev, isOpen: false }));
                      if (dialog.onConfirm) {
                        try {
                          await dialog.onConfirm();
                        } catch (err: any) {
                          showAlert("Gagal", err.message || String(err), "error");
                        }
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Yakin
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setDialog((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white active:scale-95 transition-all shadow-md cursor-pointer ${
                    dialog.type === "success"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/10"
                      : dialog.type === "error"
                      ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/10"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/10"
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
