import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/components/Screen'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { updateProfile } from '@/api/customer'
import { extractError } from '@/api/client'
import { colors, spacing, typography } from '@/config/theme'

interface Props {
  onComplete: () => void
}

export function ProfileSetupScreen({ onComplete }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async () => {
    if (name.trim().length < 2) return
    setLoading(true)
    setError('')
    try {
      await updateProfile({ name: name.trim() })
      onComplete()
    } catch (err) {
      setError(extractError(err).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen padded>
      <View style={styles.body}>
        <Text style={styles.title}>{t('auth.profileTitle')}</Text>

        <Input
          placeholder={t('auth.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoFocus
          error={error}
          style={{ marginTop: spacing.lg }}
        />

        <Button
          title={t('auth.finish')}
          onPress={onSubmit}
          disabled={name.trim().length < 2}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.xxxl },
  title: { ...typography.h1, color: colors.text.heading, marginBottom: spacing.xs },
})
