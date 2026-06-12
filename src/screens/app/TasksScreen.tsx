import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '../../theme/theme';
import { Task } from '../../types/auth';
import { SectionCard } from '../../components/SectionCard';

const tasks: Task[] = [
  { id: '1', title: 'Approve clinic settlement', dueDate: 'Today', progress: 65 },
  { id: '2', title: 'Validate patient documents', dueDate: 'Tomorrow', progress: 40 },
  { id: '3', title: 'Review agreement drafts', dueDate: 'In 2 days', progress: 20 },
];

export function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text variant="header" marginBottom="md">
        Tasks
      </Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard title={item.title} subtitle={`Due ${item.dueDate}`}>
            <Text variant="secondary">Progress: {item.progress}%</Text>
          </SectionCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 24,
  },
});
