import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ProductCardProps = {
  imageUrl: string;
  title: string;
  price: string;
  rating?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
};

export default function ProductCard({ imageUrl, title, price, rating, onPress, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>
      <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 }}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {typeof rating === 'number' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={{ marginLeft: 4, color: '#6b7280' }}>{rating.toFixed(1)}</Text>
            </View>
          ) : null}
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#10b981' }}>{price}</Text>
        </View>
        <TouchableOpacity onPress={onAddToCart} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e9', paddingVertical: 10, borderRadius: 8, justifyContent: 'center' }}>
          <Ionicons name="cart" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}