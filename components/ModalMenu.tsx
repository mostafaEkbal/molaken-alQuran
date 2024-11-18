import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Query } from "@/constants/GraphqlTypes";

interface ModalMenuProps {
  onClose: () => void;
  onSurahSelect: (surah: number) => void;
  onAyahSelect: (ayah: number) => void;
  surahs: Query["sorat"];
  ayahs: Query["ayat"];
  currentSurah: number;
  currentAyah: number;
}

const ModalMenu = ({
  onClose,
  onSurahSelect,
  onAyahSelect,
  surahs,
  ayahs,
  currentSurah,
  currentAyah,
}: ModalMenuProps) => {

  return (
    <View style={styles.modalContent}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <FontAwesome name="times" size={28} color="#795547" />
      </TouchableOpacity>
      <View style={styles.sectionsContainer}>
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الآية</Text>
            {ayahs.map((ayah) => (
              <TouchableOpacity
                key={ayah.id}
                onPress={() => onAyahSelect(ayah.number)}
                style={{
                  ...styles.item,
                  borderRightWidth: 2.5,
                  borderRightColor:
                    ayah.number === currentAyah ? "gray" : "transparent",
                }}
              >
                <Text style={styles.itemText}>{ayah.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>سورة</Text>
            {surahs.map((surah, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSurahSelect(surah.number)}
                style={{
                  ...styles.item,
                  borderRightWidth: 2.5,
                  borderRightColor:
                    surah.number === currentSurah ? "gray" : "transparent",
                }}
              >
                <Text style={styles.itemText}>{surah.ar}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: { flex: 1, padding: 20, backgroundColor: "#FEFBF4" },
  closeButton: { alignSelf: "flex-end", marginBottom: 10 },
  sectionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    gap: 10,
  },
  section: { marginHorizontal: 10 },
  sectionTitle: { color: "white", fontSize: 20, marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "gray" },
  itemText: { color: "#795547", fontSize: 15 },
});

export default ModalMenu;
