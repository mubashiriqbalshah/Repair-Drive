import React, { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/components/Screen'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { sendOtp } from '@/api/auth'
import { extractError } from '@/api/client'
import { colors, spacing, typography } from '@/config/theme'
import type { AuthScreenProps } from '@/navigation/types'

export function PhoneScreen({ navigation }: AuthScreenProps<'Phone'>) {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = /^0?3\d{9}$/.test(phone.replace(/\s/g, ''))

  const onSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await sendOtp(phone)
      navigation.navigate('Otp', { phone: res.phone, devCode: res.devCode })
    } catch (err) {
      const e = extractError(err)
      if (e.code === 'TOO_MANY_REQUESTS') {
        Alert.alert('Hold on', 'Too many attempts. Please wait 15 minutes.')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen padded>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Icon name="wrench" size={28} color={colors.text.onPrimary} />
        </View>
        <Text style={styles.welcome}>{t('auth.welcome')}</Text>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>{t('auth.phoneTitle')}</Text>
        <Text style={styles.hint}>{t('auth.phoneHint')}</Text>

        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+92</Text>
          </View>
          <View style={styles.inputWrap}>
            <Input
              placeholder={t('auth.phonePlaceholder')}
              keyboardType="phone-pad"
              maxLength={11}
              value={phone}
              onChangeText={setPhone}
              error={error || (phone && !valid ? t('auth.invalidPhone') : undefined)}
              autoFocus
            />
          </View>
        </View>

        <Button
          title={t('auth.sendCode')}
          onPress={onSubmit}
          disabled={!valid || loading}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xxl },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  welcome: { ...typography.h1, color: colors.text.heading },
  tagline: { ...typography.body, color: colors.text.muted, marginTop: spacing.xs },
  form: { flex: 1 },
  title: { ...typography.h2, color: colors.text.heading, marginBottom: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.text.muted, marginBottom: spacing.lg },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-start' },
  prefix: {
    height: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  prefixText: { ...typography.body, color: colors.text.body, fontWeight: '600' },
  inputWrap: { flex: 1 },
})
