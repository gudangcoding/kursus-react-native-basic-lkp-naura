import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type AdItem = {
  id: number;
  title: string;
  location: string;
  price: number;
  category?: string;
};

const ADS_DATA: AdItem[] = [
  { id: 1, title: "Sepeda Bekas Polygon", location: "Jakarta", price: 1500000, category: "Olahraga" },
  { id: 2, title: "iPhone 12 Mulus", location: "Bandung", price: 7500000, category: "Elektronik" },
  { id: 3, title: "Kursi Gaming", location: "Surabaya", price: 1200000, category: "Furniture" },
  { id: 4, title: "Motor Vario 125 2019", location: "Depok", price: 15500000, category: "Kendaraan" },
  { id: 5, title: "Laptop ASUS ROG", location: "Bekasi", price: 13500000, category: "Elektronik" },
  { id: 6, title: "Meja Belajar", location: "Yogyakarta", price: 350000, category: "Furniture" },
  { id: 7, title: "Helm KYT", location: "Semarang", price: 450000, category: "Aksesoris" },
  { id: 8, title: "Kamera Canon M50", location: "Bogor", price: 5200000, category: "Elektronik" },
  { id: 9, title: "PS4 Slim", location: "Malang", price: 3500000, category: "Hobi" },
  { id: 10, title: "Sepatu Futsal", location: "Tangerang", price: 250000, category: "Olahraga" },
];

const CATEGORIES = [
  { key: "Elektronik", label: "Elektronik", icon: "laptop" as const },
  { key: "Kendaraan", label: "Kendaraan", icon: "car" as const },
  { key: "Furniture", label: "Furniture", icon: "bed" as const },
  { key: "Hobi", label: "Hobi", icon: "game-controller" as const },
  { key: "Olahraga", label: "Olahraga", icon: "barbell" as const },
  { key: "Fashion", label: "Fashion", icon: "shirt" as const },
  { key: "Aksesoris", label: "Aksesoris", icon: "cube" as const },
  { key: "Jasa", label: "Jasa", icon: "briefcase" as const },
];

const BANNERS = [
  { title: "Paket Iklan", subtitle: "Naikkan visibilitas iklan Anda", icon: "megaphone" as const, bg: "#dcfce7", fg: "#065f46" },
  { title: "Promo Minggu Ini", subtitle: "Diskon biaya pasang iklan", icon: "pricetags" as const, bg: "#dbeafe", fg: "#1e40af" },
  { title: "Acara Komunitas", subtitle: "Gabung meetup penjual", icon: "calendar" as const, bg: "#fee2e2", fg: "#991b1b" },
  { title: "Tips Jual Cepat", subtitle: "Optimasi judul & foto", icon: "bulb" as const, bg: "#ede9fe", fg: "#5b21b6" },
];

