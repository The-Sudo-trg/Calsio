import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

/**
 * Web fallback for the CALSIO tab bar (headless tabs).
 * Native tabs handle Android/iOS; this keeps web parity for dev previews.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          🏠 Home
        </TabTrigger>
        <TabTrigger name="search" href="/search" style={styles.tab}>
          🔍 Search
        </TabTrigger>
        <TabTrigger name="cart" href="/cart" style={styles.tab}>
          👝 Cart
        </TabTrigger>
        <TabTrigger name="account" href="/account" style={styles.tab}>
          👤 Account
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  tab: {
    padding: 8,
  },
});
