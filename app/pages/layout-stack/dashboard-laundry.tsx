import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type LaundryStatus = 'requested' | 'picked_up' | 'washing' | 'drying' | 'ironing' | 'delivering' | 'delivered';

type LaundryOrder = {
  id: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  phone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemsCount: number;
  weightKg: number;
  serviceType: 'regular' | 'express';
  status: LaundryStatus;
  costIdr: number;
};

const SAMPLE_ORDERS: LaundryOrder[] = [
  { id: 'LD-1001', date: '2025-11-02', customerName: 'Andi', phone: '628123456789', pickupAddress: 'Jl. Mawar No. 12, Jakarta Selatan', deliveryAddress: 'Jl. Melati No. 9, Jakarta Selatan', itemsCount: 12, weightKg: 4.2, serviceType: 'regular', status: 'requested', costIdr: 45000 },
  { id: 'LD-1002', date: '2025-11-02', customerName: 'Budi', phone: '628229998877', pickupAddress: 'Bekasi, Perumahan Green', deliveryAddress: 'Jakarta Timur, Cakung', itemsCount: 20, weightKg: 7.1, serviceType: 'express', status: 'washing', costIdr: 92000 },
  { id: 'LD-1003', date: '2025-11-01', customerName: 'Citra', phone: '628139991122', pickupAddress: 'Tangerang, Karawaci', deliveryAddress: 'Tangerang, Panongan', itemsCount: 8, weightKg: 3.0, serviceType: 'regular', status: 'delivering', costIdr: 38000 },
  { id: 'LD-1004', date: '2025-11-01', customerName: 'Dina', phone: '628177771234', pickupAddress: 'Depok, Sawangan', deliveryAddress: 'Depok, Cinere', itemsCount: 15, weightKg: 5.8, serviceType: 'regular', status: 'picked_up', costIdr: 69000 },
  { id: 'LD-1005', date: '2025-10-31', customerName: 'Edo', phone: '628121234567', pickupAddress: 'Jakarta Barat, Taman Semanan', deliveryAddress: 'Jakarta Barat, Duri Kepa', itemsCount: 10, weightKg: 3.8, serviceType: 'express', status: 'delivered', costIdr: 81000 },
];

