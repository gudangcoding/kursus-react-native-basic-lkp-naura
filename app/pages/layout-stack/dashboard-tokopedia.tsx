import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Product = { id: string; title: string; price: number; discount?: number };

export default function DashboardTokopediaPage() {
  const [location] = useState('Jakarta Pusat');
  const flashSale: Product[] = useMemo(
    () => [
      { id: 'fs1', title: 'Masker KF94', price: 15000, discount: 20 },
      { id: 'fs2', title: 'Kabel USB-C', price: 25000, discount: 35 },
      { id: 'fs3', title: 'Lampu LED 12W', price: 32000, discount: 15 },
      { id: 'fs4', title: 'Pasta Gigi', price: 12000, discount: 10 },
    ],
    []
  );

  const rekomendasi: Product[] = useMemo(
    () => [
      { id: 'r1', title: 'Headphone Wireless', price: 120000 },
      { id: 'r2', title: 'Mouse Gaming', price: 85000 },
      { id: 'r3', title: 'Botol Minum 1L', price: 45000 },
      { id: 'r4', title: 'Powerbank 10k mAh', price: 159000 },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          {/* Header search + lokasi */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.locationChip}>
              <Ionicons name="location" size={16} color="#10b981" />
              <Text style={styles.locationText}>{location}</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#6b7280" />
              <TextInput placeholder="Cari di Tokopedia" style={styles.searchInput} />
            </View>
          </View>

          {/* Promo carousel sederhana */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.promoCard, i % 2 ? styles.promoGreen : styles.promoBlue]}>
                <Ionicons name="pricetag" size={18} color="#fff" />
                <Text style={styles.promoText}>Voucher {i}0%</Text>
              </View>
            ))}
          </ScrollView>

          {/* Aksi cepat */}
          <View style={styles.quickGrid}>
            {[
              { label: 'Official Store', icon: 'storefront' },
              { label: 'Promo', icon: 'gift' },
              { label: 'Kategori', icon: 'grid' },
              { label: 'Live', icon: 'videocam' },
            ].map((a) => (
              <TouchableOpacity key={a.label} style={styles.quickItem}>
                <View style={styles.quickIconWrap}>
                  <Ionicons name={a.icon as any} size={20} color="#10b981" />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Kategori grid */}
          <Text style={styles.sectionTitle}>Kategori</Text>
          <View style={styles.categoryGrid}>
            {[
              { label: 'Elektronik', icon: 'hardware-chip' },
              { label: 'Rumah Tangga', icon: 'home' },
              { label: 'Kesehatan', icon: 'medkit' },
              { label: 'Fashion', icon: 'shirt' },
              { label: 'Olahraga', icon: 'bicycle' },
              { label: 'Buku', icon: 'book' },
              { label: 'Makanan', icon: 'fast-food' },
              { label: 'Mainan', icon: 'extension-puzzle' },
            ].map((c) => (
              <TouchableOpacity key={c.label} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={c.icon as any} size={20} color="#10b981" />
                </View>
                <Text style={styles.categoryLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Flash Sale */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Flash Sale</Text>
            <Text style={styles.countdownText}>Berakhir dalam 02:15:20</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flashScroll}>
            {flashSale.map((p) => (
              <View key={p.id} style={styles.productCardHorizontal}>
                <View style={styles.productThumb} />
                <Text style={styles.productTitle} numberOfLines={2}>{p.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Rp {p.price.toLocaleString('id-ID')}</Text>
                  {p.discount ? (
                    <Text style={styles.discountText}>-{p.discount}%</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Rekomendasi untukmu */}
          <Text style={styles.sectionTitle}>Rekomendasi untukmu</Text>
          <View style={styles.recoGrid}>
            {rekomendasi.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productThumb} />
                <Text style={styles.productTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={styles.priceText}>Rp {p.price.toLocaleString('id-ID')}</Text>
                <View style={styles.shopRow}>
                  <Ionicons name="storefront" size={14} color="#6b7280" />
                  <Text style={styles.shopText}>Toko Pilihan</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 24 },
  container: { flex: 1, padding: 16, paddingTop: 48 },

  header: { flexDirection: 'row', alignItems: 'center' },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  locationText: { color: '#065f46', fontWeight: '700', marginHorizontal: 6 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { marginLeft: 8, flex: 1 },

  promoScroll: { marginTop: 12, marginBottom: 10 },
  promoCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoGreen: { backgroundColor: '#10b981' },
  promoBlue: { backgroundColor: '#3b82f6' },
  promoText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  quickItem: { alignItems: 'center', width: '24%' },
  quickIconWrap: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontWeight: '600', color: '#111827', textAlign: 'center' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  countdownText: { color: '#ef4444', fontWeight: '700' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '24%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: { fontWeight: '600', color: '#111827', textAlign: 'center' },

  flashScroll: { marginBottom: 10 },
  productCardHorizontal: {
    width: 140,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
  },
  productThumb: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    height: 80,
    marginBottom: 8,
  },
  productTitle: { fontWeight: '600', color: '#111827' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceText: { fontWeight: '700', color: '#111827' },
  discountText: { marginLeft: 8, color: '#ef4444', fontWeight: '700' },

  recoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  shopRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  shopText: { marginLeft: 4, color: '#6b7280', fontWeight: '600' },
});