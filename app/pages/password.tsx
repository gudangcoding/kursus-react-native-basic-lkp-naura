import React from "react";
import { View, Text } from "react-native";
import { PasswordField } from "@/app/components";

export default function PasswordPage() {
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Password</Text>
      <PasswordField label="Kata Sandi" />
    </View>
  );
}