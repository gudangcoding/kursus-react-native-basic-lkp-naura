import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? '#0ea5e9' : '#d1d5db',
        backgroundColor: selected ? '#e0f2fe' : '#fff',
      }}
    >
      <Text style={{ color: selected ? '#0c4a6e' : '#111827', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}