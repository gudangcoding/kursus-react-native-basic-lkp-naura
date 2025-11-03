import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { TimeInput, Header } from '../../components';

export default function TimeInputDemo() {
  const [time, setTime] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Waktu" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TimeInput label="Jam" value={time} onChangeText={setTime} />
        <View style={{ marginTop: 12 }}>
          <Text>Nilai saat ini: {time || '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}