export default function DashboardClasifyAds() {
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = filterLocation.trim().toLowerCase();
    const min = minPrice ? parseInt(minPrice) : undefined;
    const max = maxPrice ? parseInt(maxPrice) : undefined;

    return ADS_DATA.filter((ad) => {
      const matchQuery = q ? ad.title.toLowerCase().includes(q) : true;
      const matchLoc = loc ? ad.location.toLowerCase().includes(loc) : true;
      const matchMin = typeof min === "number" ? ad.price >= min : true;
      const matchMax = typeof max === "number" ? ad.price <= max : true;
      const matchCat = filterCategory ? ad.category === filterCategory : true;
      return matchQuery && matchLoc && matchMin && matchMax && matchCat;
    });
  }, [query, filterLocation, minPrice, maxPrice, filterCategory]);

  const resetFilter = () => {
    setFilterLocation("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Klasifikasi Iklan (OLX Style)</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari barang..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
            <Ionicons name="options" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => {}}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = filterCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryCard, active && styles.categoryCardActive]}
                onPress={() => setFilterCategory(active ? "" : cat.key)}
              >
                <Ionicons name={cat.icon as any} size={18} color={active ? "#065f46" : "#111827"} />
                <Text style={[styles.categoryLabel, active && { color: "#065f46", fontWeight: "700" }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Promo & Event</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => {}}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ paddingRight: 16 }}>
          {BANNERS.map((b) => (
            <TouchableOpacity key={b.title} style={[styles.bannerCard, { backgroundColor: b.bg }]}
              onPress={() => {}}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={b.icon as any} size={18} color={b.fg} />
                <Text style={[styles.bannerTitle, { color: b.fg }]}>{b.title}</Text>
              </View>
              <Text style={[styles.bannerSubtitle, { color: b.fg }]}>{b.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.grid, { paddingHorizontal: 0 }]}>
          {filteredAds.map((ad) => (
            <View key={ad.id} style={styles.card}>
              <View style={styles.imageBox}>
                <Image
                  source={require("../../../assets/images/react-logo.png")}
                  style={styles.adImage}
                  contentFit="cover"
                />
                <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(ad.id)}>
                  <Ionicons
                    name={favorites.has(ad.id) ? "heart" : "heart-outline"}
                    size={18}
                    color={favorites.has(ad.id) ? "#ef4444" : "#374151"}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="pricetag" size={18} color="#10b981" />
                <Text style={styles.cardTitle} numberOfLines={1}>{ad.title}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text style={styles.cardText}>{ad.location}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="cash" size={16} color="#6b7280" />
                <Text style={[styles.cardText, styles.priceText]}>Rp {ad.price.toLocaleString("id-ID")}</Text>
              </View>
              {ad.category && (
                <View style={[styles.badge, { alignSelf: "flex-start" }]}>
                  <Ionicons name="archive" size={14} color="#fff" />
                  <Text style={styles.badgeText}>{ad.category}</Text>
                </View>
              )}
            </View>
          ))}
          {filteredAds.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="alert-circle" size={20} color="#6b7280" />
              <Text style={{ color: "#6b7280", marginLeft: 6 }}>Tidak ada hasil sesuai filter.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="options" size={20} color="#0f766e" />
              <Text style={{ fontSize: 16, fontWeight: "700", marginLeft: 8 }}>Filter</Text>
            </View>

            <Text style={styles.label}>Lokasi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Jakarta, Bandung"
              value={filterLocation}
              onChangeText={setFilterLocation}
              placeholderTextColor="#9ca3af"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Range Harga (Rp)</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                placeholder="Min"
                value={minPrice}
                onChangeText={setMinPrice}
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                placeholder="Max"
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#e5e7eb" }]} onPress={resetFilter}>
                <Text style={{ color: "#111827", fontWeight: "600" }}>Reset</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={[styles.actionBtn, { marginRight: 8, backgroundColor: "#f3f4f6" }]} onPress={() => setFilterVisible(false)}>
                  <Text style={{ color: "#374151", fontWeight: "600" }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#10b981" }]} onPress={() => setFilterVisible(false)}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Terapkan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#111827" },
  filterBtn: {
    marginLeft: 8,
    height: 28,
    width: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1fae5",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  viewAllBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  viewAllText: { color: "#0ea5e9", fontWeight: "700" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
  categoryCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryCardActive: { borderColor: "#10b981", backgroundColor: "#ecfdf5" },
  categoryLabel: { marginLeft: 8, color: "#111827", fontWeight: "600" },
  bannerCard: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  bannerTitle: { marginLeft: 8, fontWeight: "800" },
  bannerSubtitle: { marginTop: 6, fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12 },
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  imageBox: { borderRadius: 8, overflow: "hidden", marginBottom: 8, position: "relative" },
  adImage: { width: "100%", height: 110 },
  favBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#ffffffcc",
    borderRadius: 999,
    padding: 6,
  },
  cardTitle: { marginLeft: 6, fontWeight: "700", color: "#111827", flexShrink: 1 },
  cardRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardText: { marginLeft: 6, color: "#374151" },
  priceText: { fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "#6b7280", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  badgeText: { color: "#fff", marginLeft: 4, fontSize: 12 },
  emptyBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 24, width: "100%" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: "#111827" },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
});