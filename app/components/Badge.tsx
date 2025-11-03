import React from 'react';
import { Text } from 'react-native';

export type BadgeProps = {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

const colors = {
  default: { bg: '#e5e7eb', fg: '#111827' },
  success: { bg: '#dcfce7', fg: '#166534' },
  warning: { bg: '#fef9c3', fg: '#854d0e' },
  danger: { bg: '#fee2e2', fg: '#991b1b' },
  info: { bg: '#e0f2fe', fg: '#075985' },
};

export default function Badge({ text, variant = 'default' }: BadgeProps) {
  const c = colors[variant];
  return (
    <Text style={{ backgroundColor: c.bg, color: c.fg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', fontSize: 12, fontWeight: '600' }}>
      {text}
    </Text>
  );
}