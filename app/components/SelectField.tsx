import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface SelectFieldProps {
  label?: string;
  options: string[];
  selected: string | null;
  onChange: (opt: string) => void;
}

export function SelectField({ label, options, selected, onChange }: SelectFieldProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>
      ) : null}
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: selected === opt ? "#0ea5e9" : "#e5e7eb",
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: selected === opt ? "#e0f2fe" : "#fff",
          }}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}