import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ModalMenu from "@/components/ModalMenu";
import { gql, QueryRef, useQuery } from "@apollo/client";
import {
  AyaType,
  Query,
  QueryAyaArgs,
  QueryAyatArgs,
} from "@/constants/GraphqlTypes";
import { GET_AYAH, GET_AYAT, GET_SURAHS } from "@/constants/Queries";

const { width: windowWidth } = Dimensions.get("window");

const AyahScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahNumber, setAyahNumber] = useState(1);
  const [surahName, setSurahName] = useState("الفاتحة");
  const [surahs, setSurahs] = useState<Query["sorat"]>();
  const [ayahs, setAyahs] = useState<Query["ayat"]>([]);
  const scrollX = new Animated.Value(0);

  const scrollViewRef = useRef<ScrollView>(null);

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

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (ayahNumber - 1) * windowWidth - 20 * (ayahNumber - 1),
        animated: true,
      });
    }
  }, [ayahNumber]);

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
              setAyahNumber(1);
            }}
          >
            <FontAwesome
              name="angle-double-left"
              size={24}
              color={surahNumber === 114 ? "grey" : "black"}
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
              setAyahNumber(1);
            }}
          >
            <FontAwesome
              name="angle-double-right"
              size={24}
              color={surahNumber === 1 ? "grey" : "black"}
            />
          </TouchableOpacity>
        </View>
        {/* Ayah Display */}
        <View style={styles.ayahContainer}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            style={{ transform: [{ scaleX: -1 }] }}
            contentContainerStyle={{ width: windowWidth * ayahs.length }}
            onMomentumScrollEnd={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;
              const offset = contentOffset.x;
              let index = Math.ceil(offset / windowWidth);
              const isNearEnd =
                Math.abs(
                  contentSize.width -
                    (layoutMeasurement.width + contentOffset.x)
                ) < 1;

              if (offset > 7400 && index < ayahs.length - 1) index++;
              if (offset > 14800 && index < ayahs.length - 1) index++;

              if (index >= ayahs.length - 1 || isNearEnd) {
                console.log("index", index, "ayahs", ayahs.length);
                // At the end of scroll, set to last ayah
                setAyahNumber(ayahs.length );
              } else if (index >= 0 && index < ayahs.length) {
                // Normal scroll position
                setAyahNumber(ayahs[index].number);
              }
            }}
          >
            {ayahs.map((ayah, index) => (
              <View
                style={[
                  styles.ayahContainer,
                  {
                    width: windowWidth,
                    transform: [{ translateX: -20 * index }],
                  },
                ]}
                key={ayah.number}
              >
                <Text
                  style={{ ...styles.ayahText, transform: [{ scaleX: -1 }] }}
                >
                  {loadingAyat ? "تحميل..." : ayah.text}
                </Text>
              </View>
            ))}
          </Animated.ScrollView>
        </View>
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
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f4f8",
    justifyContent: "space-between",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  surahTitle: { fontSize: 18, fontWeight: "bold" },
  ayahText: {
    fontSize: 24,
    textAlign: "center",
    width: windowWidth - 40,
    paddingRight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 30,
  },
  listenButton: { backgroundColor: "#e0e0e0", padding: 10, borderRadius: 50 },
  recordButton: { backgroundColor: "#ffdada", padding: 10, borderRadius: 50 },
  menuButton: { position: "absolute", right: 20, bottom: 30 },
  modalContainer: { flex: 1, backgroundColor: "#333", padding: 20 },
  ayahContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  flatList: {
    width: windowWidth,
  },
  ayahItemContainer: {
    width: windowWidth,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});

export default AyahScreen;
