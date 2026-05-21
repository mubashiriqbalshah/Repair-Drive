import React from 'react'
import { View, StyleSheet, ScrollView, type ViewStyle } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '@/config/theme'

interface Props {
  children: React.ReactNode
  padded?: boolean
  scroll?: boolean
  style?: ViewStyle
  background?: string
}

export function Screen({ children, padded = true, scroll = false, style, background }: Props) {
  const insets = useSafeAreaInsets()
  const containerStyle = [
    styles.container,
    { backgroundColor: background ?? colors.background },
    padded && { paddingHorizontal: spacing.md },
    style,
  ]

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: background ?? colors.background }]} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            containerStyle,
            { paddingBottom: insets.bottom + spacing.lg, flexGrow: 1 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background ?? colors.background }]} edges={['top']}>
      <View style={containerStyle}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
})
