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
  ImageBackground,
  TouchableNativeFeedback,
  TouchableHighlight,
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
import MenuIcon from "@/assets/icons/menuIcon";

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
  const [ayahSoundUrl, setAyahSoundUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [soundLoading, setSoundLoading] = useState(false);
  const [soundPosition, setSoundPosition] = useState<number>(0);
  const [isLoadingText, setIsLoadingText] = useState(true);

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

    if (
      ayahEvaluation?.ratios.length ===
      ayahs?.[ayahNumber - 1]?.text.split(" ").length
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

  useEffect(() => {
    const surahNumberForamted = String(surahNumber).padStart(3, "0");
    const ayahNumberForamted = String(ayahNumber).padStart(3, "0");
    setAyahSoundUrl(
      `https://be.ilearnquran.org/media/audio/quran/Husary_64kbps_${surahNumberForamted}${ayahNumberForamted}.mp3`
    );
    setIsPlaying(false);
    setSound(null);
    setSoundLoading(false);
    setCurrentWordIndex(-1);
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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

  const playAyah = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            // Pause and save position
            const currentStatus = await sound.getStatusAsync();
            if (currentStatus.isLoaded) {
              setSoundPosition(currentStatus.positionMillis);
            }
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            // Resume from saved position if not finished
            if (status.didJustFinish) {
              await sound.setPositionAsync(0);
              setSoundPosition(0);
            } else {
              await sound.setPositionAsync(soundPosition);
            }
            await sound.playAsync();
            setIsPlaying(true);
          }
        } else {
          await createAndPlaySound(ayahSoundUrl ?? "");
        }
      } else {
        await createAndPlaySound(ayahSoundUrl ?? "");
      }
    } catch (error) {
      console.error("Error playing/pausing sound:", error);
      setIsPlaying(false);
    }
  };

  const createAndPlaySound = async (url: string) => {
    setSoundLoading(true);
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    setSoundLoading(false);
    setSound(newSound);
    setIsPlaying(true);
    setSoundPosition(0);

    newSound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
        setSoundPosition(0);
      } else if (status.isPlaying) {
        setSoundPosition(status.positionMillis);
        const wordIndex = findCurrentWordIndex(
          status.positionMillis,
          ayahs[ayahNumber - 1].segments
        );
        setCurrentWordIndex(wordIndex);
      }
    });

    return newSound;
  };

  const findCurrentWordIndex = (currentTime: number, segments: number[][]) => {
    for (let i = 0; i < segments.length; i++) {
      const [start, end] = segments[i];
      if (currentTime >= start - 900 && currentTime <= end) {
        return i;
      }
    }
    return -1;
  };

  useEffect(() => {
    setIsLoadingText(true);
    if (!loadingAyat) {
      // Only start timer after ayat loading is complete
      const timer = setTimeout(() => {
        setIsLoadingText(false);
      }, 1000); // 1 second delay after loading

      return () => {
        clearTimeout(timer);
      };
    }
  }, [loadingAyat]); // Add loadingAyat

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/background.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay}>
            <View style={styles.title}>
              <Text style={styles.titleText}>القرآن الكريم</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.menuButton}
              >
                <MenuIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.navBar}>
              <TouchableOpacity
                style={styles.navBarButtonsContainer}
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
                  color={surahNumber === 114 ? "grey" : "#795547"}
                />
              </TouchableOpacity>
              <TouchableNativeFeedback onPress={() => setModalVisible(true)}>
                <Text
                  style={styles.surahTitle}
                >{`${surahName} ${ayahNumber}`}</Text>
              </TouchableNativeFeedback>
              <TouchableOpacity
                style={styles.navBarButtonsContainer}
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
                  color={surahNumber === 1 ? "grey" : "#795547"}
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
                      style={{
                        ...styles.ayahText,
                        transform: [{ scaleX: -1 }],
                      }}
                    >
                      {errorAyat ? (
                        "خطاء فى التحميل"
                      ) : isLoadingText ? (
                        <ActivityIndicator size={60} color={"#795547"} />
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
                              highlight={currentWordIndex === index}
                            />
                          ))
                      )}
                    </Text>
                  </View>
                ))}
              </Animated.ScrollView>
              <View style={styles.ayahNavBar}>
                <TouchableOpacity
                  style={styles.navBarButtonsContainer}
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
                    color={ayahNumber === ayahs?.length ? "grey" : "#795547"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navBarButtonsContainer}
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
                    color={ayahNumber === 1 ? "grey" : "#795547"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={playAyah}
                style={styles.listenButton}
                disabled={soundLoading}
              >
                {soundLoading ? (
                  <ActivityIndicator color={"#795547"} size={35} />
                ) : isPlaying ? (
                  <FontAwesome name="pause" size={35} color="#795547" />
                ) : (
                  <FontAwesome name="volume-up" size={35} color="#795547" />
                )}
              </TouchableOpacity>
              <TouchableHighlight
                underlayColor="#FEFBF4"
                onPressIn={startRecording}
                onPressOut={stopRecording}
                style={[
                  styles.recordButton,
                  isUploading && styles.uploadingButton,
                ]}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#795547" size={35} />
                ) : recording ? (
                  <FontAwesome name="stop" size={35} color="#795547" />
                ) : (
                  <FontAwesome name="microphone" size={35} color="#795547" />
                )}
              </TouchableHighlight>
            </View>

            <Modal
              visible={modalVisible}
              animationType="fade"
              transparent={true}
            >
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
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    color: "#795547",
    fontFamily: "Amiri",
    paddingHorizontal: 10,
  },
  backgroundImage: {
    flex: 1,
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
  },
  title: {
    width: "110%",
    marginHorizontal: "-5%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 20,
    backgroundColor: "#FEFBF4",
    borderRadius: 5,
    boxShadow: "0px 0px 10px #707070",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#795547",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  navBarButtonsContainer: {
    padding: 40,
  },
  surahTitle: { fontSize: 18, fontWeight: "bold", color: "#795547" },
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
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 60,
    gap: 100,
  },
  listenButton: { backgroundColor: "#fff", padding: 15, borderRadius: 50 },
  recordButton: { backgroundColor: "#Fff", padding: 15, borderRadius: 50 },
  menuButton: {},
  modalContainer: { flex: 1, backgroundColor: "#333" },
  ayahContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: -20,
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
  },
});

export default AyahScreen;
