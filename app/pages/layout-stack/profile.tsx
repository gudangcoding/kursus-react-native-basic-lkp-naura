import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.title}>Profil</Text>

          <TouchableOpacity style={styles.avatarWrap} onPress={() => setModalVisible(true)}>
            <Image
              source={require('../../../assets/images/react-logo.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Nama</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama"
              style={styles.input}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal pilih sumber foto */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ganti Foto</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCamera]} onPress={() => setModalVisible(false)}>
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.modalBtnText}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalGallery]} onPress={() => setModalVisible(false)}>
                <Ionicons name="images" size={18} color="#fff" />
                <Text style={styles.modalBtnText}>Galeri</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tombol update fixed bottom */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.updateBtn}>
          <Ionicons name="save" size={18} color="#fff" />
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },

  avatarWrap: { alignSelf: 'center', position: 'relative', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6' },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  form: { marginTop: 8 },
  label: { fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 3,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 160,
  },
  updateText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 140,
  },
  modalCamera: { backgroundColor: '#10b981' },
  modalGallery: { backgroundColor: '#3b82f6' },
  modalBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  modalClose: { marginTop: 12, alignSelf: 'flex-end' },
  modalCloseText: { color: '#374151', fontWeight: '600' },
});