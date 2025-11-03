import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import Chip, { ChipProps } from './Chip';

export type ChipCarouselProps = {
  items: Omit<ChipProps, 'onPress'>[];
  onItemPress?: (index: number) => void;
  contentContainerStyle?: ViewStyle;
};

export default function ChipCarousel({ items, onItemPress, contentContainerStyle }: ChipCarouselProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[{ gap: 8 }, contentContainerStyle]}> 
      {items.map((item, idx) => (
        <Chip key={`${item.label}-${idx}`} label={item.label} selected={item.selected} onPress={() => onItemPress?.(idx)} />
      ))}
    </ScrollView>
  );
}