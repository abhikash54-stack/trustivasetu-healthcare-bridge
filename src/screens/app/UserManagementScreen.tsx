import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Avatar } from '../../components/Avatar';
import { BRAND } from '../../theme/theme';
import { ManagedUser, UserStatus } from '../../types/auth';
import {
  listUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  adminResetPassword,
  deleteUser,
} from '../../services/userManagementService';

const ROLES = ['ADMIN', 'REGIONAL_MANAGER', 'TEAM_MEMBER'] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  REGIONAL_MANAGER: 'Regional Manager',
  TEAM_MEMBER: 'Team Member',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#6C3483',
  ADMIN: '#1A5276',
  REGIONAL_MANAGER: '#0E6655',
  TEAM_MEMBER: '#4D5656',
};

const STATUS_COLORS: Partial<Record<UserStatus, string>> = {
  ACTIVE: '#27AE60',
  INACTIVE: '#E67E22',
  SUSPENDED: '#E74C3C',
  BLOCKED: '#922B21',
  TERMINATED: '#555',
};

interface AddForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

const EMPTY_FORM: AddForm = { name: '', email: '', phone: '', password: '', role: 'TEAM_MEMBER' };

function isActive(user: ManagedUser): boolean {
  return user.status === 'ACTIVE';
}

export function UserManagementScreen() {
  const insets = useSafeAreaInsets();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [resetPassword, setResetPassword] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const queryResult = useQuery({ queryKey: ['users'], queryFn: listUsers }) as any;
  const users: ManagedUser[] = queryResult.data ?? [];
  const { isLoading } = queryResult;
  const refetch = () => (queryResult.refetch as () => Promise<any>)().finally(() => setRefreshing(false));

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser: ManagedUser) => {
      refetch();
      setShowAddModal(false);
      setForm(EMPTY_FORM);
      Alert.alert('User created', `${newUser.name} has been added as ${ROLE_LABELS[newUser.role] ?? newUser.role}.`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not create user.');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      refetch();
      setShowRoleModal(false);
      const name = selectedUser?.name ?? 'User';
      Alert.alert('Role updated', `${name}'s role has been changed.`);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not update role.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateUserStatus(userId, status),
    onSuccess: () => { refetch(); },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not update status.');
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      adminResetPassword(userId, password),
    onSuccess: () => {
      setShowResetModal(false);
      setResetPassword('');
      Alert.alert('Done', `Password reset for ${selectedUser?.name ?? 'user'}.`);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not reset password.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { refetch(); },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message ?? 'Could not delete user.');
    },
  });

  const handleAddUser = () => {
    if (!form.name.trim()) return Alert.alert('Required', "Enter the user's full name.");
    if (!form.email.trim() || !form.email.includes('@'))
      return Alert.alert('Required', 'Enter a valid email address.');
    if (!form.email.trim().endsWith('@trustivasetu.com'))
      return Alert.alert('Invalid email', 'Email must end with @trustivasetu.com');
    if (!form.password || form.password.length < 6)
      return Alert.alert('Required', 'Password must be at least 6 characters.');
    createMutation.mutate(form);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    const toActive = !isActive(user);
    const action = toActive ? 'Enable' : 'Disable';
    Alert.alert(`${action} account`, `${action} ${user.name}'s account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action,
        style: toActive ? 'default' : 'destructive',
        onPress: () =>
          statusMutation.mutate({ userId: user.id, status: toActive ? 'ACTIVE' : 'INACTIVE' }),
      },
    ]);
  };

  const handleDelete = (user: ManagedUser) => {
    Alert.alert(
      'Delete account',
      `Permanently delete ${user.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(user.id),
        },
      ],
    );
  };

  const handleResetPassword = (user: ManagedUser) => {
    setSelectedUser(user);
    setResetPassword('');
    setShowResetModal(true);
  };

  const submitReset = () => {
    if (!resetPassword || resetPassword.length < 6) {
      return Alert.alert('Too short', 'Password must be at least 6 characters.');
    }
    if (!selectedUser) return;
    resetMutation.mutate({ userId: selectedUser.id, password: resetPassword });
  };

  const renderUser = ({ item }: { item: ManagedUser }) => (
    <View style={[styles.userCard, !isActive(item) && styles.userCardInactive]}>
      <View style={styles.userRow}>
        <Avatar name={item.name} size={44} bgColor={isActive(item) ? BRAND.primary : '#999'} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, !isActive(item) && styles.mutedText]}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone ? <Text style={styles.userPhone}>{item.phone}</Text> : null}
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] ?? '#555' }]}>
              <Text style={styles.roleText}>{ROLE_LABELS[item.role] ?? item.role}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] ?? '#999' }]}>
              <Text style={styles.roleText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => { setSelectedUser(item); setShowRoleModal(true); }}
        >
          <MaterialIcons name="swap-horiz" size={16} color={BRAND.primary} />
          <Text style={styles.actionLabel}>Role</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleStatus(item)}>
          <MaterialIcons
            name={isActive(item) ? 'block' : 'check-circle'}
            size={16}
            color={isActive(item) ? '#E67E22' : '#27AE60'}
          />
          <Text style={[styles.actionLabel, { color: isActive(item) ? '#E67E22' : '#27AE60' }]}>
            {isActive(item) ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => handleResetPassword(item)}>
          <MaterialIcons name="lock-reset" size={16} color="#8E44AD" />
          <Text style={[styles.actionLabel, { color: '#8E44AD' }]}>Reset Pwd</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <MaterialIcons name="delete-outline" size={16} color="#E74C3C" />
          <Text style={[styles.actionLabel, { color: '#E74C3C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{users.length} account{users.length !== 1 ? 's' : ''}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={BRAND.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); refetch(); }}
              tintColor={BRAND.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found. Tap + to create one.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setForm(EMPTY_FORM); setShowAddModal(true); }}
      >
        <MaterialIcons name="person-add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
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
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <FormInput
              label="Email *"
              placeholder="user@trustivasetu.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
            />
            <FormInput
              label="Phone"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
            <FormInput
              label="Password *"
              placeholder="Min. 6 characters"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            />
            <Text style={styles.rolePickerLabel}>Role *</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    form.role === role && {
                      backgroundColor: ROLE_COLORS[role],
                      borderColor: ROLE_COLORS[role],
                    },
                  ]}
                  onPress={() => setForm((p) => ({ ...p, role }))}
                >
                  <Text style={[styles.roleChipText, form.role === role && styles.roleChipTextActive]}>
                    {ROLE_LABELS[role]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label={createMutation.isPending ? 'Creating...' : 'Create Account'}
                onPress={handleAddUser}
                disabled={createMutation.isPending}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Role Picker Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowRoleModal(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>
              Change role for{'\n'}
              <Text style={{ color: BRAND.primary }}>{selectedUser?.name}</Text>
            </Text>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleOption, selectedUser?.role === role && styles.roleOptionActive]}
                onPress={() => {
                  if (selectedUser) {
                    roleMutation.mutate({ userId: selectedUser.id, role });
                  }
                }}
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

      {/* Reset Password Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowResetModal(false); setResetPassword(''); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>
              Reset password for{'\n'}
              <Text style={{ color: BRAND.primary }}>{selectedUser?.name}</Text>
            </Text>
            <TextInput
              style={styles.resetInput}
              placeholder="New password (min. 6 chars)"
              placeholderTextColor="#AAA"
              secureTextEntry
              value={resetPassword}
              onChangeText={setResetPassword}
              autoFocus
            />
            <PrimaryButton
              label={resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              onPress={submitReset}
              disabled={resetMutation.isPending}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowResetModal(false); setResetPassword(''); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
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
  modalContent: { padding: 24, paddingBottom: 40 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  sheetTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 16, lineHeight: 22 },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  roleOptionActive: { backgroundColor: BRAND.primaryLight },
  roleOptionDot: { width: 10, height: 10, borderRadius: 5 },
  roleOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  cancelBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: '#999', fontWeight: '600' },
  resetInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
  },
});
