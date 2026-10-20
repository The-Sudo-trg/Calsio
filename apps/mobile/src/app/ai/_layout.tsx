import { Stack } from 'expo-router';

/** AI routes render inside a Stack on top of the tab navigator. */
export default function AiLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
