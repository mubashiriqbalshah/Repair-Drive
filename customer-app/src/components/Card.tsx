import React from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { colors, radii, shadows, spacing } from '@/config/theme'

interface Props extends ViewProps {
  elevated?: boolean
}

export function Card({ children, elevated = false, style, ...rest }: Props) {
  return (
    <View
      style={[styles.card, elevated && shadows.sm, style]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
})
