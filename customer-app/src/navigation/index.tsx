import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/stores/authStore'
import { getProfile } from '@/api/customer'
import { SplashScreen } from '@/screens/SplashScreen'
import { AuthStack } from './AuthStack'
import { MainTabs } from './MainTabs'
import { ProfileSetupScreen } from '@/screens/auth/ProfileSetupScreen'
import { CategoryDetailScreen } from '@/screens/home/CategoryDetailScreen'
import { NewOrderScreen } from '@/screens/order/NewOrderScreen'
import { FindingTechnicianScreen } from '@/screens/order/FindingTechnicianScreen'
import { OrderTrackingScreen } from '@/screens/order/OrderTrackingScreen'
import { OrderDetailScreen } from '@/screens/order/OrderDetailScreen'
import { ChatScreen } from '@/screens/order/ChatScreen'
import { RatingScreen } from '@/screens/order/RatingScreen'
import { AddAddressScreen } from '@/screens/profile/AddAddressScreen'
import { linking } from './linking'
import type { RootStackParamList } from './types'

const RootStack = createNativeStackNavigator<RootStackParamList>()

function MainStack() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainTabs} />
      <RootStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <RootStack.Screen name="NewOrder" component={NewOrderScreen} />
      <RootStack.Screen name="FindingTechnician" component={FindingTechnicianScreen} />
      <RootStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <RootStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <RootStack.Screen name="Chat" component={ChatScreen} />
      <RootStack.Screen name="Rating" component={RatingScreen} />
      <RootStack.Screen name="AddAddress" component={AddAddressScreen} />
    </RootStack.Navigator>
  )
}

export function AppNavigator() {
  const { ready, user, hydrate } = useAuthStore()
  const [needsProfile, setNeedsProfile] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!user) {
      setNeedsProfile(false)
      return
    }
    setCheckingProfile(true)
    getProfile()
      .then((p) => {
        setNeedsProfile(!p.name || p.name.trim().length === 0)
      })
      .catch(() => setNeedsProfile(false))
      .finally(() => setCheckingProfile(false))
  }, [user])

  if (!ready || checkingProfile) return <SplashScreen />
  if (user && needsProfile) {
    return <ProfileSetupScreen onComplete={() => setNeedsProfile(false)} />
  }

  return (
    <NavigationContainer linking={linking} fallback={<SplashScreen />}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
