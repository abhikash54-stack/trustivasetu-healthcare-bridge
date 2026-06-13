import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
} from '../../services/notificationsService';
import { Notification } from '../../types/auth';

const TYPE_ICON: Record<string, string> = {
  LEAD: 'people',
  TASK: 'assignment',
  LEAVE: 'event-note',
  APPROVAL: 'check-circle-outline',
  SYSTEM: 'notifications',
};

const TYPE_COLOR: Record<string, string> = {
  LEAD: BRAND.primary,
  TASK: '#3498DB',
  LEAVE: '#F39C12',
  APPROVAL: '#27AE60',
  SYSTEM: '#95A5A6',
};

function NotificationCard({
  item,
  onRead,
}: {
  item: Notification;
  onRead: (id: string) => void;
}) {
  const icon = TYPE_ICON[item.type] ?? 'notifications';
  const color = TYPE_COLOR[item.type] ?? BRAND.primary;
  const timeAgo = formatRelative(item.createdAt);

  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
      onPress={() => !item.isRead && onRead(item.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.notifIcon, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <RNText style={styles.notifTitle} numberOfLines={1}>{item.title}</RNText>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <RNText style={styles.notifMessage} numberOfLines={2}>{item.message}</RNText>
        <RNText style={styles.notifTime}>{timeAgo}</RNText>
      </View>
    </TouchableOpacity>
  );
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const queryResult = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  }) as any;

  const notifications: Notification[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const isError: boolean = queryResult.isError;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => refetch(),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => refetch(),
    onError: () => Alert.alert('Error', 'Could not mark all as read.'),
  });

  const readAllLoading = (readAllMutation as any).isPending;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="cloud-off" size={48} color="#C8DFD0" />
        <RNText style={styles.errorText}>Could not load notifications</RNText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <RNText style={styles.retryText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header Row */}
      {notifications.length > 0 && (
        <View style={styles.headerRow}>
          <RNText style={styles.headerCount}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </RNText>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => readAllMutation.mutate()}
              disabled={readAllLoading}
            >
              <RNText style={styles.markAllText}>
                {readAllLoading ? 'Marking...' : 'Mark all read'}
              </RNText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="notifications-none" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>No notifications</RNText>
          <RNText style={styles.emptyHint}>
            Lead updates, task reminders, and approvals will appear here.
          </RNText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard item={item} onRead={(id) => readMutation.mutate(id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCount: { fontSize: 13, fontWeight: '700', color: '#1A2D1E' },
  markAllText: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: '#E74C3C', fontSize: 15, fontWeight: '600', marginTop: 12 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1A2D1E', marginTop: 16 },
  emptyHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: BRAND.primary,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1A2D1E' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primary },
  notifMessage: { fontSize: 12, color: '#5A7A63', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#B0C8B8', fontWeight: '500' },
});
