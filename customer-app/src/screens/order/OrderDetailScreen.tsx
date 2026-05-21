import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { getOrder } from '@/api/customer'
import { colors, spacing, typography } from '@/config/theme'
import { formatPkr, relativeTime } from '@/utils/format'
import type { RootScreenProps } from '@/navigation/types'

export function OrderDetailScreen({ route, navigation }: RootScreenProps<'OrderDetail'>) {
  const { t } = useTranslation()
  const { orderId } = route.params
  const q = useQuery({ queryKey: ['order', orderId], queryFn: () => getOrder(orderId) })

  if (q.isLoading || !q.data) {
    return (
      <Screen padded>
        <Header title="" onBack={() => navigation.goBack()} />
        <Spinner />
      </Screen>
    )
  }

  const order = q.data
  const activeStatuses = ['searching', 'assigned', 'enroute', 'arrived', 'in_progress']
  const isActive = activeStatuses.includes(order.status)

  return (
    <Screen padded scroll>
      <Header title="Order Details" onBack={() => navigation.goBack()} />

      <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
        <StatusBadge status={order.status} />
        <Text style={styles.created}>{relativeTime(order.createdAt)}</Text>
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{order.category}{order.subcategory ? ` › ${order.subcategory}` : ''}</Text>
        <Text style={styles.label}>Problem</Text>
        <Text style={styles.value}>{order.problemDescription}</Text>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{order.location.fullAddress}</Text>
        {order.location.landmark ? (
          <>
            <Text style={styles.label}>Landmark</Text>
            <Text style={styles.value}>{order.location.landmark}</Text>
          </>
        ) : null}
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={styles.label}>Pricing</Text>
        {order.customerBudget ? (
          <Text style={styles.row}>
            <Text style={styles.key}>Your budget: </Text>
            {formatPkr(order.customerBudget)}
          </Text>
        ) : null}
        {order.agreedPrice ? (
          <Text style={styles.row}>
            <Text style={styles.key}>Agreed price: </Text>
            {formatPkr(order.agreedPrice)}
          </Text>
        ) : null}
        {order.finalPrice ? (
          <Text style={styles.row}>
            <Text style={styles.key}>Final price: </Text>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatPkr(order.finalPrice)}</Text>
          </Text>
        ) : null}
        <Text style={styles.row}>
          <Text style={styles.key}>Payment: </Text>
          {order.paymentMethod} ({order.paymentStatus})
        </Text>
      </Card>

      {order.customerRating ? (
        <Card>
          <Text style={styles.label}>Your Rating</Text>
          <Text style={styles.value}>
            {'★'.repeat(order.customerRating.stars)}{'☆'.repeat(5 - order.customerRating.stars)}
          </Text>
          {order.customerRating.review ? (
            <Text style={styles.value}>{order.customerRating.review}</Text>
          ) : null}
        </Card>
      ) : null}

      <View style={{ marginTop: spacing.lg }}>
        {isActive ? (
          <Button
            title="Continue Tracking"
            onPress={() => navigation.navigate('OrderTracking', { orderId })}
          />
        ) : order.status === 'completed' && !order.customerRating ? (
          <Button title="Rate Order" onPress={() => navigation.navigate('Rating', { orderId })} />
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  created: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  value: { ...typography.body, color: colors.text.body, textTransform: 'capitalize' },
  row: { ...typography.body, color: colors.text.body, marginTop: spacing.xs },
  key: { color: colors.text.muted, fontWeight: '600' },
})
