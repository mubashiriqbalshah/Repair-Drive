import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Screen } from '@/components/Screen'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { getProfile } from '@/api/customer'
import { useAuthStore } from '@/stores/authStore'
import { setLanguage, type AppLang } from '@/i18n'
import { disconnectSocket } from '@/socket'
import { colors, radii, spacing, typography } from '@/config/theme'
import { formatPhone } from '@/utils/format'
import type { RootStackParamList } from '@/navigation/types'

export function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const profileQ = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  const logout = useAuthStore((s) => s.logout)

  const onLogout = () => {
    Alert.alert('Logout?', '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          disconnectSocket()
          await logout()
        },
      },
    ])
  }

  const toggleLang = async () => {
    const next: AppLang = i18n.language === 'ur' ? 'en' : 'ur'
    await setLanguage(next)
  }

  const profile = profileQ.data

  return (
    <Screen padded>
      <Text style={styles.title}>{t('profile.title')}</Text>

      <Card elevated style={styles.profileCard}>
        <Avatar uri={profile?.profilePhoto || undefined} name={profile?.name || '?'} size={64} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text style={styles.name}>{profile?.name || '—'}</Text>
          <Text style={styles.phone}>{profile ? formatPhone(profile.phone) : ''}</Text>
        </View>
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Row
          icon="map-marker-multiple-outline"
          label={t('profile.addresses')}
          onPress={() => nav.navigate('AddAddress')}
        />
        <Row
          icon="translate"
          label={`${t('profile.language')} (${i18n.language === 'ur' ? 'اردو' : 'English'})`}
          onPress={toggleLang}
        />
        <Row icon="help-circle-outline" label={t('profile.help')} onPress={() => {}} />
        <Row icon="logout" label={t('profile.logout')} onPress={onLogout} danger />
      </View>
    </Screen>
  )
}

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
      <Icon name={icon as never} size={22} color={danger ? colors.error : colors.text.body} />
      <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      <Icon name="chevron-right" size={22} color={colors.text.disabled} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text.heading, marginVertical: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.h2, color: colors.text.heading },
  phone: { ...typography.body, color: colors.text.muted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, ...typography.body, color: colors.text.body, marginLeft: spacing.md },
})
