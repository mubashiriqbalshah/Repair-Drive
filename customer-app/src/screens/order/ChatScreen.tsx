import React, { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Screen } from '@/components/Screen'
import { Header } from '@/components/Header'
import { Spinner } from '@/components/Spinner'
import { getChat, sendMessage } from '@/api/orders'
import { getSocket, joinOrderRoom, leaveOrderRoom } from '@/socket'
import { useAuthStore } from '@/stores/authStore'
import { colors, radii, spacing, typography } from '@/config/theme'
import type { ChatMessage } from '@/api/types'
import type { RootScreenProps } from '@/navigation/types'

export function ChatScreen({ route, navigation }: RootScreenProps<'Chat'>) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { orderId, technicianName } = route.params
  const myId = useAuthStore((s) => s.user?.id)
  const [text, setText] = useState('')
  const listRef = useRef<FlatList>(null)

  const chatQ = useQuery({ queryKey: ['chat', orderId], queryFn: () => getChat(orderId) })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    joinOrderRoom(orderId)
    const onNew = (data: { orderId: string; message: ChatMessage }) => {
      if (data.orderId !== orderId) return
      qc.setQueryData(['chat', orderId], (prev: { messages: ChatMessage[] } | undefined) => {
        if (!prev) return prev
        return { ...prev, messages: [...prev.messages, data.message] }
      })
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
    socket.on('chat:new_message', onNew)
    return () => {
      socket.off('chat:new_message', onNew)
      leaveOrderRoom(orderId)
    }
  }, [orderId, qc])

  const sendM = useMutation({
    mutationFn: () => sendMessage(orderId, { text: text.trim() }),
    onSuccess: () => {
      setText('')
    },
  })

  if (chatQ.isLoading) {
    return (
      <Screen padded>
        <Header title={t('chat.title', { name: technicianName ?? 'Mistri' })} onBack={() => navigation.goBack()} />
        <Spinner />
      </Screen>
    )
  }

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <Header title={t('chat.title', { name: technicianName ?? 'Mistri' })} onBack={() => navigation.goBack()} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={listRef}
          data={chatQ.data?.messages ?? []}
          keyExtractor={(m) => m._id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}
          renderItem={({ item }) => <Bubble msg={item} isMine={item.senderId === myId} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.text.disabled}
            multiline
          />
          <TouchableOpacity
            onPress={() => sendM.mutate()}
            disabled={!text.trim() || sendM.isPending}
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
          >
            <Icon name="send" size={20} color={colors.text.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

function Bubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bubbleRow: { marginVertical: 2 },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubbleRowTheirs: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  bubbleText: { ...typography.body, color: colors.text.body },
  bubbleTextMine: { color: colors.text.onPrimary },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    ...typography.body,
    color: colors.text.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
