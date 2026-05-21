import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { OrderHistoryScreen } from '@/screens/order/OrderHistoryScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { colors } from '@/config/theme'

const Tab = createBottomTabNavigator()

export function MainTabs() {
  const { t } = useTranslation()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Home'
              ? 'home-outline'
              : route.name === 'Orders'
                ? 'clipboard-list-outline'
                : 'account-circle-outline'
          return <Icon name={name} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{ tabBarLabel: t('order.history') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('profile.title') }}
      />
    </Tab.Navigator>
  )
}
