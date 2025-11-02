import React, { useState } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/app/components";

export default function TextInputPage() {
  const [name, setName] = useState("");
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>TextInput</Text>
      <InputField label="Nama" value={name} onChangeText={setName} placeholder="Masukkan nama" />
      <Text style={{ marginTop: 8 }}>Nilai: {name || "(kosong)"}</Text>
    </View>
  );
}