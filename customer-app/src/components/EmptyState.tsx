import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/config/theme'

interface Props {
  icon?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function EmptyState({ icon = 'inbox-outline', title, subtitle, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Icon name={icon as never} size={64} color={colors.text.disabled} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
})
