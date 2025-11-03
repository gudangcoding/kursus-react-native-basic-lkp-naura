import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Announcement = { id: string; title: string; date: string; content: string };
type ScheduleItem = { id: string; day: string; time: string; subject: string; room: string };

const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ANN-001', title: 'Ujian Tengah Semester', date: '2025-11-05', content: 'UTS berlangsung 10–14 November. Harap siap dan cek jadwal.' },
  { id: 'ANN-002', title: 'Pembayaran SPP', date: '2025-11-03', content: 'Batas pembayaran SPP bulan ini sampai tanggal 10.' },
  { id: 'ANN-003', title: 'Kegiatan Pramuka', date: '2025-11-07', content: 'Latihan pramuka setiap Jumat, pukul 15:00 di lapangan.' },
];

const SAMPLE_SCHEDULE: ScheduleItem[] = [
  { id: 'SCH-001', day: 'Senin', time: '07:00–08:40', subject: 'Matematika', room: 'Lab 1' },
  { id: 'SCH-002', day: 'Senin', time: '08:50–10:30', subject: 'IPA', room: 'R-203' },
  { id: 'SCH-003', day: 'Selasa', time: '07:00–08:40', subject: 'Bahasa Indonesia', room: 'R-201' },
  { id: 'SCH-004', day: 'Rabu', time: '09:00–10:30', subject: 'Bahasa Inggris', room: 'R-105' },
];

