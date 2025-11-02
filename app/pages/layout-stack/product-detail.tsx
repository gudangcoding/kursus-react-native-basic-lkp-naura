import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailPage() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.title}>Product Detail</Text>

          <View style={styles.heroWrap}>
            <Image
              source={require('../../../assets/images/react-logo.png')}
              style={styles.hero}
              resizeMode="cover"
            />
          </View>

          <View style={styles.infoRow}>
            <View style={styles.leftInfo}>
              <Text style={styles.price}>Rp 120.000</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ratingText}>4.7</Text>
              </View>
            </View>
            <View style={styles.rightInfo}>
              <Ionicons name="bookmark" size={18} color="#6b7280" />
            </View>
          </View>

          <Text style={styles.productName}>Headphone Wireless Pro</Text>
          {/* Deskripsi panjang (5 paragraf) untuk uji scroll/overlay */}
          <Text style={styles.desc}>
            Produk ini dirancang untuk menghadirkan pengalaman audio yang mendalam dengan detail suara yang kaya. Desain ergonomis membuatnya nyaman dipakai berjam-jam, sehingga ideal untuk produktivitas maupun hiburan. Material premium menjaga ketahanan serta memberikan kesan elegan saat digunakan.
          </Text>
          <Text style={styles.desc}>
            Ditenagai teknologi nirkabel terbaru, koneksi tetap stabil dan latensi rendah. Dukungan beragam codec memastikan kompatibilitas yang luas dengan perangkat Anda. Kontrol intuitif memudahkan pengaturan volume, pemilihan lagu, dan akses asisten suara tanpa perlu menyentuh ponsel.
          </Text>
          <Text style={styles.desc}>
            Baterai berkapasitas tinggi mampu bertahan sepanjang hari, sementara fitur pengisian cepat membantu saat Anda terburu-buru. Mikrofon peredam noise membuat panggilan lebih jelas, cocok untuk meeting, kelas online, atau bermain gim bersama teman.
          </Text>
          <Text style={styles.desc}>
            Driver presisi menghadirkan bass yang bertenaga, mid yang natural, dan treble yang detail tanpa menusuk telinga. Tuning dilakukan agar sesuai selera pendengar modern yang menginginkan keseimbangan antara energi dan kejernihan.
          </Text>
          <Text style={styles.desc}>
            Dengan dukungan aplikasi pendamping, Anda dapat menyesuaikan profil suara, mengecek status baterai, dan memperbarui firmware. Produk ini adalah pilihan tepat bagi Anda yang mengutamakan kualitas, kenyamanan, dan gaya dalam satu paket.
          </Text>
        </View>
      </ScrollView>

      {/* Overlay tombol fixed bottom */}
      <View style={styles.overlay}>
        <TouchableOpacity style={[styles.actionBtn, styles.wishlistBtn]}>
          <Ionicons name="heart" size={18} color="#ef4444" />
          <Text style={styles.actionText}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.cartBtn]}>
          <Ionicons name="cart" size={18} color="#10b981" />
          <Text style={styles.actionText}>Keranjang</Text>
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
  productName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  heroWrap: { borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  hero: { width: '100%', height: 200 },
  desc: { color: '#4b5563', marginTop: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: '700', marginRight: 12 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, color: '#374151', fontWeight: '600' },
  rightInfo: { flexDirection: 'row', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 10,
  },
  wishlistBtn: { marginRight: 8 },
  cartBtn: { marginLeft: 8 },
  actionText: { marginLeft: 8, fontWeight: '600', color: '#374151' },
});