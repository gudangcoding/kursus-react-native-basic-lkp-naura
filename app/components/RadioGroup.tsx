import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface RadioGroupProps {
  label?: string;
  options: string[];
  selected: string | null;
  onSelect: (opt: string) => void;
}

export function RadioGroup({ label, options, selected, onSelect }: RadioGroupProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>
      ) : null}
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#0ea5e9",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            {selected === opt ? (
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#0ea5e9" }} />
            ) : null}
          </View>
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}