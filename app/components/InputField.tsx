import React from "react";
import { View, Text, TextInput } from "react-native";

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