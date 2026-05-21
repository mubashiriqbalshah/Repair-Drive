import React, { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { acceptOffer, cancelOrder, getOrder } from '@/api/customer'
import { extractError } from '@/api/client'
import { getSocket, joinOrderRoom, leaveOrderRoom } from '@/socket'
import { colors, radii, shadows, spacing, typography } from '@/config/theme'
import { formatPkr } from '@/utils/format'
import type { RootScreenProps } from '@/navigation/types'

interface IncomingOffer {
  offerId: string
  technicianId: string
  name: string
  rating: number
  ratingCount: number
  profilePhoto: string
  price: number
  note: string
}

export function FindingTechnicianScreen({ route, navigation }: RootScreenProps<'FindingTechnician'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { orderId } = route.params
  const [offers, setOffers] = useState<IncomingOffer[]>([])
  const pulseValue = useState(new Animated.Value(0))[0]

  const orderQ = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    refetchInterval: 5000,
  })

  useEffect(() => {
    // Hydrate offers from initial order fetch
    if (orderQ.data?.offers) {
      const mapped: IncomingOffer[] = orderQ.data.offers
        .filter((o) => o.status === 'pending')
        .map((o) => ({
          offerId: o._id,
          technicianId: o.technicianId,
          name: 'Technician',
          rating: 0,
          ratingCount: 0,
          profilePhoto: '',
          price: o.price,
          note: o.note,
        }))
      setOffers((current) => {
        const ids = new Set(current.map((c) => c.offerId))
        const additions = mapped.filter((m) => !ids.has(m.offerId))
        return [...current, ...additions]
      })
    }

    if (orderQ.data?.status === 'assigned') {
      navigation.replace('OrderTracking', { orderId })
    } else if (orderQ.data?.status === 'cancelled') {
      navigation.goBack()
    }
  }, [orderQ.data, navigation, orderId])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    joinOrderRoom(orderId)

    const onNewOffer = (data: { orderId: string; offer: Omit<IncomingOffer, 'offerId'> & { _id?: string } }) => {
      if (data.orderId !== orderId) return
      setOffers((prev) => [
        ...prev,
        {
          offerId: data.offer._id ?? `${data.offer.technicianId}-${Date.now()}`,
          technicianId: data.offer.technicianId,
          name: data.offer.name ?? 'Technician',
          rating: data.offer.rating ?? 0,
          ratingCount: data.offer.ratingCount ?? 0,
          profilePhoto: data.offer.profilePhoto ?? '',
          price: data.offer.price,
          note: data.offer.note ?? '',
        },
      ])
    }

    socket.on('order:new_offer', onNewOffer)
    return () => {
      socket.off('order:new_offer', onNewOffer)
      leaveOrderRoom(orderId)
    }
  }, [orderId])

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [pulseValue])

  const acceptM = useMutation({
    mutationFn: (offerId: string) => acceptOffer(orderId, offerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      navigation.replace('OrderTracking', { orderId })
    },
    onError: (err) => Alert.alert('Error', extractError(err).message),
  })

  const cancelM = useMutation({
    mutationFn: () => cancelOrder(orderId, 'Customer cancelled while searching'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      navigation.goBack()
    },
  })

  const customerBudget = orderQ.data?.customerBudget

  return (
    <Screen padded>
      <Header title={t('order.findingTitle')} onBack={() => cancelM.mutate()} />

      <View style={styles.radarWrap}>
        <Animated.View
          style={[
            styles.pulse,
            {
              opacity: pulseValue.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              transform: [
                { scale: pulseValue.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) },
              ],
            },
          ]}
        />
        <View style={styles.radarCenter}>
          <Icon name="magnify-scan" size={32} color={colors.text.onPrimary} />
        </View>
      </View>

      <Text style={styles.hint}>{t('order.findingHint')}</Text>

      <View style={{ flex: 1, marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>{t('order.incomingOffers')}</Text>
        {offers.length === 0 ? (
          <Text style={styles.empty}>{t('order.noOffersYet')}</Text>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(o) => o.offerId}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                matchesBudget={customerBudget === item.price}
                onAccept={() => acceptM.mutate(item.offerId)}
                disabled={acceptM.isPending}
              />
            )}
          />
        )}
      </View>

      <Button
        title={t('order.cancelOrder')}
        variant="ghost"
        onPress={() => cancelM.mutate()}
        loading={cancelM.isPending}
      />
    </Screen>
  )
}

function OfferCard({
  offer,
  matchesBudget,
  onAccept,
  disabled,
}: {
  offer: IncomingOffer
  matchesBudget: boolean
  onAccept: () => void
  disabled: boolean
}) {
  return (
    <Card elevated style={{ marginBottom: spacing.sm }}>
      <View style={styles.offerHeader}>
        <Avatar uri={offer.profilePhoto || undefined} name={offer.name} size={44} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.offerName}>{offer.name}</Text>
          <View style={styles.starsRow}>
            <Icon name="star" size={14} color={colors.warning} />
            <Text style={styles.starsText}>
              {' '}
              {offer.rating > 0 ? offer.rating.toFixed(1) : 'New'}
              {offer.ratingCount > 0 ? `  (${offer.ratingCount})` : ''}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.offerPrice}>{formatPkr(offer.price)}</Text>
          {matchesBudget ? <Text style={styles.budgetMatch}>✓ matches budget</Text> : null}
        </View>
      </View>
      {offer.note ? <Text style={styles.offerNote}>{offer.note}</Text> : null}
      <TouchableOpacity onPress={onAccept} disabled={disabled} style={[styles.acceptBtn, disabled && { opacity: 0.5 }]}>
        <Text style={styles.acceptText}>Accept</Text>
      </TouchableOpacity>
    </Card>
  )
}

const styles = StyleSheet.create({
  radarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    height: 120,
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  hint: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginTop: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text.heading, marginBottom: spacing.sm },
  empty: { ...typography.bodySmall, color: colors.text.muted, fontStyle: 'italic' },
  offerHeader: { flexDirection: 'row', alignItems: 'center' },
  offerName: { ...typography.body, color: colors.text.heading, fontWeight: '600' },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  starsText: { ...typography.caption, color: colors.text.muted },
  offerPrice: { ...typography.h3, color: colors.primary, fontWeight: '700' },
  budgetMatch: { ...typography.caption, color: colors.success, fontWeight: '600', marginTop: 2 },
  offerNote: { ...typography.bodySmall, color: colors.text.muted, marginTop: spacing.sm, fontStyle: 'italic' },
  acceptBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  acceptText: { ...typography.button, color: colors.text.onPrimary },
})
