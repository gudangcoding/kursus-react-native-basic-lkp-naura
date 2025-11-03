import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Cari...', onFilterPress }: SearchBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 10, height: 40 }}>
      <Ionicons name="search" size={18} color="#6b7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{ flex: 1, paddingHorizontal: 8 }}
      />
      <TouchableOpacity onPress={onFilterPress} style={{ padding: 6 }}>
        <Ionicons name="funnel" size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
}