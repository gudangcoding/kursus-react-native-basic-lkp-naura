import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type HeaderProps = {
  title: string;
  onBack?: () => void;
  rightIconName?: React.ComponentProps<typeof Ionicons>['name'];
  onRightPress?: () => void;
};

export default function Header({ title, onBack, rightIconName, onRightPress }: HeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' }}>
      <View style={{ width: 40 }}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' }}>{title}</Text>
      </View>
      <View style={{ width: 40, alignItems: 'flex-end' }}>
        {rightIconName ? (
          <TouchableOpacity onPress={onRightPress} style={{ padding: 6 }}>
            <Ionicons name={rightIconName} size={20} color="#111827" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}