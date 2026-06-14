import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { BRAND } from '../../theme/theme';
import { UserProfile, CustomOccasion, ManagedUser } from '../../types/auth';
import { listUsers } from '../../services/userManagementService';

const STORAGE_KEY = '@trustiva:user';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

function SectionTitle({ text }: { text: string }) {
  return <RNText style={styles.sectionTitle}>{text}</RNText>;
}

function OccasionRow({
  icon,
  emoji,
  label,
  value,
  hint,
  onEdit,
}: {
  icon: string;
  emoji: string;
  label: string;
  value?: string;
  hint: string;
  onEdit: () => void;
}) {
  return (
    <TouchableOpacity style={styles.occasionRow} onPress={onEdit} activeOpacity={0.75}>
      <View style={styles.occasionIcon}>
        <RNText style={styles.occasionEmoji}>{emoji}</RNText>
      </View>
      <View style={{ flex: 1 }}>
        <RNText style={styles.occasionLabel}>{label}</RNText>
        {value ? (
          <RNText style={styles.occasionValue}>{value}</RNText>
        ) : (
          <RNText style={styles.occasionHint}>{hint}</RNText>
        )}
      </View>
      <MaterialIcons name={value ? 'edit' : 'add'} size={18} color={BRAND.primary} />
    </TouchableOpacity>
  );
}

