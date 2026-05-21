import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radii, spacing, typography } from '@/config/theme'
import type { OrderStatus } from '@/api/types'

const STATUS_CONFIG: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  searching: { bg: '#FEF3C7', fg: '#92400E', label: 'Searching' },
  assigned: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Assigned' },
  enroute: { bg: '#DBEAFE', fg: '#1E40AF', label: 'On the way' },
  arrived: { bg: '#CFFAFE', fg: '#155E75', label: 'Arrived' },
  in_progress: { bg: '#FED7AA', fg: '#9A3412', label: 'In progress' },
  completed: { bg: '#D1FAE5', fg: '#065F46', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', fg: '#991B1B', label: 'Cancelled' },
  disputed: { bg: '#FCE7F3', fg: '#9F1239', label: 'Disputed' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  text: { ...typography.caption, fontWeight: '600' },
})

export { colors }
