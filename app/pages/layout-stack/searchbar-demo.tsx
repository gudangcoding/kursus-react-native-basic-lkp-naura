import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { SearchBar, Header } from '../../components';

export default function SearchBarDemo() {
  const [query, setQuery] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Search" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SearchBar value={query} onChangeText={setQuery} onFilterPress={() => {}} placeholder="Cari sesuatu..." />
        <View style={{ marginTop: 12 }}>
          <Text>Query: {query || '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}