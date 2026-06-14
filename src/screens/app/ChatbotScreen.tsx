import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchClinics } from '../../services/clinicService';
import {
  ChatMessage,
  botMessage,
  userMessage,
  generateBotResponse,
  getGreeting,
  getClinicSelectedMessage,
  fetchClinicForChat,
} from '../../services/chatbotService';
import { Clinic, ClinicDetail } from '../../types/auth';
import { BRAND } from '../../theme/theme';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.role === 'bot';
  const lines = msg.text.split('\n');

  return (
    <View style={[styles.bubbleRow, isBot ? styles.bubbleRowBot : styles.bubbleRowUser]}>
      {isBot && (
        <View style={styles.botAvatar}>
          <MaterialIcons name="support-agent" size={18} color={BRAND.accent} />
        </View>
      )}
      <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
        {lines.map((line, i) => {
          const isBold = line.startsWith('**') && line.endsWith('**');
          const text = isBold ? line.slice(2, -2) : line;
          if (!text) return <View key={i} style={{ height: 6 }} />;
          return (
            <RNText
              key={i}
              style={[
                styles.bubbleText,
                isBot ? styles.bubbleTextBot : styles.bubbleTextUser,
                isBold && styles.bubbleTextBold,
              ]}
            >
              {text}
            </RNText>
          );
        })}
        <RNText style={[styles.timestamp, !isBot && styles.timestampUser]}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </RNText>
      </View>
    </View>
  );
}

