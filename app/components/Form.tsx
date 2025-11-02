import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
  numberOfLines,
  autoCapitalize,
}: InputFieldProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 10,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? "top" : "auto",
        }}
      />
    </View>
  );
}

export function PasswordField({ label }: { label?: string }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="••••••••"
          secureTextEntry={!show}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <TouchableOpacity onPress={() => setShow((v) => !v)} style={{ marginLeft: 8, padding: 8 }}>
          <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>{show ? "Sembunyikan" : "Tampilkan"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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