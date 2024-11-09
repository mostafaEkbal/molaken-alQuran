import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ModalMenu from "@/components/ModalMenu";
import { gql, useQuery } from "@apollo/client";
import { Query, QueryAyaArgs, QueryAyatArgs } from "@/constants/GraphqlTypes";
import { GET_AYAH, GET_AYAT, GET_SURAHS } from "@/constants/Queries";

const AyahScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahNumber, setAyahNumber] = useState(1);
  const [surahName, setSurahName] = useState("الفاتحة");
  const [surahs, setSurahs] = useState<Query["sorat"]>();
  const [ayahs, setAyahs] = useState<Query["ayat"]>();

  const {
    loading: loadingAyah,
    error: errorAyah,
    data: dataAyah,
  } = useQuery<Query, QueryAyaArgs>(GET_AYAH, {
    variables: { number: ayahNumber, soraNumber: surahNumber },
  });
  const {
    loading: loadingSurahs,
    error: errorSurahs,
    data: dataSurahs,
  } = useQuery<Query>(GET_SURAHS);
  const {
    loading: loadingAyat,
    error: errorAyat,
    data: dataAyat,
  } = useQuery<Query, QueryAyatArgs>(GET_AYAT, {
    variables: { soraId: `${surahNumber}` },
  });

  useEffect(() => {
    if (dataSurahs) {
      const surah = dataSurahs.sorat.find((s) => s.number === surahNumber);
      if (surah) {
        setSurahName(surah.ar);
      }
    }
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
    if (dataSurahs) {
      setSurahs(dataSurahs.sorat);
    }
  }, [dataSurahs]);

  useEffect(() => {
    if (dataAyat) {
      setAyahs([...dataAyat.ayat].sort((a, b) => a.number - b.number));
    }
  }, [dataAyat]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => {
              /* Next Surah Logic */
              setSurahNumber((prev) => {
                if (prev === 1) return surahs?.[1].number || prev;
                if (prev === 114) return prev;
                return prev + 1;
              });
            }}
          >
            <FontAwesome
              name="angle-double-left"
              size={24}
              color="black"
              disabled
            />
          </TouchableOpacity>
          <Text style={styles.surahTitle}>{`${surahName} ${ayahNumber}`}</Text>
          <TouchableOpacity
            onPress={() => {
              /* Previous Surah Logic */
              setSurahNumber((prev) => {
                if (prev === 1) return prev;
                if (prev === 67) return surahs?.[0].number || prev;
                return prev - 1;
              });
            }}
          >
            <FontAwesome name="angle-double-right" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {/* Ayah Display */}
        <Text style={styles.ayahText}>
          {loadingAyat || errorAyat? "تحميل ..." :  ayahs?.[ayahNumber - 1]?.text}
        </Text>
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
                setSurahNumber(selectedSurah);
                setAyahNumber(1);
                setModalVisible(false);
              }}
              onAyahSelect={(selectedAyah) => {
                setAyahNumber(selectedAyah);
                setModalVisible(false);
              }}
              surahs={surahs || []}
              ayahs={ayahs || []}
              currentAyah={ayahNumber}
              currentSurah={surahNumber}
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
