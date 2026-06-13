import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Avatar } from '../../components/Avatar';
import { BRAND } from '../../theme/theme';
import {
  LocalUser,
  getLocalUsers,
  createLocalUser,
  updateLocalUserRole,
  deleteLocalUser,
  toggleLocalUser,
  resetLocalUserPassword,
} from '../../services/localAuthService';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RM', 'EMPLOYEE'] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RM: 'Regional Mgr',
  EMPLOYEE: 'Employee',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#6C3483',
  ADMIN: '#1A5276',
  MANAGER: '#784212',
  RM: '#0E6655',
  EMPLOYEE: '#4D5656',
};

interface AddForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

const EMPTY_FORM: AddForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'EMPLOYEE',
};

export function UserManagementScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getLocalUsers();
      setUsers(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleAddUser = async () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Enter the user\'s full name.');
    if (!form.email.trim() || !form.email.includes('@'))
      return Alert.alert('Required', 'Enter a valid email address.');
    if (!form.password || form.password.length < 6)
      return Alert.alert('Required', 'Password must be at least 6 characters.');
    setSaving(true);
    try {
      await createLocalUser(form);
      setShowAddModal(false);
      setForm(EMPTY_FORM);
      await fetchUsers();
      Alert.alert('User created', `${form.name} has been added as ${ROLE_LABELS[form.role]}.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = (user: LocalUser) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const applyRole = async (role: string) => {
    if (!selectedUser) return;
    setShowRoleModal(false);
    await updateLocalUserRole(selectedUser.id, role);
    await fetchUsers();
    Alert.alert('Role updated', `${selectedUser.name} is now ${ROLE_LABELS[role]}.`);
    setSelectedUser(null);
  };

  const handleToggleActive = (user: LocalUser) => {
    const action = user.isActive ? 'Disable' : 'Enable';
    Alert.alert(
      `${action} account`,
      `${action} ${user.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: user.isActive ? 'destructive' : 'default',
          onPress: async () => {
            await toggleLocalUser(user.id, !user.isActive);
            await fetchUsers();
          },
        },
      ],
    );
  };

  const handleDelete = (user: LocalUser) => {
    if (user.id === 'usr_001') {
      return Alert.alert('Not allowed', 'The primary admin account cannot be deleted.');
    }
    Alert.alert(
      'Delete account',
      `Permanently delete ${user.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLocalUser(user.id);
            await fetchUsers();
          },
        },
      ],
    );
  };

  const handleResetPassword = (user: LocalUser) => {
    Alert.prompt(
      'Reset password',
      `Enter a new password for ${user.name}:`,
      async (newPwd) => {
        if (!newPwd || newPwd.length < 6) {
          return Alert.alert('Too short', 'Password must be at least 6 characters.');
        }
        await resetLocalUserPassword(user.id, newPwd);
        Alert.alert('Done', 'Password has been reset.');
      },
      'secure-text',
    );
  };

  const renderUser = ({ item }: { item: LocalUser }) => (
    <View style={[styles.userCard, !item.isActive && styles.userCardInactive]}>
      <View style={styles.userRow}>
        <Avatar name={item.name} size={44} bgColor={item.isActive ? BRAND.primary : '#999'} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, !item.isActive && styles.mutedText]}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone ? <Text style={styles.userPhone}>{item.phone}</Text> : null}
          <View style={styles.roleBadgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] ?? '#555' }]}>
              <Text style={styles.roleText}>{ROLE_LABELS[item.role] ?? item.role}</Text>
            </View>
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>INACTIVE</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleChangeRole(item)}>
          <MaterialIcons name="swap-horiz" size={16} color={BRAND.primary} />
          <Text style={styles.actionLabel}>Role</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleActive(item)}>
          <MaterialIcons
            name={item.isActive ? 'block' : 'check-circle'}
            size={16}
            color={item.isActive ? '#E67E22' : '#27AE60'}
          />
          <Text style={[styles.actionLabel, { color: item.isActive ? '#E67E22' : '#27AE60' }]}>
            {item.isActive ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleResetPassword(item)}>
            <MaterialIcons name="lock-reset" size={16} color="#8E44AD" />
            <Text style={[styles.actionLabel, { color: '#8E44AD' }]}>Reset Pwd</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <MaterialIcons name="delete-outline" size={16} color="#E74C3C" />
          <Text style={[styles.actionLabel, { color: '#E74C3C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{users.length} account{users.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={BRAND.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.primary} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users yet. Tap + to create one.</Text>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setForm(EMPTY_FORM); setShowAddModal(true); }}>
        <MaterialIcons name="person-add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add User Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create User Account</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FormInput
              label="Full Name *"
              placeholder="e.g. Ravi Kumar"
              value={form.name}
              onChangeText={v => setForm(p => ({ ...p, name: v }))}
            />
            <FormInput
              label="Email *"
              placeholder="user@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => setForm(p => ({ ...p, email: v }))}
            />
            <FormInput
              label="Phone"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => setForm(p => ({ ...p, phone: v }))}
            />
            <FormInput
              label="Password *"
              placeholder="Min. 6 characters"
              secureTextEntry
              value={form.password}
              onChangeText={v => setForm(p => ({ ...p, password: v }))}
            />

            <Text style={styles.rolePickerLabel}>Role *</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    form.role === role && { backgroundColor: ROLE_COLORS[role], borderColor: ROLE_COLORS[role] },
                  ]}
                  onPress={() => setForm(p => ({ ...p, role }))}
                >
                  <Text style={[styles.roleChipText, form.role === role && styles.roleChipTextActive]}>
                    {ROLE_LABELS[role]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label={saving ? 'Creating...' : 'Create Account'}
                onPress={handleAddUser}
                disabled={saving}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Role Picker Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade" onRequestClose={() => setShowRoleModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowRoleModal(false)}>
          <View style={styles.roleSheet}>
            <Text style={styles.roleSheetTitle}>
              Change role for{'\n'}<Text style={{ color: BRAND.primary }}>{selectedUser?.name}</Text>
            </Text>
            {ROLES.map(role => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  selectedUser?.role === role && styles.roleOptionActive,
                ]}
                onPress={() => applyRole(role)}
              >
                <View style={[styles.roleOptionDot, { backgroundColor: ROLE_COLORS[role] }]} />
                <Text style={styles.roleOptionLabel}>{ROLE_LABELS[role]}</Text>
                {selectedUser?.role === role && (
                  <MaterialIcons name="check" size={18} color={BRAND.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRoleModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  headerSub: { fontSize: 13, color: '#666', marginTop: 2 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  userCardInactive: { opacity: 0.65 },
  userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  userEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  userPhone: { fontSize: 12, color: '#666' },
  mutedText: { color: '#999' },
  roleBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  inactiveBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E74C3C',
  },
  inactiveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: BRAND.primary },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  // Add Modal
  modalContent: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  rolePickerLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  roleChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#F8F8F8',
  },
  roleChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  roleChipTextActive: { color: '#FFFFFF' },
  // Role Sheet Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  roleSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  roleSheetTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 16, lineHeight: 22 },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  roleOptionActive: { backgroundColor: BRAND.primaryLight ?? '#E8F5EE' },
  roleOptionDot: { width: 10, height: 10, borderRadius: 5 },
  roleOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  cancelBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: '#999', fontWeight: '600' },
});
