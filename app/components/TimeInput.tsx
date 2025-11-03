import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TimeInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onPressClock?: () => void;
};

export default function TimeInput({ label, value, onChangeText, placeholder = 'HH:MM', onPressClock }: TimeInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numbers-and-punctuation"
          style={{ flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}
        />
        <TouchableOpacity onPress={onPressClock} style={{ marginLeft: 8, padding: 8 }}>
          <Ionicons name="time" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      </View>
    </View>
  );
}