import React, { useState } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/app/components";

export default function TextAreaPage() {
  const [bio, setBio] = useState("");
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>TextArea</Text>
      <InputField
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tulis sesuatu..."
        multiline
        numberOfLines={5}
      />
      <Text style={{ marginTop: 8 }}>Panjang: {bio.length} karakter</Text>
    </View>
  );
}