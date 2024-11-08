import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface ModalMenuProps {
    onClose: () => void;
    onSurahSelect: (surah: string) => void;
    onAyahSelect: (ayah: number) => void;
}

const ModalMenu = ({ onClose, onSurahSelect, onAyahSelect }: ModalMenuProps) => {
  const surahs = [
    "الفاتحة",
    "الملك",
    "القلم",
    "الحاقة",
    "المعارج",
    "نوح",
    "الجن",
    "المزمل",
    "المدثر",
  ];
  const ayahs = Array.from({ length: 7 }, (_, i) => i + 1); // Adjust length for ayah count

  return (
    <View style={styles.modalContent}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <FontAwesome name="times" size={24} color="red" />
      </TouchableOpacity>
      <ScrollView horizontal>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سورة</Text>
          {surahs.map((surah, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSurahSelect(surah)}
              style={styles.item}
            >
              <Text style={styles.itemText}>{surah}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الآية</Text>
          {ayahs.map((ayah) => (
            <TouchableOpacity
              key={ayah}
              onPress={() => onAyahSelect(ayah)}
              style={styles.item}
            >
              <Text style={styles.itemText}>{ayah}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: { flex: 1, padding: 20, backgroundColor: "#111" },
  closeButton: { alignSelf: "flex-start", marginBottom: 10 },
  section: { flex: 1, marginHorizontal: 10 },
  sectionTitle: { color: "white", fontSize: 20, marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "gray" },
  itemText: { color: "white" },
});

export default ModalMenu;