export default function DashboardSekolah() {
  const [query, setQuery] = useState('');
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoWidth, setPromoWidth] = useState(0);
  const promoScrollRef = useRef<ScrollView>(null);

  const promos = useMemo(() => ([
    { id: 'PR-1', title: 'Diskon Buku Pelajaran 30%', sub: 'Promo hingga 15 Nov', bg: '#eff6ff', icon: 'book-outline', color: '#2563eb' },
    { id: 'PR-2', title: 'Beasiswa Prestasi', sub: 'Daftar sebelum 20 Nov', bg: '#ecfdf5', icon: 'school-outline', color: '#10b981' },
    { id: 'PR-3', title: 'Kursus Bahasa Inggris', sub: 'Kelas baru mulai Senin', bg: '#fff7ed', icon: 'chatbubbles-outline', color: '#f59e0b' },
  ]), []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!promoScrollRef.current || promoWidth <= 0) return;
      const next = (promoIndex + 1) % promos.length;
      promoScrollRef.current.scrollTo({ x: next * promoWidth, animated: true });
      setPromoIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoIndex, promoWidth, promos.length]);

  const announcements = useMemo(() => {
    if (!query.trim()) return SAMPLE_ANNOUNCEMENTS;
    const q = query.toLowerCase();
    return SAMPLE_ANNOUNCEMENTS.filter(a => [a.title, a.content].some(t => t.toLowerCase().includes(q)));
  }, [query]);

  const todayStats = useMemo(() => {
    return {
      assignmentsDue: 2,
      unreadAnnouncements: 1,
      attendance: 'Hadir',
      payments: 'SPP: Lunas',
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><Ionicons name="person" size={24} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Halo, Agus Nugroho</Text>
              <Text style={styles.subtitle}>Kelas XII IPA · Semester Ganjil</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={18} color="#111827" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Ionicons name="settings-outline" size={18} color="#111827" /></TouchableOpacity>
            </View>
          </View>
          <View style={styles.quickRow}>
            <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#ecfeff' }]}> 
              <Ionicons name="checkmark-done" size={18} color="#06b6d4" />
              <Text style={styles.quickText}>Absensi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#eff6ff' }]}> 
              <Ionicons name="book-outline" size={18} color="#3b82f6" />
              <Text style={styles.quickText}>Nilai</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#f5f3ff' }]}> 
              <Ionicons name="create-outline" size={18} color="#7c3aed" />
              <Text style={styles.quickText}>Tugas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#ecfdf5' }]}> 
              <Ionicons name="cash-outline" size={18} color="#10b981" />
              <Text style={styles.quickText}>SPP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Hari Ini */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: '38%' }]}>
            <View style={styles.statIconWrap}><Ionicons name="calendar-outline" size={20} color="#06b6d4" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Tugas jatuh tempo</Text><Text style={styles.statValue}>{todayStats.assignmentsDue}</Text></View>
          </View>
          <View style={[styles.statCard, { width: '38%' }]}>
            <View style={styles.statIconWrap}><Ionicons name="megaphone-outline" size={20} color="#f59e0b" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Pengumuman belum dibaca</Text><Text style={styles.statValue}>{todayStats.unreadAnnouncements}</Text></View>
          </View>
          <View style={[styles.statCard, { width: '38%' }]}>
            <View style={styles.statIconWrap}><Ionicons name="finger-print-outline" size={20} color="#6366f1" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Absensi hari ini</Text><Text style={styles.statValue}>{todayStats.attendance}</Text></View>
          </View>
          <View style={[styles.statCard, { width: '38%' }]}>
            <View style={styles.statIconWrap}><Ionicons name="wallet-outline" size={20} color="#10b981" /></View>
            <View style={styles.statTexts}><Text style={styles.statLabel}>Pembayaran</Text><Text style={styles.statValue}>{todayStats.payments}</Text></View>
          </View>
        </View>


        {/* Promo Carousel */}
        <Text style={styles.sectionTitle}>Promo</Text>
        <View style={styles.promoWrap} onLayout={(e) => setPromoWidth(e.nativeEvent.layout.width)}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={promoScrollRef}
            onMomentumScrollEnd={(e) => {
              if (promoWidth > 0) {
                const idx = Math.round(e.nativeEvent.contentOffset.x / promoWidth);
                setPromoIndex(idx);
              }
            }}
          >
            {promos.map((p) => (
              <View key={p.id} style={[styles.promoCard, { width: promoWidth, backgroundColor: p.bg }]}> 
                <View style={styles.promoIconWrap}><Ionicons name={p.icon as any} size={22} color={p.color} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{p.title}</Text>
                  <Text style={styles.promoSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.promoDots}>
            {promos.map((_, i) => (
              <View key={i} style={[styles.dot, i === promoIndex ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          {[
            { label: 'E-Learning', icon: 'school', color: '#2563eb' },
            { label: 'Jadwal', icon: 'time', color: '#06b6d4' },
            { label: 'Guru & Kelas', icon: 'people', color: '#f59e0b' },
            { label: 'Perpustakaan', icon: 'library', color: '#7c3aed' },
            { label: 'Keuangan', icon: 'card', color: '#10b981' },
            { label: 'Kegiatan', icon: 'medal', color: '#ef4444' },
          ].map((m) => (
            <TouchableOpacity key={m.label} style={styles.menuCard}>
              <View style={[styles.menuIcon, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text style={styles.menuLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pengumuman */}
        <Text style={styles.sectionTitle}>Pengumuman</Text>
        <View style={styles.annList}>
          {announcements.map((a) => (
            <View key={a.id} style={styles.annCard}>
              <View style={styles.annHeader}>
                <Text style={styles.annTitle}>{a.title}</Text>
                <Text style={styles.annDate}>{a.date}</Text>
              </View>
              <Text style={styles.annText}>{a.content}</Text>
              <View style={styles.annActions}>
                <TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
                  <Ionicons name="share-social-outline" size={16} color="#111827" />
                  <Text style={styles.btnSecondaryText}>Bagikan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
                  <Ionicons name="information-circle-outline" size={16} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Detail</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Jadwal */}
        <Text style={styles.sectionTitle}>Jadwal</Text>
        <View style={styles.scheduleList}>
          {SAMPLE_SCHEDULE.map((s) => (
            <View key={s.id} style={styles.scheduleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleTitle}>{s.subject}</Text>
                <Text style={styles.scheduleMeta}>{s.day} · {s.time} · {s.room}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#6b7280" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 24 },
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#60a5fa', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#6b7280', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickCard: { flex: 1, height: 60, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickText: { fontWeight: '600', color: '#111827' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minWidth: 160, flexGrow: 1 },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  statTexts: { flex: 1 },
  statLabel: { color: '#6b7280', fontSize: 12 },
  statValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  // Promo
  promoWrap: { paddingHorizontal: 16, marginTop: 8 },
  promoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14 },
  promoIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  promoTitle: { fontWeight: '700', color: '#111827' },
  promoSub: { color: '#6b7280', marginTop: 2 },
  promoDots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: '#2563eb' },
  dotInactive: { backgroundColor: '#cbd5e1' },

  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 16 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 8 },
  menuCard: { width: '48%', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { marginTop: 6, fontWeight: '600', color: '#111827' },

  annList: { paddingHorizontal: 16, marginTop: 8 },
  annCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 10 },
  annHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  annTitle: { fontWeight: '700', color: '#111827' },
  annDate: { color: '#6b7280' },
  annText: { color: '#111827', marginTop: 6 },
  annActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },

  scheduleList: { paddingHorizontal: 16, marginTop: 8 },
  scheduleCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  scheduleTitle: { fontWeight: '700', color: '#111827' },
  scheduleMeta: { color: '#6b7280', marginTop: 2 },

  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, paddingHorizontal: 12 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnSecondaryText: { color: '#111827', fontWeight: '700' },
});