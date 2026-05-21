import React from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { fetchCategories } from '@/api/categories'
import { colors, radii, spacing, typography } from '@/config/theme'
import type { RootScreenProps } from '@/navigation/types'

export function CategoryDetailScreen({ route, navigation }: RootScreenProps<'CategoryDetail'>) {
  const { t, i18n } = useTranslation()
  const { categorySlug } = route.params
  const isUrdu = i18n.language === 'ur'

  const q = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const category = q.data?.find((c) => c.slug === categorySlug)

  if (q.isLoading || !category) {
    return (
      <Screen padded>
        <Header title="" onBack={() => navigation.goBack()} />
        <Spinner />
      </Screen>
    )
  }

  return (
    <Screen padded scroll>
      <Header
        title={isUrdu ? category.nameUr : category.nameEn}
        onBack={() => navigation.goBack()}
      />

      {category.subcategories.length > 0 ? (
        <>
          <Text style={styles.title}>{t('category.subcategoriesTitle')}</Text>
          <FlatList
            data={category.subcategories}
            scrollEnabled={false}
            keyExtractor={(s) => s.slug}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('NewOrder', { categorySlug, subcategorySlug: item.slug })
                }
              >
                <Text style={styles.rowText}>{isUrdu ? item.nameUr : item.nameEn}</Text>
                <Icon name="chevron-right" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          />
        </>
      ) : null}

      <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: spacing.xl }}>
        <Button
          title={t('category.bookNow')}
          onPress={() => navigation.navigate('NewOrder', { categorySlug })}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { ...typography.h3, color: colors.text.heading, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: { ...typography.body, color: colors.text.body },
})
