import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ModalMenu from "@/components/ModalMenu";
import { gql, useQuery } from "@apollo/client";

const GET_AYAH = gql`
  query GetAyah($number: ID!, $soraNumber: ID!) {
    aya(number: $number, soraNumber: $soraNumber) {
      id
      text
      segments
      number
      transliteration
      meaning
    }
  }
`;

const GET_SURAHS = gql`
  query GetSurahs {
    sorat {
      id
      ar
      en
      ayatCount
      number
    }
  }
`;

const GET_AYAT = gql`
  query GetAyat($surahId: ID!) {
    ayat(soraId: $surahId) {
      id
      text
      segments
      number
      transliteration
      meaning
    }
  }
`;

const AyahScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [surahName, setSurahName] = useState("الفاتحة");
  const [ayahNumber, setAyahNumber] = useState(1);
  const ayahText = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

  const {
    loading: loadingAyah,
    error: errorAyah,
    data: dataAyah,
  } = useQuery(GET_AYAH, {
    variables: { number: 1, soraNumber: 1 },
  });
  const {
    loading: loadingSurahs,
    error: errorSurahs,
    data: dataSurahs,
  } = useQuery(GET_SURAHS);
  const {
    loading: loadingAyat,
    error: errorAyat,
    data: dataAyat,
  } = useQuery(GET_AYAT, {
    variables: { surahId: 1 },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => {
              /* Previous Surah Logic */
            }}
          >
            <FontAwesome name="angle-double-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.surahTitle}>{`${surahName} ${ayahNumber}`}</Text>
          <TouchableOpacity
            onPress={() => {
              /* Next Surah Logic */
            }}
          >
            <FontAwesome name="angle-double-right" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {/* Ayah Display */}
        <Text style={styles.ayahText}>{ayahText}</Text>
        {/* Bottom Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => {
              /* Listen Logic */
            }}
            style={styles.listenButton}
          >
            <FontAwesome name="volume-up" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              /* Record Logic */
            }}
            style={styles.recordButton}
          >
            <FontAwesome name="microphone" size={30} color="red" />
          </TouchableOpacity>
        </View>
        {/* Modal Trigger */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.menuButton}
        >
          <FontAwesome name="bars" size={30} color="black" />
        </TouchableOpacity>
        {/* Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <ModalMenu
              onClose={() => setModalVisible(false)}
              onSurahSelect={(selectedSurah) => {
                setSurahName(selectedSurah);
                setModalVisible(false);
              }}
              onAyahSelect={(selectedAyah) => {
                setAyahNumber(selectedAyah);
                setModalVisible(false);
              }}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f4f8" },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  surahTitle: { fontSize: 18, fontWeight: "bold" },
  ayahText: {
    fontSize: 28,
    textAlign: "center",
    marginVertical: 40,
    lineHeight: 50,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  listenButton: { backgroundColor: "#e0e0e0", padding: 10, borderRadius: 50 },
  recordButton: { backgroundColor: "#ffdada", padding: 10, borderRadius: 50 },
  menuButton: { position: "absolute", right: 20, bottom: 30 },
  modalContainer: { flex: 1, backgroundColor: "#333", padding: 20 },
});

export default AyahScreen;
