import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { OtpInput, Header } from '../../components';

export default function OtpInputDemo() {
  const [otp, setOtp] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="OTP" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <OtpInput value={otp} onChangeText={setOtp} length={6} />
        <View style={{ marginTop: 12 }}>
          <Text>Kode OTP: {otp || '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}