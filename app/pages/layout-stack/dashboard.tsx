import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Tx = { id: string; title: string; date: string; amount: number };

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const balance = 1250000;

  const txs: Tx[] = useMemo(
    () => [
      { id: 't1', title: 'Pembayaran Merchant', date: '01 Nov 2025', amount: -35000 },
      { id: 't2', title: 'Top Up', date: '31 Okt 2025', amount: 200000 },
      { id: 't3', title: 'Transfer ke Teman', date: '29 Okt 2025', amount: -100000 },
    ],
    []
  );

  const SERVICES = [
    { label: 'Bayar', icon: 'scan' },
    { label: 'Top Up', icon: 'arrow-down-circle' },
    { label: 'Transfer', icon: 'swap-horizontal' },
    { label: 'Pulsa', icon: 'phone-portrait' },
    { label: 'Tagihan', icon: 'receipt' },
    { label: 'PLN', icon: 'flash' },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.title}>Dashboard</Text>

          {/* Kartu saldo ala GoPay */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTopRow}>
              <Text style={styles.balanceLabel}>GoPay</Text>
              <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
                <Ionicons name={showBalance ? 'eye' : 'eye-off'} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceValue}>
              {showBalance ? `Rp ${balance.toLocaleString('id-ID')}` : '•••••••'}
            </Text>

            <View style={styles.quickActions}>
              {[
                { label: 'Pay', icon: 'qr-code' },
                { label: 'Top Up', icon: 'add-circle' },
                { label: 'Request', icon: 'arrow-down-circle' },
                { label: 'Transfer', icon: 'arrow-up-circle' },
              ].map((a) => (
                <TouchableOpacity key={a.label} style={styles.actionBtn}>
                  <View style={styles.actionIconWrap}>
                    <Ionicons name={a.icon as any} size={20} color="#0ea5e9" />
                  </View>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Layanan grid */}
          <Text style={styles.sectionTitle}>Layanan</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((s) => (
              <TouchableOpacity key={s.label} style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Ionicons name={s.icon as any} size={20} color="#3b82f6" />
                </View>
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Promosi sederhana */}
          <Text style={styles.sectionTitle}>Promo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.promoCard}>
                <Ionicons name="pricetag" size={18} color="#fff" />
                <Text style={styles.promoText}>Diskon spesial {i}0%</Text>
              </View>
            ))}
          </ScrollView>

          {/* Riwayat transaksi */}
          <Text style={styles.sectionTitle}>Riwayat</Text>
          <View>
            {txs.map((t) => (
              <View key={t.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View style={styles.txIcon}>
                    <Ionicons name={t.amount >= 0 ? 'arrow-down' : 'arrow-up'} size={16} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{t.title}</Text>
                    <Text style={styles.txDate}>{t.date}</Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, t.amount >= 0 ? styles.txPlus : styles.txMinus]}>
                  {t.amount >= 0 ? '+' : '-'} Rp {Math.abs(t.amount).toLocaleString('id-ID')}
                </Text>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },

  balanceCard: {
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#fff', fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', width: '24%' },
  actionIconWrap: {
    backgroundColor: '#fff',
    borderRadius: 999,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: { color: '#fff', fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: {
    width: '32%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceLabel: { fontWeight: '600', color: '#111827' },

  promoScroll: { marginBottom: 8 },
  promoCard: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txTitle: { fontWeight: '700', color: '#111827' },
  txDate: { color: '#6b7280', marginTop: 2 },
  txAmount: { fontWeight: '700' },
  txPlus: { color: '#16a34a' },
  txMinus: { color: '#ef4444' },
});