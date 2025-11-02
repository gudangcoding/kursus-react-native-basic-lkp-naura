import React, { useState } from "react";
import { View, Text } from "react-native";
import { RadioGroup } from "@/app/components";

export default function RadioPage() {
  const [gender, setGender] = useState<string | null>(null);
  const options = ["Pria", "Wanita", "Lainnya"];
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Radio</Text>
      <RadioGroup label="Jenis Kelamin" options={options} selected={gender} onSelect={setGender} />
      <Text style={{ marginTop: 8 }}>Terpilih: {gender ?? "(belum memilih)"}</Text>
    </View>
  );
}