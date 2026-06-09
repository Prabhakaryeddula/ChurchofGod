import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../theme/Theme';

export const DistanceBadge = ({ distKm, minutes }: { distKm: number; minutes: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4,
                 backgroundColor: colors.bgTertiary, borderRadius: radius.sm,
                 paddingHorizontal: 8, paddingVertical: 3 }}>
    <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
      {distKm.toFixed(1)} km · {minutes} min
    </Text>
  </View>
);

export default DistanceBadge;
