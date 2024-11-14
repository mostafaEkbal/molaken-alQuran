import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ModalMenu from "@/components/ModalMenu";
import { useQuery } from "@apollo/client";
import {
  Query,
  QueryAyaArgs,
  QueryAyatArgs,
  EvaluationType,
} from "@/constants/GraphqlTypes";
import { GET_AYAH, GET_AYAT, GET_SURAHS } from "@/constants/Queries";
import { Audio } from "expo-av";
import AyahWord from "@/components/AyahWord";

const { width: windowWidth } = Dimensions.get("window");

const AyahScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahNumber, setAyahNumber] = useState(1);
  const [surahName, setSurahName] = useState("الفاتحة");
  const [surahs, setSurahs] = useState<Query["sorat"]>();
  const [ayahs, setAyahs] = useState<Query["ayat"]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ayahEvaluation, setAyahEvaluation] = useState<EvaluationType | null>(
    null
  );
  const [ayahUploadedId, setAyahUploadedId] = useState<number | null>(null);

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
    previousData: previousAyatData,
  } = useQuery<Query, QueryAyatArgs>(GET_AYAT, {
    variables: { soraId: `${surahNumber}` },
    fetchPolicy: "cache-and-network",
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

  useEffect(() => {
    if (!ayahEvaluation) return;
    debugger; 
    if (
      ayahEvaluation?.ratios.length === ayahs?.[ayahNumber - 1]?.text.split(" ").length
    ) {
      const isPerfect = ayahEvaluation.ratios.every((ratio) => ratio >= 1);
      setAyahNumber((prev) => (isPerfect ? prev + 1 : prev));
    }
  }, [ayahEvaluation, ayahs]);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsUploading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const formData = new FormData();

      // Add operations with exact structure
      formData.append(
        "operations",
        JSON.stringify({
          operationName: "Evaluate",
          variables: {
            audio: null,
            ayaId: dataAyah?.aya.id,
          },
          query:
            "mutation Evaluate($audio: Upload!, $ayaId: ID!) { evaluate(audio: $audio, ayaId: $ayaId) { ratios misPos startIndex endIndex __typename } }",
        })
      );

      // Add map matching postman format
      formData.append(
        "map",
        JSON.stringify({
          "1": ["variables.audio"],
        })
      );

      // Create RN-compatible file object
      formData.append("1", {
        uri: uri,
        type: "audio/webm",
        name: "recording.webm",
      } as any);

      const result = await fetch("https://be.ilearnquran.org/graphql", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await result.json();
      setRecording(null);
      setIsUploading(false);
      setAyahEvaluation(data.data.evaluate);
      setAyahUploadedId(dataAyah?.aya.id);
    } catch (err) {
      setIsUploading(false);
      setUploadError("Failed to upload recording");
      setRecording(null);
      Alert.alert("خطأ فى الإرسال", "خطأ فى إرسال الملف, حاول مرة أخرى.", [
        {
          text: "المتابعة",
          onPress: () => setUploadError(null),
        },
      ]);
    }
  };

  const handleAyahEvaluationChange = (wordIndex: number, ayahId: number) => {
    if (ayahId !== ayahUploadedId) return;
    if (!ayahEvaluation) return;
    if (ayahEvaluation.startIndex > wordIndex) return;
    if (ayahEvaluation.endIndex - 1 < wordIndex) return;
    return ayahEvaluation?.ratios[wordIndex];
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => {
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
        <View style={styles.ayahNavBar}>
          <TouchableOpacity
            onPress={() => {
              setAyahNumber((prev) => {
                if (prev === ayahs?.length) return prev;
                return prev + 1;
              });
            }}
          >
            <FontAwesome
              name="angle-left"
              size={24}
              color={ayahNumber === ayahs?.length ? "grey" : "black"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setAyahNumber((prev) => {
                if (prev === 1) return prev;
                return prev - 1;
              });
            }}
          >
            <FontAwesome
              name="angle-right"
              size={24}
              color={ayahNumber === 1 ? "grey" : "black"}
            />
          </TouchableOpacity>
        </View>
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
                setAyahNumber(ayahs.length);
              } else if (index >= 0 && index < ayahs.length) {
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
                  {errorAyat ? (
                    "خطاء فى التحميل"
                  ) : loadingAyat ? (
                    <ActivityIndicator size={50} />
                  ) : (
                    ayah.text
                      .split(" ")
                      .map((word, index) => (
                        <AyahWord
                          key={`${ayah.number}-${index}`}
                          word={` ${word}`}
                          percentage={handleAyahEvaluationChange(
                            index,
                            ayah.id
                          )}
                        />
                      ))
                  )}
                </Text>
              </View>
            ))}
          </Animated.ScrollView>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => {}} style={styles.listenButton}>
            <FontAwesome name="volume-up" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={[styles.recordButton, isUploading && styles.uploadingButton]}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="red" size={30} />
            ) : recording ? (
              <FontAwesome name="stop" size={30} color="red" />
            ) : (
              <FontAwesome name="microphone" size={30} color="red" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.menuButton}
        >
          <FontAwesome name="bars" size={30} color="black" />
        </TouchableOpacity>
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  surahTitle: { fontSize: 18, fontWeight: "bold" },
  ayahText: {
    fontSize: 24,
    textAlign: "center",
    width: windowWidth - 40,
    marginRight: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
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
    alignItems: "center",
    alignContent: "center",
  },
  flatList: {
    width: windowWidth,
  },
  ayahItemContainer: {
    width: windowWidth,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  uploadingButton: {
    opacity: 0.7,
  },
  ayahNavBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    // marginTop: 10,
  },
});

export default AyahScreen;
