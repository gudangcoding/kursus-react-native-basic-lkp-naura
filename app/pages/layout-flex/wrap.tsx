import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FlexWrapPage() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>Flex: Wrap</Text>
      <View style={styles.wrapRow}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.square,
              styles.mr2,
              styles.mb2,
              i % 3 === 0 ? styles.blue : i % 3 === 1 ? styles.amber : styles.emerald,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  square: { width: 60, height: 60, borderRadius: 12 },
  blue: { backgroundColor: "#3b82f6" },
  amber: { backgroundColor: "#f59e0b" },
  emerald: { backgroundColor: "#10b981" },
  mr2: { marginRight: 8 },
  mb2: { marginBottom: 8 },
});