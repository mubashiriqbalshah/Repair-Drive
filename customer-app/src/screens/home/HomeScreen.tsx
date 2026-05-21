import React from 'react'
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Card } from '@/components/Card'
import { StatusBadge } from '@/components/StatusBadge'
import { fetchCategories } from '@/api/categories'
import { getProfile, listOrders } from '@/api/customer'
import { colors, radii, shadows, spacing, typography } from '@/config/theme'
import { formatPkr } from '@/utils/format'
import type { Category, Order } from '@/api/types'
import type { RootStackParamList } from '@/navigation/types'

const CATEGORY_ICONS: Record<string, string> = {
  ac: 'air-conditioner',
  fridge: 'fridge-outline',
  'washing-machine': 'washing-machine',
  oven: 'microwave',
  motor: 'engine-outline',
  tv: 'television',
  electrician: 'lightning-bolt',
  plumber: 'water-pump',
  carpenter: 'hammer-wrench',
  'mobile-laptop': 'cellphone-link',
}

type Nav = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const { t, i18n } = useTranslation()
  const nav = useNavigation<Nav>()

  const profileQ = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const ordersQ = useQuery({ queryKey: ['orders'], queryFn: listOrders })

  const isUrdu = i18n.language === 'ur'
  const greeting = profileQ.data?.name
    ? t('home.greeting', { name: profileQ.data.name.split(' ')[0] })
    : t('home.greetingGuest')

  const refreshing = profileQ.isFetching || categoriesQ.isFetching || ordersQ.isFetching
  const onRefresh = () => {
    profileQ.refetch()
    categoriesQ.refetch()
    ordersQ.refetch()
  }

  const recentOrders = (ordersQ.data ?? []).slice(0, 3)

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>{t('home.categoriesTitle')}</Text>

        <FlatList
          data={categoriesQ.data ?? []}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={(c) => c.slug}
          contentContainerStyle={{ marginTop: spacing.md }}
          renderItem={({ item }) => (
            <CategoryTile
              category={item}
              isUrdu={isUrdu}
              onPress={() => nav.navigate('CategoryDetail', { categorySlug: item.slug })}
            />
          )}
        />

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentOrders')}</Text>
        </View>

        {recentOrders.length === 0 ? (
          <Text style={styles.empty}>{t('home.noRecent')}</Text>
        ) : (
          recentOrders.map((order) => (
            <RecentOrderCard
              key={order._id}
              order={order}
              onPress={() => nav.navigate('OrderDetail', { orderId: order._id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  )
}

function CategoryTile({
  category,
  isUrdu,
  onPress,
}: {
  category: Category
  isUrdu: boolean
  onPress: () => void
}) {
  const iconName = CATEGORY_ICONS[category.slug] ?? 'wrench-outline'
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tileIconWrap}>
        <Icon name={iconName as never} size={28} color={colors.primary} />
      </View>
      <Text style={styles.tileText} numberOfLines={2}>
        {isUrdu ? category.nameUr : category.nameEn}
      </Text>
    </TouchableOpacity>
  )
}

function RecentOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginTop: spacing.sm }}>
      <Card elevated>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {order.category}
          </Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {order.problemDescription}
        </Text>
        <Text style={styles.cardPrice}>
          {formatPkr(order.finalPrice ?? order.agreedPrice ?? order.customerBudget)}
        </Text>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  greeting: { ...typography.h1, color: colors.text.heading },
  subtitle: { ...typography.body, color: colors.text.muted, marginTop: spacing.xs },
  tile: {
    flex: 1 / 3,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  tileIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  tileText: {
    ...typography.caption,
    color: colors.text.body,
    textAlign: 'center',
    fontWeight: '500',
  },
  recentHeader: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text.heading },
  empty: { ...typography.bodySmall, color: colors.text.muted, marginTop: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.h3, color: colors.text.heading, flex: 1, marginRight: spacing.sm, textTransform: 'capitalize' },
  cardDesc: { ...typography.bodySmall, color: colors.text.muted, marginTop: spacing.xs },
  cardPrice: { ...typography.body, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
})
