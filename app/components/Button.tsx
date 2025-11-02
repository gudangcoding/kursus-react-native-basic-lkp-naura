import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  color?: string;
};

export default function Button({ label, onPress, color = '#007AFF' }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
