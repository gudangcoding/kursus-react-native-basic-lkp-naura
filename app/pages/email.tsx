import { InputField } from "@/app/components";
import React, { useState } from "react";
import { Text, View } from "react-native";

export default function EmailPage() {
  const [email, setEmail] = useState("");
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Email</Text>
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@domain.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={{ marginTop: 8 }}>Nilai: {email || "(kosong)"}</Text>
    </View>
  );
}