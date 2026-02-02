import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function ManageAccount() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Manage Account</Text>
      </View>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Business Name</Text>
        <Text style={styles.value}>Mondiguing Woodcraft</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>mondiguing@gmail.com</Text>

        <Text style={styles.label}>Account Type</Text>
        <Text style={styles.value}>Business</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.dangerButton}>
          <Text style={styles.dangerText}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerText: {
    color: "#d11a2a",
    fontSize: 16,
    fontWeight: "600",
  },
});
