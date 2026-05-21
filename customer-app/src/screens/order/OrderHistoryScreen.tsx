import React from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Screen } from '@/components/Screen'
import { Card } from '@/components/Card'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { listOrders } from '@/api/customer'
import { colors, spacing, typography } from '@/config/theme'
import { formatPkr, relativeTime } from '@/utils/format'
import type { RootStackParamList } from '@/navigation/types'

export function OrderHistoryScreen() {
  const { t } = useTranslation()
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const q = useQuery({ queryKey: ['orders'], queryFn: listOrders })

  return (
    <Screen padded>
      <Text style={styles.title}>{t('order.history')}</Text>

      <FlatList
        data={q.data ?? []}
        keyExtractor={(o) => o._id}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={colors.primary} />}
        ListEmptyComponent={
          q.isLoading ? null : <EmptyState icon="clipboard-list-outline" title={t('order.noOrders')} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => nav.navigate('OrderDetail', { orderId: item._id })}
          >
            <Card elevated style={{ marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <Text style={styles.category}>{item.category}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.desc} numberOfLines={2}>
                {item.problemDescription}
              </Text>
              <View style={styles.row}>
                <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
                <Text style={styles.price}>
                  {formatPkr(item.finalPrice ?? item.agreedPrice ?? item.customerBudget)}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text.heading, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  category: { ...typography.h3, color: colors.text.heading, textTransform: 'capitalize' },
  desc: { ...typography.bodySmall, color: colors.text.muted, marginTop: spacing.xs },
  time: { ...typography.caption, color: colors.text.muted },
  price: { ...typography.body, color: colors.primary, fontWeight: '600' },
})
