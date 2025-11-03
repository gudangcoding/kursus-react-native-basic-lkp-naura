import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  color?: string;
  variant?: 'full' | 'fixedBottom' | 'medium' | 'small';
};

export default function Button({ label, onPress, color = '#007AFF', variant = 'medium' }: ButtonProps) {
  const containerStyle = [styles.button, { backgroundColor: color }];
  const textStyle = [styles.text];

  if (variant === 'full') {
    containerStyle.push({ alignSelf: 'stretch' });
  }
  if (variant === 'small') {
    containerStyle.push({ paddingVertical: 8, paddingHorizontal: 16 });
    textStyle.push({ fontSize: 14 });
  }
  if (variant === 'fixedBottom') {
    containerStyle.push({ position: 'absolute', left: 0, right: 0, bottom: 0, margin: 12 });
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Text style={textStyle as any}>{label}</Text>
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
