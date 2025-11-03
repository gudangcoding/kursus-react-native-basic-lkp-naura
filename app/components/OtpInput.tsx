import React from 'react';
import { View, Text, TextInput } from 'react-native';

export type OtpInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
};

export default function OtpInput({ label, value, onChangeText, length = 6 }: OtpInputProps) {
  const slots = Array.from({ length }, (_, i) => value[i] ?? '');
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text> : null}
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, '').slice(0, length))}
          keyboardType="number-pad"
          maxLength={length}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          autoFocus
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {slots.map((ch, idx) => (
            <View key={idx} style={{ width: 40, height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{ch}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}