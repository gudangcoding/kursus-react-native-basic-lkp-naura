import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FlexColumnPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flex: Column</Text>
      <View style={styles.column}>
        <View style={[styles.square, styles.blue, styles.mb2]} />
        <View style={[styles.square, styles.amber, styles.mb2]} />
        <View style={[styles.square, styles.emerald]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  column: { flexDirection: "column" },
  square: { width: 60, height: 60, borderRadius: 12 },
  blue: { backgroundColor: "#3b82f6" },
  amber: { backgroundColor: "#f59e0b" },
  emerald: { backgroundColor: "#10b981" },
  mb2: { marginBottom: 8 },
});