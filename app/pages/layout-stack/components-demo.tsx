import React, { useState } from 'react';
import { ScrollView, View, Text, SafeAreaView } from 'react-native';
import {
  Header,
  ProductCard,
  Badge,
  Chip,
  ChipCarousel,
  BannerCarousel,
  SearchBar,
  DropdownSelect,
  DateInput,
  TimeInput,
  OtpInput,
} from '../../components';
import Button from '../../components/Button';

export default function ComponentsDemo() {
  const [search, setSearch] = useState('');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [otp, setOtp] = useState('');
  const [chips, setChips] = useState([
    { label: 'Semua', selected: true },
    { label: 'Promo' },
    { label: 'Terbaru' },
    { label: 'Terlaris' },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Komponen Demo" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Search & Select</Text>
        <SearchBar value={search} onChangeText={setSearch} onFilterPress={() => {}} />
        <View style={{ height: 12 }} />
        <DropdownSelect label="Kategori" options={["Baju", "Sepatu", "Tas"]} selected={selectedOpt} onChange={setSelectedOpt} />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>Input Tanggal & Jam</Text>
        <DateInput label="Tanggal" value={date} onChangeText={setDate} />
        <TimeInput label="Jam" value={time} onChangeText={setTime} />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>OTP Input</Text>
        <OtpInput value={otp} onChangeText={setOtp} length={6} />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>Badge & Chip</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge text="Baru" variant="info" />
          <Badge text="Diskon" variant="success" />
          <Badge text="Stok Habis" variant="danger" />
        </View>
        <View style={{ height: 12 }} />
        <ChipCarousel
          items={chips}
          onItemPress={(idx) => {
            setChips((prev) => prev.map((c, i) => ({ ...c, selected: i === idx })));
          }}
        />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>Banner Carousel</Text>
        <BannerCarousel images={[
          'https://picsum.photos/1200/600?random=1',
          'https://picsum.photos/1200/600?random=2',
          'https://picsum.photos/1200/600?random=3',
        ]} />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>Product Card</Text>
        <ProductCard
          imageUrl="https://picsum.photos/400/300"
          title="Kemeja Pria Premium"
          price="Rp 149.000"
          rating={4.5}
          onAddToCart={() => {}}
        />

        <Text style={{ fontSize: 18, fontWeight: '700', marginVertical: 8 }}>Buttons</Text>
        <View style={{ gap: 12 }}>
          <Button label="Button Small" variant="small" />
          <Button label="Button Medium" variant="medium" />
          <Button label="Button Full" variant="full" />
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <Button label="Fixed Bottom" variant="fixedBottom" />
    </SafeAreaView>
  );
}