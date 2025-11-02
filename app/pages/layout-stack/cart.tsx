import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { id: '1', name: 'Headphone Wireless Pro', price: 120000, qty: 1 },
    { id: '2', name: 'Bluetooth Speaker Mini', price: 85000, qty: 2 },
    { id: '3', name: 'USB-C Cable 1m', price: 35000, qty: 1 },
  ]);

  const total = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);

  const inc = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)));
  };
  const dec = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it)));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.title}>Keranjang Belanja</Text>

          {items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.thumbWrap}>
                <Image
                  source={require('../../../assets/images/react-logo.png')}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={styles.itemPrice}>Rp {it.price.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.qtyWrap}>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyMinus]} onPress={() => dec(it.id)}>
                  <Ionicons name="remove" size={18} color="#ef4444" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{it.qty}</Text>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyPlus]} onPress={() => inc(it.id)}>
                  <Ionicons name="add" size={18} color="#10b981" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.overlay}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rp {total.toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Ionicons name="cash" size={18} color="#fff" />
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 12,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  thumb: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemPrice: { marginTop: 4, color: '#374151', fontWeight: '600' },
  qtyWrap: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyMinus: { backgroundColor: '#fef2f2', marginRight: 8 },
  qtyPlus: { backgroundColor: '#ecfdf5', marginLeft: 8 },
  qtyText: { minWidth: 24, textAlign: 'center', fontWeight: '600', color: '#111827' },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    elevation: 3,
  },
  totalBox: { flexDirection: 'column' },
  totalLabel: { color: '#6b7280', fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 2 },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 140,
  },
  checkoutText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});