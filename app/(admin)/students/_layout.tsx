import { Stack } from 'expo-router';

export default function StudentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="student-list" />
      <Stack.Screen name="bulk-import" />
      <Stack.Screen name="class/[classId]" />
    </Stack>
  );
}