function QuickChips({ chips, onPress }: { chips: string[]; onPress: (chip: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={styles.chip}
          onPress={() => onPress(chip)}
          activeOpacity={0.75}
        >
          <RNText style={styles.chipText}>{chip}</RNText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

interface ClinicPickerProps {
  visible: boolean;
  clinics: Clinic[];
  onSelect: (clinic: Clinic) => void;
  onClose: () => void;
  search: string;
  onSearch: (q: string) => void;
}

function ClinicPicker({ visible, clinics, onSelect, onClose, search, onSearch }: ClinicPickerProps) {
  const filtered = clinics.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.location ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <RNText style={styles.pickerTitle}>Select Channel Partner</RNText>
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={18} color="#5A7A63" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearch}
            placeholder="Search clinics / hospitals..."
            placeholderTextColor="#B0C8B8"
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')}>
              <MaterialIcons name="close" size={18} color="#5A7A63" />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          style={styles.pickerList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.pickerEmpty}>
              <MaterialIcons name="search-off" size={32} color="#C8DFD0" />
              <RNText style={styles.pickerEmptyText}>No clinics found</RNText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => onSelect(item)}
              activeOpacity={0.75}
            >
              <View style={styles.pickerItemIcon}>
                <MaterialIcons name="local-hospital" size={18} color={BRAND.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={styles.pickerItemName}>{item.name}</RNText>
                {item.location ? (
                  <RNText style={styles.pickerItemLoc} numberOfLines={1}>{item.location}</RNText>
                ) : null}
              </View>
              <View style={[
                styles.pickerItemStatus,
                { backgroundColor: item.status === 'ACTIVE' ? '#E8F5EE' : '#FEF3F2' },
              ]}>
                <RNText style={[
                  styles.pickerItemStatusText,
                  { color: item.status === 'ACTIVE' ? BRAND.primary : '#E74C3C' },
                ]}>
                  {item.status ?? 'Active'}
                </RNText>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

export function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const user = useSelector((s: RootState) => s.auth.user);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinicDetail, setClinicDetail] = useState<ClinicDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastChips, setLastChips] = useState<string[]>([]);

  const clinicsResult = useQuery({
    queryKey: ['clinics'],
    queryFn: fetchClinics,
  }) as any;

  const clinics: Clinic[] = clinicsResult.data ?? [];

  useEffect(() => {
    if (user?.name) {
      const greeting = getGreeting(user.name);
      setMessages([greeting]);
      setLastChips(greeting.chips ?? []);
    }
  }, [user?.name]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    if (msg.chips) setLastChips(msg.chips);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const handleSelectClinic = useCallback(async (clinic: Clinic) => {
    setPickerVisible(false);
    setSearchQuery('');
    setSelectedClinic(clinic);
    setLoadingDetail(true);
    addMessage(userMessage(`Tell me about ${clinic.name}`));
    const detail = await fetchClinicForChat(clinic.id);
    setClinicDetail(detail);
    setLoadingDetail(false);
    const response = getClinicSelectedMessage(clinic.name);
    addMessage(response);
  }, [addMessage]);

  const handleSend = useCallback((text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    const um = userMessage(q);
    addMessage(um);
    setTimeout(() => {
      const reply = generateBotResponse(q, {
        clinic: clinicDetail,
        clinicName: selectedClinic?.name,
      });
      addMessage(reply);
    }, 400);
  }, [input, clinicDetail, selectedClinic, addMessage]);

  const handleChip = useCallback((chip: string) => {
    handleSend(chip);
  }, [handleSend]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble msg={item} />
  ), []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Clinic selector bar */}
      <View style={styles.selectorBar}>
        <MaterialIcons name="local-hospital" size={18} color={BRAND.primary} />
        <TouchableOpacity
          style={styles.selectorBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
          <RNText
            style={[styles.selectorText, !selectedClinic && styles.selectorPlaceholder]}
            numberOfLines={1}
          >
            {selectedClinic ? selectedClinic.name : 'Select Channel Partner / Hospital'}
          </RNText>
          <MaterialIcons name="expand-more" size={20} color={BRAND.primary} />
        </TouchableOpacity>
        {selectedClinic && (
          <TouchableOpacity
            onPress={() => {
              setSelectedClinic(null);
              setClinicDetail(null);
            }}
            style={styles.clearBtn}
          >
            <MaterialIcons name="close" size={18} color="#5A7A63" />
          </TouchableOpacity>
        )}
      </View>

      {/* Clinic detail header */}
      {selectedClinic && clinicDetail && (
        <View style={styles.clinicBadge}>
          <View style={styles.clinicBadgeIcon}>
            <MaterialIcons name="verified" size={14} color={BRAND.accent} />
          </View>
          <RNText style={styles.clinicBadgeText} numberOfLines={1}>
            {clinicDetail.name} · {clinicDetail.contactNumber || clinicDetail.email || 'Partner loaded'}
          </RNText>
        </View>
      )}

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Loading indicator */}
      {loadingDetail && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={BRAND.primary} />
          <RNText style={styles.loadingText}>Loading clinic details...</RNText>
        </View>
      )}

      {/* Quick chips */}
      {lastChips.length > 0 && (
        <QuickChips chips={lastChips} onPress={handleChip} />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about this partner..."
          placeholderTextColor="#B0C8B8"
          multiline
          maxLength={400}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <MaterialIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ClinicPicker
        visible={pickerVisible}
        clinics={clinics}
        onSelect={handleSelectClinic}
        onClose={() => {
          setPickerVisible(false);
          setSearchQuery('');
        }}
        search={searchQuery}
        onSearch={setSearchQuery}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2D1E',
  },
  selectorPlaceholder: {
    color: '#5A7A63',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  clinicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#C8DFD0',
  },
  clinicBadgeIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicBadgeText: {
    flex: 1,
    fontSize: 12,
    color: BRAND.primaryDark,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    gap: 12,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '90%',
  },
  bubbleRowBot: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  bubbleRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: BRAND.primary,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bubbleTextBot: {
    color: '#1A2D1E',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextBold: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 10,
    color: '#B0C8B8',
    marginTop: 4,
    fontWeight: '500',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#5A7A63',
    fontStyle: 'italic',
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: BRAND.accent,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: BRAND.primary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0EC',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F7F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A2D1E',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sendBtnDisabled: {
    backgroundColor: '#C8DFD0',
    elevation: 0,
    shadowOpacity: 0,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C8DFD0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A2D1E',
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  pickerEmptyText: {
    fontSize: 14,
    color: '#5A7A63',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  pickerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2D1E',
  },
  pickerItemLoc: {
    fontSize: 12,
    color: '#5A7A63',
    marginTop: 2,
  },
  pickerItemStatus: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pickerItemStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