function formatMD(md: string): string {
  if (!md) return '';
  const [mm, dd] = md.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dd} ${months[parseInt(mm, 10) - 1]}`;
}

function formatISO(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntilMD(md: string): number {
  const [mm, dd] = md.split('-').map(Number);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), mm - 1, dd);
  const nextYear = new Date(now.getFullYear() + 1, mm - 1, dd);
  const target = thisYear >= now ? thisYear : nextYear;
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function getUpcomingTeamAnniversaries(users: ManagedUser[], days: number) {
  const now = new Date();
  const results: { user: ManagedUser; daysAway: number; years: number }[] = [];

  for (const u of users) {
    if (!u.createdAt) continue;
    const joined = new Date(u.createdAt);
    if (isNaN(joined.getTime())) continue;
    const thisYear = new Date(now.getFullYear(), joined.getMonth(), joined.getDate());
    const nextYear = new Date(now.getFullYear() + 1, joined.getMonth(), joined.getDate());
    const target = thisYear >= now ? thisYear : nextYear;
    const daysAway = Math.ceil((target.getTime() - now.getTime()) / 86400000);
    if (daysAway <= days) {
      const years = target.getFullYear() - joined.getFullYear();
      results.push({ user: u, daysAway, years });
    }
  }

  return results.sort((a, b) => a.daysAway - b.daysAway);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface EditModalProps {
  visible: boolean;
  title: string;
  format: 'MM-DD' | 'ISO';
  initial: string;
  onSave: (val: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function EditModal({ visible, title, format, initial, onSave, onClear, onClose }: EditModalProps) {
  const [val, setVal] = useState(initial);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <RNText style={styles.modalTitle}>{title}</RNText>
        <RNText style={styles.modalHint}>
          {format === 'MM-DD'
            ? 'Enter date as MM-DD (e.g. 03-15 for March 15)'
            : 'Enter date as YYYY-MM-DD (e.g. 2019-06-01)'}
        </RNText>
        <TextInput
          style={styles.modalInput}
          value={val}
          onChangeText={setVal}
          placeholder={format === 'MM-DD' ? 'MM-DD' : 'YYYY-MM-DD'}
          placeholderTextColor="#B0C8B8"
          keyboardType="numbers-and-punctuation"
          autoFocus
          maxLength={10}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { onClear(); onClose(); }}
          >
            <RNText style={styles.clearBtnText}>Clear</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              if (val.trim()) {
                onSave(val.trim());
              }
              onClose();
            }}
          >
            <RNText style={styles.saveBtnText}>Save</RNText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TeamAnniversaryCard({
  user,
  daysAway,
  years,
}: {
  user: ManagedUser;
  daysAway: number;
  years: number;
}) {
  const isToday = daysAway === 0;
  const isSoon = daysAway <= 3;
  const accentColor = isToday ? '#27AE60' : isSoon ? '#F39C12' : BRAND.primary;

  const openWish = () => {
    const greeting =
      years === 1
        ? `Hi ${user.name.split(' ')[0]}! Congratulations on completing your 1st year with TrustivaSetu. Your contribution is valued! 🌟`
        : `Hi ${user.name.split(' ')[0]}! Congratulations on your ${ordinal(years)} work anniversary at TrustivaSetu. Thank you for your dedication! 🎊`;

    if (user.phone) {
      const url = `sms:${user.phone}?body=${encodeURIComponent(greeting)}`;
      Linking.openURL(url).catch(() => Alert.alert('Could not open SMS', 'Please copy the greeting manually.'));
    } else {
      Alert.alert('Greeting', greeting);
    }
  };

  return (
    <View style={[styles.teamCard, isToday && styles.teamCardToday]}>
      <View style={[styles.teamAvatar, { backgroundColor: accentColor + '22' }]}>
        <RNText style={[styles.teamAvatarText, { color: accentColor }]}>
          {user.name.charAt(0).toUpperCase()}
        </RNText>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.teamNameRow}>
          <RNText style={styles.teamName}>{user.name}</RNText>
          {isToday && (
            <View style={styles.todayBadge}>
              <RNText style={styles.todayBadgeText}>TODAY</RNText>
            </View>
          )}
        </View>
        <RNText style={[styles.teamAnniversaryLabel, { color: accentColor }]}>
          🌟 {ordinal(years)} Work Anniversary
          {isToday ? ' — Today!' : daysAway === 1 ? ' — Tomorrow' : ` — in ${daysAway} days`}
        </RNText>
        <RNText style={styles.teamRole}>{user.role.replace(/_/g, ' ')}</RNText>
      </View>
      <TouchableOpacity
        style={[styles.wishBtn, { borderColor: accentColor }]}
        onPress={openWish}
        activeOpacity={0.7}
      >
        <MaterialIcons name="send" size={14} color={accentColor} />
        <RNText style={[styles.wishBtnText, { color: accentColor }]}>Wish</RNText>
      </TouchableOpacity>
    </View>
  );
}

type MainTab = 'my' | 'team';

export function OccasionsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user) as UserProfile | null;
  const isAdmin = ADMIN_ROLES.includes(user?.role ?? '');

  const [mainTab, setMainTab] = useState<MainTab>('my');
  const [editField, setEditField] = useState<'birthday' | 'joiningDate' | 'marriageAnniversary' | null>(null);
  const [addCustomVisible, setAddCustomVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('');

  const usersQuery = useQuery({
    queryKey: ['users', 'for-occasions'],
    queryFn: listUsers,
    enabled: isAdmin && mainTab === 'team',
    staleTime: 5 * 60 * 1000,
  }) as any;
  const allUsers: ManagedUser[] = usersQuery.data ?? [];
  const upcomingAnniversaries = getUpcomingTeamAnniversaries(allUsers, 30);

  const updateAndPersist = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    dispatch(updateUser(updated));
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // silent
    }
  };

  const handleRemoveCustom = (id: string) => {
    Alert.alert('Remove Occasion', 'Remove this custom occasion?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const filtered = (user?.customOccasions ?? []).filter((o) => o.id !== id);
          updateAndPersist({ customOccasions: filtered });
        },
      },
    ]);
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customDate.trim()) {
      Alert.alert('Required', 'Please enter both a name and a date (MM-DD).');
      return;
    }
    const newOcc: CustomOccasion = {
      id: Math.random().toString(36).slice(2, 10),
      name: customName.trim(),
      date: customDate.trim(),
    };
    const list = [...(user?.customOccasions ?? []), newOcc];
    updateAndPersist({ customOccasions: list });
    setCustomName('');
    setCustomDate('');
    setAddCustomVisible(false);
  };

  const editConfig: Record<string, { title: string; format: 'MM-DD' | 'ISO'; initial: string }> = {
    birthday: { title: 'Birthday', format: 'MM-DD', initial: user?.birthday ?? '' },
    joiningDate: { title: 'Date of Joining', format: 'ISO', initial: user?.joiningDate ?? '' },
    marriageAnniversary: { title: 'Marriage Anniversary', format: 'MM-DD', initial: user?.marriageAnniversary ?? '' },
  };

  const activeConfig = editField ? editConfig[editField] : null;

  const myOccasionsContent = (
    <>
      <View style={styles.headerCard}>
        <RNText style={styles.headerEmoji}>🎉</RNText>
        <RNText style={styles.headerTitle}>Special Occasions</RNText>
        <RNText style={styles.headerSubtitle}>
          Add your special dates to receive personalised celebrations when you log in.
        </RNText>
      </View>

      <SectionTitle text="YOUR PROFILE DATES" />
      <View style={styles.card}>
        <OccasionRow
          icon="cake"
          emoji="🎂"
          label="Birthday"
          value={user?.birthday ? formatMD(user.birthday) : undefined}
          hint="Not set — add your birthday"
          onEdit={() => setEditField('birthday')}
        />
        <OccasionRow
          icon="business-center"
          emoji="🌟"
          label="Date of Joining"
          value={user?.joiningDate ? formatISO(user.joiningDate) : undefined}
          hint="Not set — add your joining date"
          onEdit={() => setEditField('joiningDate')}
        />
        <OccasionRow
          icon="favorite"
          emoji="💍"
          label="Marriage Anniversary"
          value={user?.marriageAnniversary ? formatMD(user.marriageAnniversary) : undefined}
          hint="Not set — optional"
          onEdit={() => setEditField('marriageAnniversary')}
        />
      </View>

      <SectionTitle text="CUSTOM OCCASIONS" />
      <View style={styles.card}>
        {(!user?.customOccasions || user.customOccasions.length === 0) ? (
          <View style={styles.emptyRow}>
            <MaterialIcons name="event" size={24} color="#C8DFD0" />
            <RNText style={styles.emptyText}>No custom occasions yet</RNText>
          </View>
        ) : (
          <FlatList
            data={user.customOccasions}
            keyExtractor={(o) => o.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.customRow}>
                <RNText style={styles.customEmoji}>🎉</RNText>
                <View style={{ flex: 1 }}>
                  <RNText style={styles.customName}>{item.name}</RNText>
                  <RNText style={styles.customDate}>{formatMD(item.date)}</RNText>
                </View>
                <TouchableOpacity onPress={() => handleRemoveCustom(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="delete-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        <TouchableOpacity
          style={styles.addCustomBtn}
          onPress={() => setAddCustomVisible(true)}
          activeOpacity={0.75}
        >
          <MaterialIcons name="add-circle-outline" size={18} color={BRAND.primary} />
          <RNText style={styles.addCustomText}>Add Custom Occasion</RNText>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons name="info-outline" size={16} color={BRAND.primary} style={{ marginTop: 1 }} />
        <RNText style={styles.infoText}>
          On your special days, you'll see a personalised celebration with confetti when you open the app.
          {isAdmin ? ' Use the Team tab to see and wish your colleagues.' : ''}
        </RNText>
      </View>
    </>
  );

  const teamContent = (
    <>
      <View style={styles.teamHeader}>
        <MaterialIcons name="people" size={20} color={BRAND.primary} />
        <View style={{ flex: 1 }}>
          <RNText style={styles.teamHeaderTitle}>Team Work Anniversaries</RNText>
          <RNText style={styles.teamHeaderSub}>Next 30 days · tap Wish to send a greeting via SMS</RNText>
        </View>
      </View>

      {usersQuery.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND.primary} />
          <RNText style={styles.loadingText}>Loading team data...</RNText>
        </View>
      ) : usersQuery.isError ? (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={36} color="#C8DFD0" />
          <RNText style={styles.errorText}>Could not load team data</RNText>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => (usersQuery.refetch as () => void)()}
          >
            <RNText style={styles.retryBtnText}>Retry</RNText>
          </TouchableOpacity>
        </View>
      ) : upcomingAnniversaries.length === 0 ? (
        <View style={styles.emptyTeam}>
          <MaterialIcons name="event-available" size={40} color="#C8DFD0" />
          <RNText style={styles.emptyTeamTitle}>No upcoming anniversaries</RNText>
          <RNText style={styles.emptyTeamSub}>No work anniversaries in the next 30 days.</RNText>
        </View>
      ) : (
        <>
          <View style={styles.teamSummaryRow}>
            <View style={styles.teamSummaryChip}>
              <RNText style={styles.teamSummaryCount}>{upcomingAnniversaries.length}</RNText>
              <RNText style={styles.teamSummaryLabel}>Upcoming</RNText>
            </View>
            <View style={[styles.teamSummaryChip, { borderColor: '#27AE60' }]}>
              <RNText style={[styles.teamSummaryCount, { color: '#27AE60' }]}>
                {upcomingAnniversaries.filter((a) => a.daysAway === 0).length}
              </RNText>
              <RNText style={styles.teamSummaryLabel}>Today</RNText>
            </View>
            <View style={[styles.teamSummaryChip, { borderColor: '#F39C12' }]}>
              <RNText style={[styles.teamSummaryCount, { color: '#F39C12' }]}>
                {upcomingAnniversaries.filter((a) => a.daysAway <= 7).length}
              </RNText>
              <RNText style={styles.teamSummaryLabel}>This Week</RNText>
            </View>
          </View>
          {upcomingAnniversaries.map(({ user: u, daysAway, years }) => (
            <TeamAnniversaryCard key={u.id} user={u} daysAway={daysAway} years={years} />
          ))}
        </>
      )}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background }}>
      {/* Main tab bar — only shown to admins */}
      {isAdmin && (
        <View style={styles.mainTabBar}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'my' && styles.mainTabActive]}
            onPress={() => setMainTab('my')}
          >
            <MaterialIcons name="person" size={16} color={mainTab === 'my' ? BRAND.primary : '#5A7A63'} />
            <RNText style={[styles.mainTabLabel, mainTab === 'my' && styles.mainTabLabelActive]}>
              My Occasions
            </RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'team' && styles.mainTabActive]}
            onPress={() => setMainTab('team')}
          >
            <MaterialIcons name="people" size={16} color={mainTab === 'team' ? BRAND.primary : '#5A7A63'} />
            <RNText style={[styles.mainTabLabel, mainTab === 'team' && styles.mainTabLabelActive]}>
              Team
            </RNText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {mainTab === 'my' || !isAdmin ? myOccasionsContent : teamContent}
      </ScrollView>

      {activeConfig && (
        <EditModal
          visible={!!editField}
          title={`Set ${activeConfig.title}`}
          format={activeConfig.format}
          initial={activeConfig.initial}
          onSave={(val) => updateAndPersist({ [editField!]: val })}
          onClear={() => updateAndPersist({ [editField!]: undefined })}
          onClose={() => setEditField(null)}
        />
      )}

      <Modal visible={addCustomVisible} transparent animationType="slide" onRequestClose={() => setAddCustomVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddCustomVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <RNText style={styles.modalTitle}>Add Custom Occasion</RNText>
          <TextInput
            style={styles.modalInput}
            value={customName}
            onChangeText={setCustomName}
            placeholder="Occasion name (e.g. Diwali, Promotion Day)"
            placeholderTextColor="#B0C8B8"
            autoFocus
          />
          <TextInput
            style={[styles.modalInput, { marginTop: 10 }]}
            value={customDate}
            onChangeText={setCustomDate}
            placeholder="Date as MM-DD (e.g. 11-01)"
            placeholderTextColor="#B0C8B8"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setAddCustomVisible(false)}>
              <RNText style={styles.clearBtnText}>Cancel</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCustom}>
              <RNText style={styles.saveBtnText}>Add</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20, gap: 16 },
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: { borderBottomColor: BRAND.primary },
  mainTabLabel: { fontSize: 13, fontWeight: '600', color: '#5A7A63' },
  mainTabLabelActive: { color: BRAND.primary },
  headerCard: {
    backgroundColor: BRAND.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 4,
  },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 4,
  },
  occasionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  occasionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occasionEmoji: { fontSize: 20 },
  occasionLabel: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  occasionValue: { fontSize: 13, color: BRAND.primary, fontWeight: '500', marginTop: 2 },
  occasionHint: { fontSize: 12, color: '#B0C8B8', marginTop: 2 },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
  },
  emptyText: { fontSize: 13, color: '#B0C8B8' },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  customEmoji: { fontSize: 20 },
  customName: { fontSize: 14, fontWeight: '600', color: '#1A2D1E' },
  customDate: { fontSize: 12, color: '#5A7A63', marginTop: 2 },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  addCustomText: { fontSize: 14, fontWeight: '600', color: BRAND.primary },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: BRAND.primaryDark, lineHeight: 20, fontWeight: '500' },
  // Team tab styles
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  teamHeaderTitle: { fontSize: 15, fontWeight: '700', color: BRAND.primaryDark },
  teamHeaderSub: { fontSize: 12, color: BRAND.primary, marginTop: 3 },
  teamSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  teamSummaryChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  teamSummaryCount: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  teamSummaryLabel: { fontSize: 10, color: '#5A7A63', fontWeight: '600', marginTop: 2 },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 8,
  },
  teamCardToday: {
    borderWidth: 1.5,
    borderColor: '#27AE60',
    backgroundColor: '#F0FFF7',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: { fontSize: 18, fontWeight: '800' },
  teamNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamName: { fontSize: 14, fontWeight: '700', color: '#1A2D1E' },
  todayBadge: {
    backgroundColor: '#27AE60',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  teamAnniversaryLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  teamRole: { fontSize: 11, color: '#5A7A63', marginTop: 2 },
  wishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wishBtnText: { fontSize: 12, fontWeight: '700' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 10 },
  loadingText: { color: '#5A7A63', fontSize: 13 },
  errorText: { color: '#E74C3C', fontSize: 14, fontWeight: '600' },
  retryBtn: { backgroundColor: BRAND.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  emptyTeam: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTeamTitle: { fontSize: 15, fontWeight: '700', color: '#1A2D1E' },
  emptyTeamSub: { fontSize: 13, color: '#5A7A63', textAlign: 'center' },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C8DFD0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A2D1E', marginBottom: 8 },
  modalHint: { fontSize: 12, color: '#5A7A63', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A2D1E',
    letterSpacing: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#F0F7F3',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 15, fontWeight: '700', color: '#5A7A63' },
  saveBtn: {
    flex: 2,
    backgroundColor: BRAND.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
