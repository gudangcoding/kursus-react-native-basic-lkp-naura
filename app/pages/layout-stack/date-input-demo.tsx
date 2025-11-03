import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { DateInput, Header } from '../../components';

export default function DateInputDemo() {
  const [date, setDate] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Tanggal" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DateInput label="Tanggal" value={date} onChangeText={setDate} />
        <View style={{ marginTop: 12 }}>
          <Text>Nilai saat ini: {date || '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}