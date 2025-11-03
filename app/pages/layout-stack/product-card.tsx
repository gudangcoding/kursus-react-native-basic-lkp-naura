import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProductCardPage() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>Product Card</Text>

      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            source={require('../../../assets/images/react-logo.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.likeBtn}>
            <Ionicons name="heart" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.leftInfo}>
            <Text style={styles.price}>Rp 120.000</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>4.7</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cartBtn}>
          <Ionicons name="cart" size={20} color="#10b981" />
          </TouchableOpacity>
        </View>

        <Text style={styles.productName}>Headphone Wireless Pro</Text>
        <Text style={styles.desc}>
          Headphone wireless dengan noise-cancelling, baterai tahan 30 jam, dan
          suara jernih. Cocok untuk bekerja dan hiburan.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  likeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '700', marginRight: 10 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, color: '#374151', fontWeight: '600' },
  cartBtn: {
    borderWidth: 1,
    borderColor: '#d1fae5',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: { paddingHorizontal: 12, paddingBottom: 12, color: '#4b5563' },
});