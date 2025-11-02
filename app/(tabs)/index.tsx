import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function KomponenScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Komponen Expo</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {[
          { label: 'TextInput', icon: 'create', href: '/pages/textinput' },
          { label: 'Select', icon: 'list', href: '/pages/select' },
          { label: 'Radio', icon: 'radio-button-on', href: '/pages/radio' },
          { label: 'TextArea', icon: 'document-text', href: '/pages/textarea' },
          { label: 'Email', icon: 'mail', href: '/pages/email' },
          { label: 'Password', icon: 'lock-closed', href: '/pages/password' },
          { label: 'Telepon', icon: 'call', href: '/pages/telepon' },
        ].map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <TouchableOpacity
              style={{
                width: '48%',
                backgroundColor: '#0ea5e9',
                paddingVertical: 20,
                marginBottom: 12,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={item.icon as any} size={24} color="#fff" />
              <Text style={{ color: '#fff', marginTop: 4, fontWeight: '600' }}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}