import { STATUSES, STATUS_BY_ID, type Issue, type Status } from '@evolve/shared';
import { Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../lib/theme';
import { useAuthStore } from '../../store/auth-store';
import { useIssuesStore } from '../../store/issues-store';

/** Danh sách issue nhóm theo trạng thái (F1). Nhấn giữ một issue để đổi trạng thái. */
export default function IssuesScreen() {
  const { issues, status, error, fetchIssues, setStatus } = useIssuesStore();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    void fetchIssues();
  }, [fetchIssues]);

  const sections = useMemo(
    () =>
      STATUSES.map((s) => ({
        status: s,
        data: issues
          .filter((i) => i.status === s.id)
          .sort((a, b) => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0)),
      })).filter((s) => s.data.length > 0),
    [issues],
  );

  const pickStatus = (issue: Issue) => {
    const options = STATUSES.map((s) => s.name);
    const apply = (index: number) => {
      const next = STATUSES[index]?.id as Status | undefined;
      if (next && next !== issue.status) void setStatus(issue.id, next);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: issue.identifier,
          options: [...options, 'Hủy'],
          cancelButtonIndex: options.length,
        },
        apply,
      );
    } else {
      Alert.alert(issue.identifier, 'Đổi trạng thái', [
        ...STATUSES.map((s, i) => ({ text: s.name, onPress: () => apply(i) })),
        { text: 'Hủy', style: 'cancel' as const },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Issues',
          headerRight: () => (
            <Pressable onPress={() => void logout()} hitSlop={8}>
              <Text style={{ color: colors.primary }}>Đăng xuất</Text>
            </Pressable>
          ),
        }}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => void fetchIssues()}
            tintColor={colors.primary}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: section.status.color }]} />
            <Text style={styles.sectionTitle}>{section.status.name}</Text>
            <Text style={styles.count}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => pickStatus(item)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.card }]}
          >
            <Text style={styles.identifier}>{item.identifier}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.dot, { backgroundColor: STATUS_BY_ID[item.status].color }]} />
          </Pressable>
        )}
        ListEmptyComponent={
          status === 'ready' ? <Text style={styles.empty}>Chưa có issue nào</Text> : undefined
        }
        stickySectionHeadersEnabled
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  sectionTitle: { color: colors.foreground, fontWeight: '600' },
  count: { color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  identifier: { color: colors.muted, fontSize: 12, width: 56 },
  title: { color: colors.foreground, flex: 1, fontSize: 15 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 48 },
  error: { color: colors.danger, padding: 16 },
});
