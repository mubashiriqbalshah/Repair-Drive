import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/Button'
import { Header } from '@/components/Header'
import { sendOtp, verifyOtp } from '@/api/auth'
import { extractError } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { colors, radii, spacing, typography } from '@/config/theme'
import { formatPhone } from '@/utils/format'
import type { AuthScreenProps } from '@/navigation/types'

const CODE_LENGTH = 6

export function OtpScreen({ route, navigation }: AuthScreenProps<'Otp'>) {
  const { phone, devCode } = route.params
  const { t } = useTranslation()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(30)
  const inputs = useRef<(TextInput | null)[]>([])
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    if (devCode && digits.every((d) => !d)) {
      setDigits(devCode.split(''))
    }
  }, [devCode])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const handleChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 1)
    const next = [...digits]
    next[idx] = clean
    setDigits(next)
    if (clean && idx < CODE_LENGTH - 1) inputs.current[idx + 1]?.focus()
    if (!clean && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handleVerify = async () => {
    const code = digits.join('')
    if (code.length !== CODE_LENGTH) return
    setLoading(true)
    setError('')
    try {
      const res = await verifyOtp(phone, code)
      await setSession(res.user, res.accessToken, res.refreshToken)
    } catch (err) {
      setError(extractError(err).message || t('auth.wrongOtp'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendIn > 0) return
    setResending(true)
    try {
      await sendOtp(phone)
      setResendIn(30)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } catch (err) {
      setError(extractError(err).message)
    } finally {
      setResending(false)
    }
  }

  const complete = digits.every((d) => d)

  return (
    <Screen padded>
      <Header title="" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.title}>{t('auth.otpTitle')}</Text>
        <Text style={styles.hint}>
          {t('auth.otpHint')} <Text style={styles.phone}>{formatPhone(phone)}</Text>
        </Text>

        <View style={styles.codeRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r
              }}
              value={d}
              onChangeText={(v) => handleChange(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.codeBox, Boolean(d) && styles.codeBoxFilled, Boolean(error) && styles.codeBoxError]}
              autoFocus={i === 0}
              textAlign="center"
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={t('auth.verify')}
          onPress={handleVerify}
          loading={loading}
          disabled={!complete}
          style={{ marginTop: spacing.lg }}
        />

        <TouchableOpacity onPress={handleResend} disabled={resendIn > 0 || resending} style={styles.resendBtn}>
          <Text style={[styles.resendText, resendIn > 0 && styles.resendDisabled]}>
            {resendIn > 0 ? `${t('auth.resend')} (${resendIn}s)` : t('auth.resend')}
          </Text>
        </TouchableOpacity>

        {devCode ? (
          <Text style={styles.devHint}>Dev mode: code auto-filled ({devCode})</Text>
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.lg },
  title: { ...typography.h1, color: colors.text.heading, marginBottom: spacing.xs },
  hint: { ...typography.body, color: colors.text.muted, marginBottom: spacing.xl },
  phone: { color: colors.text.body, fontWeight: '600' },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.body,
    backgroundColor: colors.background,
  },
  codeBoxFilled: { borderColor: colors.primary, borderWidth: 1.5 },
  codeBoxError: { borderColor: colors.error },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
  resendBtn: { alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm },
  resendText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  resendDisabled: { color: colors.text.disabled },
  devHint: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xl,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
