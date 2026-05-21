import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'
import { colors, radii, spacing, typography } from '@/config/theme'

interface Props extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({ label, error, hint, leftIcon, rightIcon, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          focused && styles.focused,
          Boolean(error) && styles.errorBorder,
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.text.disabled}
          {...rest}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true)
            rest.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            rest.onBlur?.(e)
          }}
        />
        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  focused: { borderColor: colors.primary, borderWidth: 1.5 },
  errorBorder: { borderColor: colors.error },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.body,
    paddingVertical: spacing.sm,
  },
  icon: { marginHorizontal: spacing.xs },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  hintText: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
})
