import React, { useState } from "react";
import { View, Text } from "react-native";
import { SelectField } from "@/app/components";

export default function SelectPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const options = ["JavaScript", "TypeScript", "Python", "Go"];
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Select</Text>
      <SelectField label="Pilih bahasa" options={options} selected={selected} onChange={setSelected} />
      <Text style={{ marginTop: 8 }}>Terpilih: {selected ?? "(belum memilih)"}</Text>
    </View>
  );
}