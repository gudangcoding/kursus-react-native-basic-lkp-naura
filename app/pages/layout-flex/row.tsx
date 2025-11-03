import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FlexRowPage() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>Flex: Row (justify × align)</Text>
      <View style={styles.grid}>
        {COMBOS.map((c) => (
          <View key={c.label} style={styles.cell}>
            <Text style={styles.cellLabel}>{c.label}</Text>
            <View style={[styles.box, styles.row, c.alignStyle, c.justifyStyle]}>
              <View style={[styles.small, styles.blue, styles.mr2]} />
              <View style={[styles.small, styles.amber, styles.mr2]} />
              <View style={[styles.small, styles.emerald]} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cell: { width: "48%", marginBottom: 12 },
  cellLabel: { fontSize: 12, color: "#374151", marginBottom: 8 },
  box: { height: 120, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12 },
  row: { flexDirection: "row" },
  small: { width: 40, height: 40, borderRadius: 10 },
  blue: { backgroundColor: "#3b82f6" },
  amber: { backgroundColor: "#f59e0b" },
  emerald: { backgroundColor: "#10b981" },
  mr2: { marginRight: 8 },
  // align
  alignTop: { alignItems: "flex-start" },
  alignMiddle: { alignItems: "center" },
  alignBottom: { alignItems: "flex-end" },
  // justify
  justifyLeft: { justifyContent: "flex-start" },
  justifyCenter: { justifyContent: "center" },
  justifyRight: { justifyContent: "flex-end" },
});

const COMBOS = [
  { label: "Left · Top", alignStyle: styles.alignTop, justifyStyle: styles.justifyLeft },
  { label: "Left · Middle", alignStyle: styles.alignMiddle, justifyStyle: styles.justifyLeft },
  { label: "Left · Bottom", alignStyle: styles.alignBottom, justifyStyle: styles.justifyLeft },
  { label: "Center · Top", alignStyle: styles.alignTop, justifyStyle: styles.justifyCenter },
  { label: "Center · Middle", alignStyle: styles.alignMiddle, justifyStyle: styles.justifyCenter },
  { label: "Center · Bottom", alignStyle: styles.alignBottom, justifyStyle: styles.justifyCenter },
  { label: "Right · Top", alignStyle: styles.alignTop, justifyStyle: styles.justifyRight },
  { label: "Right · Middle", alignStyle: styles.alignMiddle, justifyStyle: styles.justifyRight },
  { label: "Right · Bottom", alignStyle: styles.alignBottom, justifyStyle: styles.justifyRight },
];