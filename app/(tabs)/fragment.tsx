import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FragmentScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 48, paddingBottom: 24 }}>
      <Text style={styles.title}>Layout Flex</Text>
      <View style={styles.grid}>
        {[
          { label: 'Dashboard', icon: 'speedometer', href: '/pages/layout-stack/dashboard' },
          { label: 'Tokopedia', icon: 'bag-handle', href: '/pages/layout-stack/dashboard-tokopedia' },
          { label: 'Gojek Order', icon: 'bicycle', href: '/pages/layout-stack/gojek-order' },
          { label: 'Dashboard Kurir', icon: 'navigate', href: '/pages/layout-stack/dashboard-kurir' },
          { label: 'Dashboard Laundry', icon: 'shirt', href: '/pages/layout-stack/dashboard-laundry' },
          { label: 'Dashboard Sekolah', icon: 'school', href: '/pages/layout-stack/dashboard-sekolah' },
          { label: 'Kirim Barang', icon: 'cube', href: '/pages/layout-stack/order-kirim' },
          { label: 'Dashboard Kirim', icon: 'cube', href: '/pages/layout-stack/dashboard-kirim' },
          { label: 'Clasify Ads', icon: 'pricetags', href: '/pages/layout-stack/dashboard-ads' },
          { label: 'Row', icon: 'swap-horizontal', href: '/pages/layout-flex/row' },
          { label: 'Column', icon: 'swap-vertical', href: '/pages/layout-flex/column' },
          { label: 'Justify', icon: 'ellipsis-horizontal', href: '/pages/layout-flex/justify' },
          { label: 'Align', icon: 'resize', href: '/pages/layout-flex/align' },
          { label: 'Wrap', icon: 'grid', href: '/pages/layout-flex/wrap' },
          { label: 'Card', icon: 'albums', href: '/pages/layout-stack/product-card' },
          { label: 'Detail', icon: 'information-circle', href: '/pages/layout-stack/product-detail' },
          { label: 'Cart', icon: 'cart', href: '/pages/layout-stack/cart' },
          { label: 'Profile', icon: 'person', href: '/pages/layout-stack/profile' },
        ].map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <TouchableOpacity style={styles.card}>
              <Ionicons name={item.icon as any} size={24} color="#fff" />
              <Text style={styles.cardLabel}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#10b981",
    paddingVertical: 20,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: { color: "#fff", marginTop: 4, fontWeight: "600" },
});