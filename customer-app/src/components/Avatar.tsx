import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, radii, typography } from '@/config/theme'

interface Props {
  uri?: string
  name?: string
  size?: number
}

export function Avatar({ uri, name = '?', size = 48 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const style = { width: size, height: size, borderRadius: size / 2 }

  if (uri) {
    return <Image source={{ uri }} style={[style, { backgroundColor: colors.surface }]} />
  }

  return (
    <View style={[style, styles.fallback]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  text: { ...typography.h2, color: colors.text.onPrimary, fontWeight: '700' },
})
