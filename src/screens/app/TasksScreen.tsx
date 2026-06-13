import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BRAND } from '../../theme/theme';
import { fetchTasks, updateTaskStatus } from '../../services/tasksService';
import { Task } from '../../types/auth';

type FilterTab = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
  { key: 'OVERDUE', label: 'Overdue' },
];

const STATUS_COLOR: Record<string, string> = {
  TODO: '#5A7A63',
  IN_PROGRESS: '#3498DB',
  DONE: '#27AE60',
  OVERDUE: '#E74C3C',
};

const STATUS_ICON: Record<string, string> = {
  TODO: 'radio-button-unchecked',
  IN_PROGRESS: 'timelapse',
  DONE: 'check-circle',
  OVERDUE: 'error-outline',
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: '#E74C3C',
  MEDIUM: '#F39C12',
  LOW: '#27AE60',
};

function TaskCard({
  item,
  onMarkDone,
}: {
  item: Task;
  onMarkDone: (id: string) => void;
}) {
  const statusColor = STATUS_COLOR[item.status] ?? '#5A7A63';
  const statusIcon = STATUS_ICON[item.status] ?? 'radio-button-unchecked';
  const priorityColor = PRIORITY_COLOR[item.priority] ?? '#5A7A63';
  const dueDate = new Date(item.dueDate);
  const isOverdue = dueDate < new Date() && item.status !== 'DONE';

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
        <RNText style={styles.taskTitle} numberOfLines={2}>{item.title}</RNText>
        {item.status !== 'DONE' && (
          <TouchableOpacity onPress={() => onMarkDone(item.id)} style={styles.doneBtn}>
            <MaterialIcons name="check" size={16} color="#27AE60" />
          </TouchableOpacity>
        )}
      </View>

      {item.description ? (
        <RNText style={styles.taskDesc} numberOfLines={2}>{item.description}</RNText>
      ) : null}

      <View style={styles.taskMeta}>
        <View style={[styles.statusChip, { backgroundColor: statusColor + '18' }]}>
          <MaterialIcons name={statusIcon as any} size={12} color={statusColor} />
          <RNText style={[styles.statusText, { color: statusColor }]}>
            {item.status.replace('_', ' ')}
          </RNText>
        </View>

        <View style={[styles.priorityChip, { backgroundColor: priorityColor + '18' }]}>
          <RNText style={[styles.priorityText, { color: priorityColor }]}>{item.priority}</RNText>
        </View>

        <RNText style={[styles.dueText, isOverdue && styles.dueTextOverdue]}>
          Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </RNText>
      </View>

      {item.assignedBy ? (
        <RNText style={styles.assignedBy}>Assigned by {item.assignedBy}</RNText>
      ) : null}
    </View>
  );
}

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const queryResult = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
  }) as any;
  const allTasks: Task[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const refetch = () => (queryResult.refetch as () => Promise<any>)();

  const markDoneMutation = useMutation({
    mutationFn: (taskId: string) => updateTaskStatus(taskId, 'DONE'),
    onSuccess: () => refetch(),
  });

  const filtered =
    activeTab === 'ALL' ? allTasks : allTasks.filter((t) => t.status === activeTab);

  const counts: Record<FilterTab, number> = {
    ALL: allTasks.length,
    TODO: allTasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: allTasks.filter((t) => t.status === 'DONE').length,
    OVERDUE: allTasks.filter((t) => t.status === 'OVERDUE').length,
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <RNText style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
              {counts[tab.key] > 0 ? ` (${counts[tab.key]})` : ''}
            </RNText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="assignment-turned-in" size={48} color="#C8DFD0" />
          <RNText style={styles.emptyTitle}>
            {activeTab === 'ALL' ? 'No tasks assigned' : `No ${activeTab.replace('_', ' ').toLowerCase()} tasks`}
          </RNText>
          <RNText style={styles.emptyHint}>
            {activeTab === 'ALL'
              ? 'Tasks assigned to you will appear here.'
              : 'Switch tabs to see other tasks.'}
          </RNText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard item={item} onMarkDone={(id) => markDoneMutation.mutate(id)} />
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
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8DFD0',
  },
  tabActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  tabTextActive: { color: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1A2D1E', marginTop: 16 },
  emptyHint: { fontSize: 13, color: '#5A7A63', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  taskHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  taskTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A2D1E', lineHeight: 20 },
  doneBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDesc: { fontSize: 13, color: '#5A7A63', marginBottom: 10, lineHeight: 18 },
  taskMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  priorityChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  dueText: { fontSize: 11, color: '#5A7A63', fontWeight: '600' },
  dueTextOverdue: { color: '#E74C3C' },
  assignedBy: { fontSize: 11, color: '#5A7A63', marginTop: 8, fontStyle: 'italic' },
});
