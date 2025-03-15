import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  I18nManager,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Query } from "@/constants/GraphqlTypes";

/**
 * Props for the ModalMenu component.
 * @typedef {Object} ModalMenuProps
 * @property {function} onClose - Function to close the modal.
 * @property {function} onSurahSelect - Function to select a Surah.
 * @property {function} onAyahSelect - Function to select an Ayah.
 * @property {Array} surahs - List of Surahs.
 * @property {Array} ayahs - List of Ayahs.
 * @property {number} currentSurah - Currently selected Surah.
 * @property {number} currentAyah - Currently selected Ayah.
 */
interface ModalMenuProps {
  onClose: () => void;
  onSurahSelect: (surah: number) => void;
  onAyahSelect: (ayah: number) => void;
  surahs: Query["sorat"];
  ayahs: Query["ayat"];
  currentSurah: number;
  currentAyah: number;
}

/**
 * ModalMenu component to display a modal with a list of Surahs and Ayahs.
 * @param {ModalMenuProps} props - Props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ModalMenu = ({
  onClose,
  onSurahSelect,
  onAyahSelect,
  surahs,
  ayahs,
  currentSurah,
  currentAyah,
}: ModalMenuProps): JSX.Element => {
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
                  flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
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
                  flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
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
  modalContent: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#FEFBF4" 
  },
  closeButton: { 
    alignSelf: I18nManager.isRTL ? "flex-start" : "flex-end", 
    marginBottom: 10 
  },
  sectionsContainer: {
    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 15,
    gap: 10,
  },
  section: { 
    marginHorizontal: 10,
    alignItems: I18nManager.isRTL ? "flex-start" : "flex-end",
  },
  sectionTitle: { 
    color: "#795547", 
    fontSize: 20, 
    marginBottom: 10, 
    fontFamily: "Kufi",
    textAlign: I18nManager.isRTL ? "left" : "right", 
  },
  item: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "gray",
    width: "100%", 
  },
  itemText: { 
    color: "#795547", 
    fontSize: 15,
    fontFamily: "Amiri",
    textAlign: I18nManager.isRTL ? "left" : "right", 
  },
});

export default ModalMenu;
