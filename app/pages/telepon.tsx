import React, { useState } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/app/components";

export default function TeleponPage() {
  const [phone, setPhone] = useState("");
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Telepon</Text>
      <InputField
        label="No. Telepon"
        value={phone}
        onChangeText={setPhone}
        placeholder="08xxxxxxxxxx"
        keyboardType="phone-pad"
      />
      <Text style={{ marginTop: 8 }}>Nilai: {phone || "(kosong)"}</Text>
    </View>
  );
}