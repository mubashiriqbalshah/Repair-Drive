import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/config/theme'

interface Props {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export function Header({ title, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={10} style={styles.back}>
          <Icon name="arrow-left" size={24} color={colors.text.body} />
        </TouchableOpacity>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  back: { width: 32 },
  title: { flex: 1, ...typography.h2, color: colors.text.heading, textAlign: 'center' },
  right: { width: 32, alignItems: 'flex-end' },
})
