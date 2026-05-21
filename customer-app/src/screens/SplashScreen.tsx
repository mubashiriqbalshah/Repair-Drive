import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/config/theme'

export function SplashScreen() {
  return (
    <View style={styles.wrap}>
      <View style={styles.logo}>
        <Icon name="wrench" size={48} color={colors.text.onPrimary} />
      </View>
      <Text style={styles.title}>Repair Drive</Text>
      <Text style={styles.tagline}>Apka mistri, apke ghar</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text.onPrimary,
    fontWeight: '800',
  },
  tagline: {
    ...typography.body,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
})
