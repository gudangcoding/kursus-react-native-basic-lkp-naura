import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

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