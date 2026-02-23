import { StyleSheet, View } from "react-native";

export default function TabOneScreen() {
  return <View style={styles.container} testID="black-screen" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
