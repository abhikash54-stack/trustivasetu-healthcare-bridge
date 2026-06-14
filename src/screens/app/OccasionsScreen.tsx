import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { BRAND } from '../../theme/theme';
import { UserProfile, CustomOccasion } from '../../types/auth';

const STORAGE_KEY = '@trustiva:user';

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

export function OccasionsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user) as UserProfile | null;

  const [editField, setEditField] = useState<'birthday' | 'joiningDate' | 'marriageAnniversary' | null>(null);
  const [addCustomVisible, setAddCustomVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('');

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
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
          Colleagues with Admin access can also send you greetings.
        </RNText>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 20, gap: 16 },
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