const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function DashboardLaundry() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LaundryStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return SAMPLE_ORDERS.filter((o) => {
      const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      const matchesQuery = query.trim().length === 0
        ? true
        : [o.id, o.customerName, o.pickupAddress, o.deliveryAddress].some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesDate = dateFilter.trim().length === 0 ? true : o.date === dateFilter.trim();
      return matchesStatus && matchesQuery && matchesDate;
    });
  }, [query, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = SAMPLE_ORDERS.length;
    const requested = SAMPLE_ORDERS.filter((o) => o.status === 'requested').length;
    const pickedUp = SAMPLE_ORDERS.filter((o) => o.status === 'picked_up').length;
    const processing = SAMPLE_ORDERS.filter((o) => ['washing', 'drying', 'ironing'].includes(o.status)).length;
    const delivering = SAMPLE_ORDERS.filter((o) => o.status === 'delivering').length;
    const delivered = SAMPLE_ORDERS.filter((o) => o.status === 'delivered').length;
    const revenue = SAMPLE_ORDERS.reduce((acc, o) => acc + o.costIdr, 0);
    return { total, requested, pickedUp, processing, delivering, delivered, revenue };
  }, []);

  const openWhatsAppOrder = (o: LaundryOrder) => {
    const msg = `Halo ${o.customerName}, pesanan laundry ${o.id}\nStatus: ${o.status}\nBerat: ${o.weightKg} kg, Item: ${o.itemsCount}\nBiaya: ${formatRupiah(o.costIdr)}`;
    const encoded = encodeURIComponent(msg);
    const phoneSuffix = o.phone ? `${o.phone}?text=` : `?text=`;
    const url = `https://wa.me/${phoneSuffix}${encoded}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard Laundry Antar Jemput</Text>
          <Text style={styles.subtitle}>Pantau status pesanan, proses, dan ringkasan biaya</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="shirt-outline" size={20} color="#3b82f6" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Total Pesanan</Text><Text style={styles.statValue}>{stats.total}</Text></View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="call-outline" size={20} color="#f59e0b" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Diminta Jemput</Text><Text style={styles.statValue}>{stats.requested}</Text></View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="cube-outline" size={20} color="#06b6d4" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Sudah Dijemput</Text><Text style={styles.statValue}>{stats.pickedUp}</Text></View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="refresh-outline" size={20} color="#6366f1" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Dalam Proses</Text><Text style={styles.statValue}>{stats.processing}</Text></View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="navigate-outline" size={20} color="#06b6d4" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Diantar</Text><Text style={styles.statValue}>{stats.delivering}</Text></View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="checkmark-done-outline" size={20} color="#10b981" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Terkirim</Text><Text style={styles.statValue}>{stats.delivered}</Text></View>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueIconWrap}><Ionicons name="cash-outline" size={20} color="#22c55e" /></View>
          <View style={styles.revenueTexts}><Text style={styles.revenueLabel}>Total Pendapatan (contoh)</Text><Text style={styles.revenueValue}>{formatRupiah(stats.revenue)}</Text></View>
        </View>

        <View style={styles.filters}>
          <View style={styles.filterItem}><Ionicons name="funnel-outline" size={16} color="#6b7280" /><Text style={styles.filterLabel}>Filter</Text></View>
          <View style={[styles.filtersRow, { flexDirection: 'row', flexWrap: 'wrap' }] }>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'requested', label: 'Diminta Jemput' },
              { key: 'picked_up', label: 'Sudah Dijemput' },
              { key: 'washing', label: 'Mencuci' },
              { key: 'drying', label: 'Mengeringkan' },
              { key: 'ironing', label: 'Menyetrika' },
              { key: 'delivering', label: 'Diantar' },
              { key: 'delivered', label: 'Terkirim' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, { width: '48%', marginBottom: 8 }, statusFilter === (f.key as any) ? styles.filterChipActive : styles.filterChipInactive]}
                onPress={() => setStatusFilter(f.key as any)}
              >
                <Text style={[styles.filterChipText, statusFilter === (f.key as any) ? styles.filterChipTextActive : styles.filterChipTextInactive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchWrap}><Ionicons name="search-outline" size={16} color="#6b7280" /><TextInput value={query} onChangeText={setQuery} placeholder="Cari ID/nama/alamat" style={styles.searchInput} /></View>
            <View style={styles.dateWrap}><Ionicons name="calendar-outline" size={16} color="#6b7280" /><TextInput value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" style={styles.dateInput} /></View>
          </View>
        </View>

        <View style={styles.listWrap}>
          <Text style={styles.listTitle}>Daftar Pesanan</Text>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada data sesuai filter.</Text>
          ) : (
            filtered.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{o.id}</Text>
                  <View style={[styles.badge,
                    o.status === 'requested' ? styles.badgeRequested :
                    o.status === 'picked_up' ? styles.badgePicked :
                    ['washing','drying','ironing'].includes(o.status) ? styles.badgeProcessing :
                    o.status === 'delivering' ? styles.badgeTransit : styles.badgeDelivered]}
                  >
                    <Text style={styles.badgeText}>
                      {o.status === 'requested' ? 'Diminta Jemput' :
                       o.status === 'picked_up' ? 'Dijemput' :
                       ['washing','drying','ironing'].includes(o.status) ? 'Proses' :
                       o.status === 'delivering' ? 'Diantar' : 'Terkirim'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDate}>Tanggal: {o.date}</Text>
                <View style={styles.row}>
                  <View style={styles.rowItem}><Text style={styles.label}>Pelanggan</Text><Text style={styles.value}>{o.customerName}</Text></View>
                  {o.phone ? <View style={styles.rowItem}><Text style={styles.label}>Telepon</Text><Text style={styles.value}>+{o.phone}</Text></View> : null}
                </View>
                <View style={styles.row}>
                  <View style={styles.rowItem}><Text style={styles.label}>Alamat Jemput</Text><Text style={styles.value}>{o.pickupAddress}</Text></View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rowItem}><Text style={styles.label}>Alamat Antar</Text><Text style={styles.value}>{o.deliveryAddress}</Text></View>
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}><Text style={styles.label}>Item</Text><Text style={styles.value}>{o.itemsCount}</Text></View>
                  <View style={styles.gridItem}><Text style={styles.label}>Berat</Text><Text style={styles.value}>{o.weightKg} kg</Text></View>
                  <View style={styles.gridItem}><Text style={styles.label}>Layanan</Text><Text style={styles.value}>{o.serviceType === 'express' ? 'Express' : 'Regular'}</Text></View>
                  <View style={styles.gridItem}><Text style={styles.label}>Biaya</Text><Text style={styles.value}>{formatRupiah(o.costIdr)}</Text></View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={[styles.btn, styles.btnWhatsApp]} onPress={() => openWhatsAppOrder(o)}>
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
                    <Ionicons name="information-circle-outline" size={16} color="#111827" />
                    <Text style={styles.btnSecondaryText}>Detail</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Proses</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 24 },
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#6b7280', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minWidth: 160, flexGrow: 1 },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  statTexts: { flex: 1 },
  statLabel: { color: '#6b7280', fontSize: 12 },
  statValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  revenueCard: { marginTop: 10, marginHorizontal: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', gap: 12 },
  revenueIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  revenueTexts: { flex: 1 },
  revenueLabel: { color: '#6b7280', fontSize: 12 },
  revenueValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  filters: { marginTop: 12 },
  filterItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterLabel: { color: '#6b7280' },
  filtersRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: { height: 32, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  filterChipActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  filterChipInactive: { borderColor: '#e5e7eb', backgroundColor: '#fff' },
  filterChipText: { fontSize: 12 },
  filterChipTextActive: { color: '#1d4ed8', fontWeight: '700' },
  filterChipTextInactive: { color: '#111827' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10 },
  searchInput: { flex: 1 },
  dateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, minWidth: 140 },
  dateInput: { flex: 1 },

  listWrap: { paddingHorizontal: 16, marginTop: 12 },
  listTitle: { fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#6b7280' },

  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardId: { fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badgeRequested: { backgroundColor: '#f59e0b' },
  badgePicked: { backgroundColor: '#06b6d4' },
  badgeProcessing: { backgroundColor: '#6366f1' },
  badgeTransit: { backgroundColor: '#06b6d4' },
  badgeDelivered: { backgroundColor: '#10b981' },
  cardDate: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rowItem: { flex: 1 },
  label: { color: '#6b7280', fontSize: 12 },
  value: { color: '#111827', fontWeight: '600' },
  gridRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  gridItem: { flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, paddingHorizontal: 12 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  btnWhatsApp: { backgroundColor: '#25D366' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnSecondaryText: { color: '#111827', fontWeight: '700' },
});