import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DropdownSelectProps = {
  label?: string;
  placeholder?: string;
  options: string[];
  selected: string | null;
  onChange: (opt: string) => void;
};

export default function DropdownSelect({ label, placeholder = 'Pilih...', options, selected, onChange }: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text> : null}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' }}
        activeOpacity={0.8}
      >
        <Text style={{ flex: 1, color: selected ? '#111827' : '#6b7280' }}>{selected ?? placeholder}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden' }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => { onChange(opt); setOpen(false); }}
              style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: selected === opt ? '#e0f2fe' : '#fff' }}
            >
              <Text style={{ color: '#111827' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}