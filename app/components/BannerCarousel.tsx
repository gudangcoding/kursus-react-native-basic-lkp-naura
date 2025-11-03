import React, { useRef } from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';

export type BannerCarouselProps = {
  images: string[];
  height?: number;
  borderRadius?: number;
};

export default function BannerCarousel({ images, height = 160, borderRadius = 12 }: BannerCarouselProps) {
  const { width } = Dimensions.get('window');
  const scrollRef = useRef<ScrollView>(null);
  return (
    <View style={{ height, borderRadius, overflow: 'hidden' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {images.map((uri) => (
          <Image key={uri} source={{ uri }} style={{ width, height }} resizeMode="cover" />
        ))}
      </ScrollView>
    </View>
  );
}