import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { DropdownSelect, Header } from '../../components';

export default function DropdownDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const options = ['Baju', 'Sepatu', 'Tas'];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Dropdown" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DropdownSelect label="Kategori" options={options} selected={selected} onChange={setSelected} />
        <View style={{ marginTop: 12 }}>
          <Text>Terpilih: {selected ?? '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}