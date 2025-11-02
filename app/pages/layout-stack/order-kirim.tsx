import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

type Step = 1 | 2 | 3;

export default function OrderKirimBarangWizard() {
  const [step, setStep] = useState<Step>(1);
  const [dari, setDari] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [kategori, setKategori] = useState('');
  const [berat, setBerat] = useState(''); // kg
  const [panjang, setPanjang] = useState(''); // m
  const [lebar, setLebar] = useState(''); // m
  const [tinggi, setTinggi] = useState(''); // m

  const parsedBerat = useMemo(() => (parseFloat(berat) || 0), [berat]);
  const parsedPanjang = useMemo(() => (parseFloat(panjang) || 0), [panjang]);
  const parsedLebar = useMemo(() => (parseFloat(lebar) || 0), [lebar]);
  const parsedTinggi = useMemo(() => (parseFloat(tinggi) || 0), [tinggi]);
  const computedVolume = useMemo(() => parsedPanjang * parsedLebar * parsedTinggi, [parsedPanjang, parsedLebar, parsedTinggi]);

  // Estimasi sederhana: biaya = base + (berat * rateKg) + (volume * rateVol)
  const estimasi = useMemo(() => {
    const base = 10000; // Rp
    const rateKg = 5000;
    const rateVol = 20000;
    const total = base + parsedBerat * rateKg + computedVolume * rateVol;
    return {
      base,
      rateKg,
      rateVol,
      total,
    };
  }, [parsedBerat, computedVolume]);

  const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const canNextFromStep1 = dari.trim().length > 0 && tujuan.trim().length > 0 && kategori.trim().length > 0;
  const canNextFromStep2 = parsedBerat > 0 && parsedPanjang > 0 && parsedLebar > 0 && parsedTinggi > 0;

  const gotoNext = () => {
    if (step === 1 && canNextFromStep1) setStep(2);
    else if (step === 2 && canNextFromStep2) setStep(3);
  };

  const gotoPrev = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const confirmOrder = () => {
    alert('Pemesanan dikonfirmasi!');
  };

  return (
    <View style={styles.container}>
      {/* Header Wizard */}
      <View style={styles.header}>
        <Text style={styles.title}>Order Kirim Barang</Text>
        <View style={styles.stepper}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.stepDot, step === i ? styles.stepDotActive : styles.stepDotInactive]}>
              <Text style={styles.stepNumber}>{i}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Konten Wizard */}
      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Step 1: Alamat & Kategori</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Dari</Text>
              <TextInput value={dari} onChangeText={setDari} placeholder="Kota/Kecamatan/Alamat Asal" style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Tujuan</Text>
              <TextInput value={tujuan} onChangeText={setTujuan} placeholder="Kota/Kecamatan/Alamat Tujuan" style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Kategori Barang</Text>
              <TextInput value={kategori} onChangeText={setKategori} placeholder="Contoh: Dokumen, Elektronik, Makanan" style={styles.input} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Step 2: Berat & Volume</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Berat (kg)</Text>
              <TextInput value={berat} onChangeText={setBerat} keyboardType="numeric" placeholder="Contoh: 2.5" style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Volume (m³) = Panjang × Lebar × Tinggi</Text>
              <View style={styles.volumeRow}>
                <View style={styles.volumeItem}>
                  <TextInput value={panjang} onChangeText={setPanjang} keyboardType="numeric" placeholder="Panjang (m)" style={styles.input} />
                </View>
                <View style={styles.volumeItem}>
                  <TextInput value={lebar} onChangeText={setLebar} keyboardType="numeric" placeholder="Lebar (m)" style={styles.input} />
                </View>
                <View style={styles.volumeItem}>
                  <TextInput value={tinggi} onChangeText={setTinggi} keyboardType="numeric" placeholder="Tinggi (m)" style={styles.input} />
                </View>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>Berat: {parsedBerat} kg</Text>
              <Text style={styles.summaryRow}>Volume: {computedVolume ? computedVolume.toFixed(3) : 0} m³</Text>
              <View style={styles.divider} />
              <Text style={styles.summaryRow}>Estimasi Biaya: {formatRupiah(estimasi.total)}</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Step 3: Konfirmasi</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>Dari: {dari}</Text>
              <Text style={styles.summaryRow}>Tujuan: {tujuan}</Text>
              <Text style={styles.summaryRow}>Kategori: {kategori}</Text>
              <Text style={styles.summaryRow}>Berat: {parsedBerat} kg</Text>
              <Text style={styles.summaryRow}>Volume: {computedVolume ? computedVolume.toFixed(3) : 0} m³</Text>
              <View style={styles.divider} />
              <Text style={[styles.summaryRow, styles.summaryTotal]}>Total Estimasi: {formatRupiah(estimasi.total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigasi Wizard */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomActions}>
          {step > 1 ? (
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={gotoPrev}>
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Kembali</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 100 }} />
          )}
          {step < 3 ? (
            <TouchableOpacity
              style={[styles.button, canNextFromStep1 && step === 1 || canNextFromStep2 && step === 2 ? styles.buttonPrimary : styles.buttonDisabled]}
              onPress={gotoNext}
              disabled={(step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2)}
            >
              <Text style={styles.buttonText}>Lanjut</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={confirmOrder}>
              <Text style={styles.buttonText}>Konfirmasi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  stepper: { flexDirection: 'row', gap: 8, marginTop: 8 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stepDotActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  stepDotInactive: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  stepNumber: { color: '#111827', fontWeight: '600' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  volumeRow: { flexDirection: 'row', gap: 8 },
  volumeItem: { flex: 1 },
  summaryCard: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  summaryRow: { fontSize: 13, color: '#111827', marginBottom: 6 },
  summaryTotal: { fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    height: 44,
    minWidth: 120,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: { backgroundColor: '#10b981' },
  buttonSecondary: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonConfirm: { backgroundColor: '#2563eb' },
  buttonText: { color: '#fff', fontWeight: '700' },
  buttonTextSecondary: { color: '#111827' },
});