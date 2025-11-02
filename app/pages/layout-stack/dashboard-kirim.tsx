import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ShipmentStatus = 'pending' | 'in_transit' | 'delivered';

type Shipment = {
  id: string;
  date: string; // YYYY-MM-DD
  origin: string;
  destination: string;
  category: string;
  weightKg: number;
  volumeM3: number;
  costIdr: number;
  status: ShipmentStatus;
};

const SAMPLE_SHIPMENTS: Shipment[] = [
  { id: 'INV-0001', date: '2025-11-02', origin: 'Jakarta Selatan', destination: 'Depok', category: 'Dokumen', weightKg: 1.2, volumeM3: 0.005, costIdr: 25000, status: 'pending' },
  { id: 'INV-0002', date: '2025-11-02', origin: 'Bekasi', destination: 'Jakarta Pusat', category: 'Elektronik', weightKg: 3.5, volumeM3: 0.02, costIdr: 78000, status: 'in_transit' },
  { id: 'INV-0003', date: '2025-11-01', origin: 'Tangerang', destination: 'Bogor', category: 'Makanan', weightKg: 2.0, volumeM3: 0.01, costIdr: 52000, status: 'delivered' },
  { id: 'INV-0004', date: '2025-11-01', origin: 'Depok', destination: 'Jakarta Timur', category: 'Pakaian', weightKg: 1.8, volumeM3: 0.006, costIdr: 33000, status: 'in_transit' },
  { id: 'INV-0005', date: '2025-10-31', origin: 'Jakarta Barat', destination: 'Tangerang', category: 'Aksesoris', weightKg: 0.9, volumeM3: 0.003, costIdr: 21000, status: 'delivered' },
];

