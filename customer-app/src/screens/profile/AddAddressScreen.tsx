import React, { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { addAddress } from '@/api/customer'
import { extractError } from '@/api/client'
import { colors, spacing, typography } from '@/config/theme'
import type { RootScreenProps } from '@/navigation/types'

export function AddAddressScreen({ navigation }: RootScreenProps<'AddAddress'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [label, setLabel] = useState('Home')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [error, setError] = useState('')

  const m = useMutation({
    mutationFn: () =>
      addAddress({
        label,
        lat: 31.5204,
        lng: 74.3587,
        fullAddress: address,
        landmark,
        isDefault: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      navigation.goBack()
    },
    onError: (err) => setError(extractError(err).message),
  })

  return (
    <Screen padded scroll>
      <Header title={t('profile.addAddress')} onBack={() => navigation.goBack()} />

      <Input label={t('profile.addressLabel')} value={label} onChangeText={setLabel} />
      <Input
        label={t('order.locationLabel')}
        placeholder={t('order.addressPlaceholder')}
        value={address}
        onChangeText={setAddress}
      />
      <Input placeholder={t('order.landmarkPlaceholder')} value={landmark} onChangeText={setLandmark} />

      <Text style={styles.note}>
        Note: location picker (map) coming soon. For now address defaults to Lahore coordinates.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={t('common.save')}
        onPress={() => m.mutate()}
        disabled={!address.trim()}
        loading={m.isPending}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  note: { ...typography.caption, color: colors.warning, fontStyle: 'italic', marginVertical: spacing.sm },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
})
