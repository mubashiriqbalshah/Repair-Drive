import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { createOrder, getProfile } from '@/api/customer'
import { extractError } from '@/api/client'
import { colors, radii, spacing, typography } from '@/config/theme'
import { formatPkr } from '@/utils/format'
import type { Address } from '@/api/types'
import type { RootScreenProps } from '@/navigation/types'

export function NewOrderScreen({ route, navigation }: RootScreenProps<'NewOrder'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { categorySlug, subcategorySlug } = route.params

  const profileQ = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  const defaultAddress: Address | undefined = profileQ.data?.addresses.find((a) => a.isDefault) ?? profileQ.data?.addresses[0]

  const [problem, setProblem] = useState('')
  const [budget, setBudget] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (defaultAddress) {
      setAddress(defaultAddress.fullAddress)
      setLandmark(defaultAddress.landmark ?? '')
      setLat(defaultAddress.lat)
      setLng(defaultAddress.lng)
    }
  }, [defaultAddress])

  const useCurrentLocation = () => {
    // Geolocation placeholder — proper implementation needs @react-native-community/geolocation
    // For now, default to Lahore center
    setLat(31.5204)
    setLng(74.3587)
    if (!address) setAddress('Lahore (location detected)')
  }

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      navigation.replace('FindingTechnician', { orderId: order._id })
    },
    onError: (err) => setError(extractError(err).message),
  })

  const valid = problem.trim().length >= 5 && address.trim().length >= 3 && lat != null && lng != null

  const onSubmit = () => {
    if (!valid || lat == null || lng == null) return
    setError('')
    mutation.mutate({
      category: categorySlug,
      subcategory: subcategorySlug ?? '',
      problemDescription: problem.trim(),
      location: { lat, lng, fullAddress: address.trim(), landmark: landmark.trim() },
      customerBudget: budget ? parseInt(budget, 10) : undefined,
      paymentMethod: 'cash',
    })
  }

  return (
    <Screen padded scroll>
      <Header title={t('order.newOrderTitle')} onBack={() => navigation.goBack()} />

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.metaLabel}>Service</Text>
        <Text style={styles.metaValue}>
          {categorySlug}
          {subcategorySlug ? ` › ${subcategorySlug}` : ''}
        </Text>
      </Card>

      <Input
        label={t('order.problemLabel')}
        placeholder={t('order.problemPlaceholder')}
        value={problem}
        onChangeText={setProblem}
        multiline
        numberOfLines={4}
        style={{ minHeight: 96, textAlignVertical: 'top' }}
      />

      <Text style={styles.sectionLabel}>{t('order.locationLabel')}</Text>
      <Button
        title={t('order.useCurrentLocation')}
        variant="secondary"
        onPress={useCurrentLocation}
        style={{ marginBottom: spacing.sm }}
      />
      <Input placeholder={t('order.addressPlaceholder')} value={address} onChangeText={setAddress} />
      <Input placeholder={t('order.landmarkPlaceholder')} value={landmark} onChangeText={setLandmark} />

      {lat != null && lng != null ? (
        <View style={styles.coords}>
          <Icon name="map-marker-check" size={16} color={colors.success} />
          <Text style={styles.coordsText}>
            {' '}{lat.toFixed(4)}, {lng.toFixed(4)}
          </Text>
        </View>
      ) : null}

      <Input
        label={t('order.budgetLabel')}
        placeholder={t('order.budgetPlaceholder')}
        keyboardType="number-pad"
        value={budget}
        onChangeText={setBudget}
        hint={t('order.budgetHint')}
        leftIcon={<Text style={styles.rupee}>Rs.</Text>}
        style={{ marginTop: spacing.sm }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={t('order.findTechnician')}
        onPress={onSubmit}
        disabled={!valid}
        loading={mutation.isPending}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  metaLabel: { ...typography.caption, color: colors.text.muted, textTransform: 'uppercase' },
  metaValue: { ...typography.h3, color: colors.text.heading, marginTop: 2, textTransform: 'capitalize' },
  sectionLabel: { ...typography.caption, color: colors.text.muted, textTransform: 'uppercase', marginBottom: spacing.xs, marginTop: spacing.sm },
  coords: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#D1FAE5',
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  coordsText: { ...typography.caption, color: '#065F46' },
  rupee: { ...typography.body, color: colors.text.muted, fontWeight: '600' },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
})
