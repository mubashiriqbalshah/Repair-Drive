import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { Spinner } from '@/components/Spinner'
import { getOrder, rateOrder } from '@/api/customer'
import { extractError } from '@/api/client'
import { colors, radii, spacing, typography } from '@/config/theme'
import { formatPkr } from '@/utils/format'
import type { RootScreenProps, RootStackParamList } from '@/navigation/types'

export function RatingScreen({ route }: RootScreenProps<'Rating'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { orderId } = route.params
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [error, setError] = useState('')

  const orderQ = useQuery({ queryKey: ['order', orderId], queryFn: () => getOrder(orderId) })

  const rateM = useMutation({
    mutationFn: () => rateOrder(orderId, stars, review),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      nav.popToTop()
    },
    onError: (err) => setError(extractError(err).message),
  })

  if (orderQ.isLoading || !orderQ.data) {
    return (
      <Screen padded>
        <Header title={t('rating.title')} />
        <Spinner />
      </Screen>
    )
  }

  return (
    <Screen padded scroll>
      <Header title={t('rating.title')} onBack={() => nav.popToTop()} />

      <View style={styles.summary}>
        <Avatar name="Mistri" size={80} />
        <Text style={styles.amount}>{formatPkr(orderQ.data.finalPrice)}</Text>
        <Text style={styles.hint}>{t('rating.hint')}</Text>
      </View>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setStars(n)} hitSlop={8}>
            <Icon
              name={stars >= n ? 'star' : 'star-outline'}
              size={48}
              color={stars >= n ? colors.warning : colors.text.disabled}
              style={{ marginHorizontal: spacing.xs }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.reviewInput}
        placeholder={t('rating.reviewPlaceholder')}
        placeholderTextColor={colors.text.disabled}
        value={review}
        onChangeText={setReview}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={t('rating.submit')}
        onPress={() => rateM.mutate()}
        disabled={stars === 0}
        loading={rateM.isPending}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', marginVertical: spacing.xl },
  amount: { ...typography.h1, color: colors.primary, marginTop: spacing.sm, fontWeight: '700' },
  hint: { ...typography.body, color: colors.text.muted, marginTop: spacing.xs },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 96,
    ...typography.body,
    color: colors.text.body,
    backgroundColor: colors.background,
  },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
})