const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function DashboardKirimBarang() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // optional date filter
  const [segment, setSegment] = useState<'list' | 'waypoint'>('list');

  const filtered = useMemo(() => {
    return SAMPLE_SHIPMENTS.filter((s) => {
      const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;
      const matchesQuery = query.trim().length === 0
        ? true
        : [s.id, s.origin, s.destination, s.category].some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesDate = dateFilter.trim().length === 0 ? true : s.date === dateFilter.trim();
      return matchesStatus && matchesQuery && matchesDate;
    });
  }, [query, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = SAMPLE_SHIPMENTS.length;
    const pending = SAMPLE_SHIPMENTS.filter((s) => s.status === 'pending').length;
    const inTransit = SAMPLE_SHIPMENTS.filter((s) => s.status === 'in_transit').length;
    const delivered = SAMPLE_SHIPMENTS.filter((s) => s.status === 'delivered').length;
    const revenue = SAMPLE_SHIPMENTS.reduce((acc, s) => acc + s.costIdr, 0);
    return { total, pending, inTransit, delivered, revenue };
  }, []);

  // ===== Waypoint (TSP) setup =====
  type LatLng = { lat: number; lng: number; label: string };
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Jakarta Selatan': { lat: -6.261, lng: 106.810 },
    'Depok': { lat: -6.402, lng: 106.818 },
    'Bekasi': { lat: -6.234, lng: 106.994 },
    'Jakarta Pusat': { lat: -6.186, lng: 106.834 },
    'Tangerang': { lat: -6.176, lng: 106.629 },
    'Bogor': { lat: -6.597, lng: 106.806 },
    'Jakarta Timur': { lat: -6.225, lng: 106.900 },
    'Jakarta Barat': { lat: -6.176, lng: 106.758 },
  };

  const waypoints: LatLng[] = useMemo(() => {
    const names = Array.from(new Set(SAMPLE_SHIPMENTS.map((s) => s.origin)));
    const pts: LatLng[] = [];
    names.forEach((nm) => {
      const c = cityCoords[nm];
      if (c) pts.push({ lat: c.lat, lng: c.lng, label: nm });
    });
    return pts;
  }, []);

  const haversineKm = (a: LatLng, b: LatLng) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const [tspOrder, setTspOrder] = useState<number[]>([]);
  const [tspDistanceKm, setTspDistanceKm] = useState<number>(0);
  const [isComputing, setIsComputing] = useState(false);

  const computeTspNearestNeighbor = () => {
    if (waypoints.length === 0) return;
    setIsComputing(true);
    let order: number[] = [];
    let remaining = waypoints.map((_, idx) => idx);
    let current = remaining.shift()!; // start at first
    order.push(current);
    while (remaining.length > 0) {
      let bestIdx = -1;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < remaining.length; i++) {
        const cand = remaining[i];
        const d = haversineKm(waypoints[current], waypoints[cand]);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }
      current = remaining.splice(bestIdx, 1)[0];
      order.push(current);
    }
    // compute distance including return to start (optional)
    let total = 0;
    for (let i = 0; i < order.length - 1; i++) {
      total += haversineKm(waypoints[order[i]], waypoints[order[i + 1]]);
    }
    setTspOrder(order);
    setTspDistanceKm(total);
    setIsComputing(false);
  };

  const openWhatsAppShipment = (s: Shipment) => {
    const msg = `Halo, ini info kiriman ${s.id}\nAsal: ${s.origin}\nTujuan: ${s.destination}\nStatus: ${s.status}\nBiaya: ${formatRupiah(s.costIdr)}`;
    const encoded = encodeURIComponent(msg);
    const url = Platform.OS === 'web' ? `https://wa.me/?text=${encoded}` : `whatsapp://send?text=${encoded}`;
    Linking.openURL(url).catch(() => {
      // fallback to web url if whatsapp scheme fails
      Linking.openURL(`https://wa.me/?text=${encoded}`);
    });
  };

  // Leaflet map integration (web only)
  const leafletCssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const leafletJsSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const tspMapRef = useRef<any>(null);
  const tspPolylineRef = useRef<any>(null);
  const tspMarkersRef = useRef<any[]>([]);

  const ensureLeafletInjected = (cb?: () => void) => {
    if (Platform.OS !== 'web') return;
    const hasCss = !!document.querySelector(`link[href="${leafletCssHref}"]`);
    const hasJs = !!document.querySelector(`script[src="${leafletJsSrc}"]`);
    if (!hasCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = leafletCssHref;
      document.head.appendChild(link);
    }
    const ready = () => cb && cb();
    if (!hasJs) {
      const s = document.createElement('script');
      s.src = leafletJsSrc; s.async = true; s.onload = ready;
      document.body.appendChild(s);
    } else { ready(); }
  };

  const initMap = () => {
    // @ts-ignore
    const L = (window as any).L;
    if (!L) return;
    const el = document.getElementById('leaflet-map-kirim');
    if (!el) return;
    if ((el as any)._leaflet_id) {
      tspMapRef.current = (el as any)._leaflet_map || tspMapRef.current;
      return;
    }
    const map = L.map('leaflet-map-kirim').setView([-6.2, 106.816666], 11.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
    (el as any)._leaflet_map = map;
    tspMapRef.current = map;
  };

  const drawRouteOnMap = () => {
    // @ts-ignore
    const L = (window as any).L;
    if (!L || !tspMapRef.current || waypoints.length === 0 || tspOrder.length === 0) return;
    // clear old markers/polyline
    tspMarkersRef.current.forEach((m) => { try { m.remove(); } catch {} });
    tspMarkersRef.current = [];
    if (tspPolylineRef.current) { try { tspPolylineRef.current.remove(); } catch {} tspPolylineRef.current = null; }

    const latlngs = tspOrder.map((idx) => [waypoints[idx].lat, waypoints[idx].lng]);
    latlngs.forEach((ll, i) => {
      const m = L.marker(ll).addTo(tspMapRef.current).bindPopup(`${i + 1}. ${waypoints[tspOrder[i]].label}`);
      tspMarkersRef.current.push(m);
    });
    tspPolylineRef.current = L.polyline(latlngs, { color: '#2563eb', weight: 4 }).addTo(tspMapRef.current);
    try { tspMapRef.current.fitBounds(tspPolylineRef.current.getBounds(), { padding: [20, 20] }); } catch {}
  };

  useEffect(() => {
    if (segment !== 'waypoint' || Platform.OS !== 'web') return;
    ensureLeafletInjected(() => {
      initMap();
      computeTspNearestNeighbor();
    });
  }, [segment]);

  useEffect(() => {
    if (segment !== 'waypoint' || Platform.OS !== 'web') return;
    ensureLeafletInjected(drawRouteOnMap);
  }, [tspOrder]);

  return (
    <View style={styles.container}>
      {/* Segmented control */}
      <View style={styles.segmentRow}>
        <TouchableOpacity style={[styles.segmentBtn, segment === 'list' ? styles.segmentActive : styles.segmentInactive]} onPress={() => setSegment('list')}>
          <Text style={segment === 'list' ? styles.segmentTextActive : styles.segmentText}>Daftar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, segment === 'waypoint' ? styles.segmentActive : styles.segmentInactive]} onPress={() => setSegment('waypoint')}>
          <Text style={segment === 'waypoint' ? styles.segmentTextActive : styles.segmentText}>Waypoint</Text>
        </TouchableOpacity>
      </View>

      {segment === 'list' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard Kirim Barang</Text>
          <Text style={styles.subtitle}>Pantau status kiriman, performa, dan ringkasan biaya</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="cube-outline" size={20} color="#3b82f6" /></View>
            <View style={styles.statTexts}>
              <Text style={styles.statLabel}>Total Kiriman</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="time-outline" size={20} color="#f59e0b" /></View>
            <View style={styles.statTexts}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{stats.pending}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="navigate-outline" size={20} color="#06b6d4" /></View>
            <View style={styles.statTexts}>
              <Text style={styles.statLabel}>Diantar</Text>
              <Text style={styles.statValue}>{stats.inTransit}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}><Ionicons name="checkmark-done-outline" size={20} color="#10b981" /></View>
            <View style={styles.statTexts}>
              <Text style={styles.statLabel}>Terkirim</Text>
              <Text style={styles.statValue}>{stats.delivered}</Text>
            </View>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueIconWrap}><Ionicons name="cash-outline" size={20} color="#22c55e" /></View>
          <View style={styles.revenueTexts}>
            <Text style={styles.revenueLabel}>Total Pendapatan (contoh)</Text>
            <Text style={styles.revenueValue}>{formatRupiah(stats.revenue)}</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <View style={styles.filterItem}>
            <Ionicons name="funnel-outline" size={16} color="#6b7280" />
            <Text style={styles.filterLabel}>Filter</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pending', label: 'Pending' },
              { key: 'in_transit', label: 'Diantar' },
              { key: 'delivered', label: 'Terkirim' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, statusFilter === (f.key as any) ? styles.filterChipActive : styles.filterChipInactive]}
                onPress={() => setStatusFilter(f.key as any)}
              >
                <Text style={[styles.filterChipText, statusFilter === (f.key as any) ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.searchRow}>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color="#6b7280" />
              <TextInput value={query} onChangeText={setQuery} placeholder="Cari ID/asal/tujuan/kategori" style={styles.searchInput} />
            </View>
            <View style={styles.dateWrap}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <TextInput value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" style={styles.dateInput} />
            </View>
          </View>
        </View>

        {/* List */}
        <View style={styles.listWrap}>
          <Text style={styles.listTitle}>Daftar Kiriman</Text>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada data sesuai filter.</Text>
          ) : (
            filtered.map((s) => (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{s.id}</Text>
                  <View style={[styles.badge, s.status === 'pending' ? styles.badgePending : s.status === 'in_transit' ? styles.badgeTransit : styles.badgeDelivered]}>
                    <Text style={styles.badgeText}>
                      {s.status === 'pending' ? 'Pending' : s.status === 'in_transit' ? 'Diantar' : 'Terkirim'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDate}>Tanggal: {s.date}</Text>
                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Asal</Text>
                    <Text style={styles.value}>{s.origin}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#6b7280" style={styles.arrow} />
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Tujuan</Text>
                    <Text style={styles.value}>{s.destination}</Text>
                  </View>
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Kategori</Text>
                    <Text style={styles.value}>{s.category}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Berat</Text>
                    <Text style={styles.value}>{s.weightKg} kg</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Volume</Text>
                    <Text style={styles.value}>{s.volumeM3.toFixed(3)} m³</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Biaya</Text>
                    <Text style={styles.value}>{formatRupiah(s.costIdr)}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={[styles.btn, styles.btnWhatsApp]} onPress={() => openWhatsAppShipment(s)}>
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
                    <Ionicons name="information-circle-outline" size={16} color="#111827" />
                    <Text style={styles.btnSecondaryText}>Detail</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
                    <Ionicons name="paper-plane-outline" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Proses</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        </ScrollView>
      )}

      {segment === 'waypoint' && (
        <View style={styles.tspWrap}>
          <View style={styles.tspHeader}>
            <Text style={styles.tspTitle}>Rute Waypoint (TSP)</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={computeTspNearestNeighbor} disabled={isComputing}>
              <Text style={styles.refreshText}>{isComputing ? 'Menghitung…' : 'Hitung Ulang'}</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <View style={styles.mapBox}>
              {/* eslint-disable-next-line jsx-a11y/aria-role */}
              <div id="leaflet-map-kirim" style={{ width: '100%', height: 380, borderRadius: 12, overflow: 'hidden' }} />
            </View>
          ) : (
            <Text style={styles.mapNote}>Peta hanya tersedia di mode web.</Text>
          )}

          <View style={styles.tspInfo}>
            <Text style={styles.tspInfoTitle}>Urutan Kunjungan</Text>
            {tspOrder.length === 0 ? (
              <Text style={styles.tspInfoText}>Belum ada perhitungan.</Text>
            ) : (
              <View>
                {tspOrder.map((idx, i) => (
                  <Text key={idx} style={styles.tspInfoText}>{i + 1}. {waypoints[idx].label}</Text>
                ))}
                <Text style={[styles.tspInfoText, { marginTop: 6 }]}>Perkiraan jarak: {tspDistanceKm.toFixed(1)} km</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  segmentRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  segmentBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#2563eb' },
  segmentInactive: { backgroundColor: '#f3f4f6' },
  segmentText: { color: '#111827', fontWeight: '700' },
  segmentTextActive: { color: '#fff', fontWeight: '700' },
  scrollContent: { paddingBottom: 24 },
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#6b7280', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  statCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, minWidth: 160, flexGrow: 1,
  },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  statTexts: { flex: 1 },
  statLabel: { color: '#6b7280', fontSize: 12 },
  statValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  revenueCard: {
    marginTop: 10, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#f8fafc',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
    height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10,
  },
  searchInput: { flex: 1 },
  dateWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, minWidth: 140,
  },
  dateInput: { flex: 1 },

  listWrap: { paddingHorizontal: 16, marginTop: 12 },
  listTitle: { fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#6b7280' },

  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardId: { fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badgePending: { backgroundColor: '#f59e0b' },
  badgeTransit: { backgroundColor: '#06b6d4' },
  badgeDelivered: { backgroundColor: '#10b981' },
  cardDate: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rowItem: { flex: 1 },
  label: { color: '#6b7280', fontSize: 12 },
  value: { color: '#111827', fontWeight: '600' },
  arrow: { marginHorizontal: 4 },
  gridRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  gridItem: { flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, paddingHorizontal: 12 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  btnWhatsApp: { backgroundColor: '#25D366' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnSecondaryText: { color: '#111827', fontWeight: '700' },

  // Waypoint styles
  tspWrap: { paddingHorizontal: 16, paddingTop: 16 },
  tspHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tspTitle: { fontSize: 18, fontWeight: '700' },
  refreshBtn: { height: 32, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  refreshText: { color: '#111827', fontWeight: '700', fontSize: 12 },
  mapBox: { marginTop: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#fff' },
  mapNote: { color: '#6b7280', marginTop: 8 },
  tspInfo: { marginTop: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#f8fafc' },
  tspInfoTitle: { fontWeight: '700', marginBottom: 6 },
  tspInfoText: { color: '#111827' },
});