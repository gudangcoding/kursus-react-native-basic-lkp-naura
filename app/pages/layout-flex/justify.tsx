import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FlexJustifyPage() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>Flex: Justify Content</Text>
      <View style={[styles.row, styles.center, styles.spaceBetween]}>
        <View style={[styles.square, styles.blue]} />
        <View style={[styles.square, styles.amber]} />
        <View style={[styles.square, styles.emerald]} />
      </View>
      <View style={{ height: 12 }} />
      <View style={[styles.row, styles.center, styles.spaceAround]}>
        <View style={[styles.square, styles.red]} />
        <View style={[styles.square, styles.violet]} />
        <View style={[styles.square, styles.green]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  row: { flexDirection: "row" },
  center: { alignItems: "center" },
  spaceBetween: { justifyContent: "space-between" },
  spaceAround: { justifyContent: "space-around" },
  square: { width: 60, height: 60, borderRadius: 12 },
  blue: { backgroundColor: "#3b82f6" },
  amber: { backgroundColor: "#f59e0b" },
  emerald: { backgroundColor: "#10b981" },
  red: { backgroundColor: "#ef4444" },
  violet: { backgroundColor: "#8b5cf6" },
  green: { backgroundColor: "#22c55e" },
});