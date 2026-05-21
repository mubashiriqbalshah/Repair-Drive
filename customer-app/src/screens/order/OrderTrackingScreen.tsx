import React, { useEffect } from 'react'
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { getOrder } from '@/api/customer'
import { getSocket, joinOrderRoom, leaveOrderRoom } from '@/socket'
import { colors, radii, spacing, typography } from '@/config/theme'
import { formatPkr } from '@/utils/format'
import type { OrderStatus } from '@/api/types'
import type { RootScreenProps, RootStackParamList } from '@/navigation/types'

const STATUS_STEPS: OrderStatus[] = ['assigned', 'enroute', 'arrived', 'in_progress', 'completed']

const STATUS_LABELS: Record<OrderStatus, string> = {
  searching: 'Searching',
  assigned: 'Technician assigned',
  enroute: 'On the way to you',
  arrived: 'Technician arrived',
  in_progress: 'Work in progress',
  completed: 'Order completed',
  cancelled: 'Order cancelled',
  disputed: 'Disputed',
}

export function OrderTrackingScreen({ route }: RootScreenProps<'OrderTracking'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { orderId } = route.params
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const orderQ = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    refetchInterval: 5000,
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    joinOrderRoom(orderId)
    const onStatus = () => qc.invalidateQueries({ queryKey: ['order', orderId] })
    socket.on('order:status_changed', onStatus)
    return () => {
      socket.off('order:status_changed', onStatus)
      leaveOrderRoom(orderId)
    }
  }, [orderId, qc])

  useEffect(() => {
    if (orderQ.data?.status === 'completed' && !orderQ.data.customerRating) {
      nav.replace('Rating', { orderId })
    }
  }, [orderQ.data?.status, orderQ.data?.customerRating, nav, orderId])

  if (orderQ.isLoading || !orderQ.data) {
    return (
      <Screen padded>
        <Header title={t('order.tracking')} />
        <Spinner />
      </Screen>
    )
  }

  const order = orderQ.data
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  const onCall = () => {
    Alert.alert('Call', 'Calling feature requires masked-number setup with Twilio. Coming soon.')
  }

  return (
    <Screen padded scroll>
      <Header title={t('order.tracking')} onBack={() => nav.goBack()} />

      <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
        <StatusBadge status={order.status} />
        <Text style={styles.statusLabel}>{STATUS_LABELS[order.status]}</Text>
      </View>

      <View style={styles.steps}>
        {STATUS_STEPS.map((step, i) => {
          const done = currentStepIndex >= i
          const active = currentStepIndex === i
          return (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                {done ? <Icon name="check" size={14} color={colors.text.onPrimary} /> : null}
              </View>
              <Text style={[styles.stepText, done && styles.stepTextDone]}>
                {STATUS_LABELS[step]}
              </Text>
            </View>
          )
        })}
      </View>

      <Card elevated style={{ marginTop: spacing.md }}>
        <Text style={styles.cardLabel}>Your Mistri</Text>
        <View style={styles.techRow}>
          <Avatar name="Technician" size={48} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.techName}>Technician</Text>
            <Text style={styles.techMeta}>{formatPkr(order.agreedPrice)} agreed</Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onCall}>
            <Icon name="phone" size={20} color={colors.primary} />
            <Text style={styles.actionText}>{t('order.callTechnician')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => nav.navigate('Chat', { orderId })}
          >
            <Icon name="message-text-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>{t('order.chatTechnician')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.cardLabel}>Service Details</Text>
        <Text style={styles.detailItem}>
          <Text style={styles.detailKey}>Category: </Text>
          {order.category}
        </Text>
        <Text style={styles.detailItem}>
          <Text style={styles.detailKey}>Problem: </Text>
          {order.problemDescription}
        </Text>
        <Text style={styles.detailItem}>
          <Text style={styles.detailKey}>Address: </Text>
          {order.location.fullAddress}
        </Text>
        {order.location.landmark ? (
          <Text style={styles.detailItem}>
            <Text style={styles.detailKey}>Landmark: </Text>
            {order.location.landmark}
          </Text>
        ) : null}
      </Card>

      {order.status === 'completed' && order.finalPrice ? (
        <Card elevated style={{ marginTop: spacing.md, backgroundColor: '#D1FAE5', borderColor: '#86EFAC' }}>
          <Text style={[styles.cardLabel, { color: '#065F46' }]}>Final Bill</Text>
          <Text style={styles.finalAmount}>{formatPkr(order.finalPrice)}</Text>
          <Text style={styles.payMethod}>Pay via Cash on completion</Text>
        </Card>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  statusLabel: { ...typography.h3, color: colors.text.heading, marginTop: spacing.xs },
  steps: { marginTop: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotActive: { borderColor: colors.primary },
  stepText: { ...typography.body, color: colors.text.muted },
  stepTextDone: { color: colors.text.body, fontWeight: '500' },
  cardLabel: { ...typography.caption, color: colors.text.muted, textTransform: 'uppercase', marginBottom: spacing.xs },
  techRow: { flexDirection: 'row', alignItems: 'center' },
  techName: { ...typography.h3, color: colors.text.heading },
  techMeta: { ...typography.bodySmall, color: colors.text.muted, marginTop: 2 },
  actionsRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  actionText: { ...typography.button, color: colors.primary },
  detailItem: { ...typography.body, color: colors.text.body, marginTop: spacing.xs },
  detailKey: { color: colors.text.muted, fontWeight: '600' },
  finalAmount: { ...typography.display, color: '#065F46', fontWeight: '700' },
  payMethod: { ...typography.bodySmall, color: '#065F46', marginTop: spacing.xs },
})
