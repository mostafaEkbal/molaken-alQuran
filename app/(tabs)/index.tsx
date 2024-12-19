/**
 * @component AyahScreen
 * @description Main screen component for displaying and interacting with Quranic verses (Ayat).
 *
 * @state {boolean} modalVisible - Controls visibility of the selection modal
 * @state {number} surahNumber - Current Surah (chapter) number being displayed
 * @state {number} ayahNumber - Current Ayah (verse) number being displayed
 * @state {string} surahName - Name of current Surah in Arabic
 * @state {Query["sorat"]} surahs - List of all Surahs
 * @state {Query["ayat"][]} ayahs - List of Ayat in current Surah
 * @state {Audio.Recording | null} recording - Current audio recording instance
 * @state {boolean} isUploading - Flag for audio upload status
 * @state {EvaluationType | null} ayahEvaluation - Evaluation results of recorded Ayah
 * @state {number | null} ayahUploadedId - ID of last uploaded Ayah recording
 * @state {string | null} ayahSoundUrl - URL of Ayah audio file
 * @state {Audio.Sound | null} sound - Audio player instance
 * @state {boolean} isPlaying - Flag for audio playback status
 * @state {number} currentWordIndex - Index of currently highlighted word during playback
 * @state {boolean} soundLoading - Flag for audio loading status
 * @state {number} soundPosition - Current position in audio playback
 * @state {boolean} isLoadingText - Flag for text loading status
 *
 * @queries
 * - GET_AYAH: Fetches single Ayah details
 * - GET_SURAHS: Fetches list of all Surahs
 * - GET_AYAT: Fetches all Ayat for a Surah
 *
 * @effects
 * - Updates surah name based on current surah number
 * - Initializes surahs list from API data
 * - Initializes and sorts ayah data when it becomes available
 * - Handles scrolling to the correct ayah when ayah number changes
 * - Handles automatic progression after perfect recitation
 * - Initializes audio permissions and settings on component mount
 * - Manages audio URL and playback state updates
 * - Handles sound resource cleanup
 * - Controls loading state for Ayah text with delay
 *
 * @features
 * - Audio playback of Quranic verses
 * - Voice recording and evaluation
 * - Navigation between Surahs and Ayat
 * - Word-by-word highlighting during playback
 * - Modal menu for quick navigation
 * - Progress tracking for recitation
 *
 * @functions
 * - startRecording(): Initiates audio recording
 * - stopRecording(): Stops recording and uploads for evaluation
 * - playAyah(): Handles audio playback control
 * - handleAyahEvaluationChange(): Processes evaluation results
 * - createAndPlaySound(): Creates and manages audio playback
 * - findCurrentWordIndex(): Determines current word during playback
 *
 * @style
 * - Uses custom styling for Arabic text display and UI components
 * - Implements responsive design with window dimensions
 * - Features background image and overlay components
 *
 * @dependencies
 * - React Native
 * - Expo Audio
 * - Apollo Client
 * - React Native Safe Area Context
 *
 * @note
 * - This component is designed for Islamic Quranic Tutoring applications
 * - Handles both Arabic text display and audio interactions
 */
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

  /**
   * Updates surah name based on current surah number
   * @effect
   * @description Finds surah by number in dataSurahs and updates surah name state
   * @param {Object} dataSurahs - Object containing list of surahs from API
   * @param {number} surahNumber - Current surah number to find
   * @sideEffect Updates surahName state with Arabic name of found surah
   * @dependencies [surahNumber, ayahNumber]
   * @requires dataSurahs.sorat - Array of surah objects with {number, ar} properties
   */
  useEffect(() => {
    if (dataSurahs) {
      const surah = dataSurahs.sorat.find((s) => s.number === surahNumber);
      if (surah) {
        setSurahName(surah.ar);
      }
    }
  }, [surahNumber, ayahNumber]);

  /**
   * Initializes surahs list from API data
   * @effect
   * @description Updates surahs state when API data becomes available
   * @param {Object} dataSurahs - Object containing list of surahs from API
   * @sideEffect Sets surahs state with complete list from API
   * @dependencies [dataSurahs]
   * @requires dataSurahs.sorat - Array of surah objects
   */
  useEffect(() => {
    if (dataSurahs) {
      setSurahs(dataSurahs.sorat);
    }
  }, [dataSurahs]);

  /**
   * Initializes and sorts ayah data when it becomes available
   * @effect
   * @dependency {Object} dataAyat - The ayat data from an external source
   * @description Sorts ayat by number and updates the ayahs state when data loads
   */
  useEffect(() => {
    if (dataAyat) {
      setAyahs([...dataAyat.ayat].sort((a, b) => a.number - b.number));
    }
  }, [dataAyat]);

  /**
   * Handles scrolling to the correct ayah when ayah number changes
   * @effect
   * @dependency {number} ayahNumber - The current ayah number
   * @description Scrolls the ScrollView horizontally to show the current ayah
   * taking into account window width and spacing between ayahs
   * @requires scrollViewRef - Reference to the ScrollView component
   */
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (ayahNumber - 1) * windowWidth - 20 * (ayahNumber - 1),
        animated: true,
      });
    }
  }, [ayahNumber]);

  /**
   * Handles automatic progression after perfect recitation
   * @effect
   * @dependency {Object} ayahEvaluation - The evaluation results for current ayah
   * @description Checks if evaluation ratios match number of words in current ayah
   * and advances to next ayah if all ratios indicate perfect recitation (>= 1)
   * @requires ayahs - Array of ayah objects containing text
   */
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

  /**
   * Initializes audio permissions and settings on component mount
   * @effect
   * @async
   * @description Requests microphone permissions and configures iOS audio settings
   * @requires Audio from expo-av
   * @sideEffect Sets up audio recording and playback mode for iOS
   * @dependencies [] - Runs once on mount
   */
  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  /**
   * Manages audio URL and playback state updates
   * @effect
   * @description Updates audio source URL when surah or ayah changes
   * @param {number} surahNumber - Current surah number
   * @param {number} ayahNumber - Current ayah number
   * @sideEffect Resets all audio playback states
   * @dependencies [surahNumber, ayahNumber]
   */
  useEffect(() => {
    const surahNumberFormated = String(surahNumber).padStart(3, "0");
    const ayahNumberFormated = String(ayahNumber).padStart(3, "0");
    setAyahSoundUrl(
      `https://be.ilearnquran.org/media/audio/quran/Husary_64kbps_${surahNumberFormated}${ayahNumberFormated}.mp3`
    );
    setIsPlaying(false);
    setSound(null);
    setSoundLoading(false);
    setCurrentWordIndex(-1);
  }, [surahNumber, ayahNumber]);

  /**
   * Handles sound resource cleanup
   * @effect
   * @description Unloads audio resources when sound object changes or component unmounts
   * @param {Audio.Sound} sound - Current sound object
   * @cleanup Unloads audio async
   * @dependencies [sound]
   */
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  /**
   * Controls loading state for Ayah text with delay.
   * @effect
   * @description Sets loading state to true initially, adds 1 second delay after ayat loading completes before showing text, and cleans up timer on unmount.
   * @param {boolean} loadingAyat - Loading state of Ayat data.
   * @sideEffect Updates isLoadingText state to control text loading indicator.
   * @dependencies [loadingAyat]
   */
  useEffect(() => {
    setIsLoadingText(true);
    if (!loadingAyat) {
      const timer = setTimeout(() => {
        setIsLoadingText(false);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [loadingAyat]);

  /**
   * Initiates an audio recording session with high quality settings.
   *
   * @async
   * @function startRecording
   * @throws {Error} If recording initialization or start fails
   * @returns {Promise<void>}
   *
   * Uses Expo's Audio.Recording API to:
   * 1. Create a new recording instance
   * 2. Prepare recording with high quality preset
   * 3. Start the recording
   * 4. Update recording state
   */
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

  /**
   * Stops the current recording, uploads it to the server, and evaluates the recitation.
   *
   * @async
   * @function stopRecording
   *
   * @throws {Error} When upload fails or server returns an error
   *
   * @description
   * This function performs the following steps:
   * 1. Stops and unloads the current recording
   * 2. Creates a FormData object with the recording and GraphQL operation details
   * 3. Uploads the audio file to the server for evaluation
   * 4. Updates the state with evaluation results
   *
   * @example
   * await stopRecording();
   *
   * @returns {Promise<void>}
   *
   * @affects {recording} - Sets to null after successful upload
   * @affects {isUploading} - Toggles during upload process
   * @affects {ayahEvaluation} - Updates with server response
   * @affects {ayahUploadedId} - Updates with current ayah ID
   * @affects {uploadError} - Sets error message on failure
   */
  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsUploading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const formData = new FormData();

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

      formData.append(
        "map",
        JSON.stringify({
          "1": ["variables.audio"],
        })
      );

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
      setRecording(null);
      Alert.alert("خطأ فى الإرسال", "خطأ فى إرسال الملف, حاول مرة أخرى.", [
        {
          text: "المتابعة",
        },
      ]);
    }
  };

  /**
   * Handles evaluation changes for a specific word in an Ayah (Quranic verse).
   *
   * @param wordIndex - The index of the word being evaluated within the Ayah
   * @param ayahId - The unique identifier of the Ayah being evaluated
   * @returns The evaluation ratio for the specified word index if all conditions are met, otherwise undefined
   *
   * Conditions for returning evaluation ratio:
   * - The ayahId must match the currently uploaded Ayah ID
   * - AyahEvaluation must exist
   * - The wordIndex must be within the evaluation range (between startIndex and endIndex)
   */
  const handleAyahEvaluationChange = (wordIndex: number, ayahId: number) => {
    if (ayahId !== ayahUploadedId) return;
    if (!ayahEvaluation) return;
    if (ayahEvaluation.startIndex > wordIndex) return;
    if (ayahEvaluation.endIndex - 1 < wordIndex) return;
    return ayahEvaluation?.ratios[wordIndex];
  };

  /**
   * Controls the playback of an Ayah (Quranic verse) audio.
   *
   * This function handles the following audio playback scenarios:
   * - Pausing currently playing audio and saving the position
   * - Resuming audio from the saved position
   * - Starting playback from beginning if audio just finished
   * - Creating and playing new audio if none exists
   *
   * @throws {Error} When there's an issue with audio playback operations
   *
   * @requires sound - Audio.Sound object for playback control
   * @requires ayahSoundUrl - URL string for the audio source
   * @requires soundPosition - Stored position in milliseconds for resume functionality
   *
   * @affects {isPlaying} - State boolean indicating if audio is currently playing
   * @affects {soundPosition} - State number storing current position in audio
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Creates and plays an audio sound from a given URL with playback status tracking.
   *
   * @param url - The URL of the audio file to be played
   * @returns Promise<Audio.Sound> - Returns the newly created sound object
   *
   * The function:
   * - Creates a new audio instance from the provided URL
   * - Updates loading and playing states
   * - Sets up playback status monitoring to:
   *   - Track playback position
   *   - Update current word highlighting based on timestamp
   *   - Handle playback completion
   * - Manages state for sound position and word index tracking
   *
   * @throws May throw errors related to audio loading or playback
   */
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

  /**
   * Finds the index of the current word based on the given time and segments array.
   *
   * @param currentTime - The current time position in milliseconds
   * @param segments - An array of number tuples representing time segments [start, end]
   * @returns The index of the current word segment, or -1 if no matching segment is found
   *
   * @example
   * const segments = [[0, 1000], [1100, 2000], [2100, 3000]];
   * const currentIndex = findCurrentWordIndex(1500, segments); // Returns 1
   */
  const findCurrentWordIndex = (currentTime: number, segments: number[][]) => {
    for (let i = 0; i < segments.length; i++) {
      const [start, end] = segments[i];
      if (currentTime >= start - 900 && currentTime <= end) {
        return i;
      }
    }
    return -1;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/background.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay}>
            <View style={styles.title}>
              <Text style={styles.titleText}>ملقن القرآن الذكى</Text>
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
                <View style={{paddingInline: 10}}>
                  <Text style={styles.surahTitle}>{`${surahName}`}</Text>
                </View>
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
                <TouchableNativeFeedback onPress={() => setModalVisible(true)}>
                  <View style={{paddingInline: 10}}>
                    <Text style={styles.surahTitle}>{`${ayahNumber}`}</Text>
                  </View>
                </TouchableNativeFeedback>
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
                style={{
                  ...styles.listenButton,
                  backgroundColor: !isPlaying
                    ? "rgba(255, 255, 255, .0)"
                    : "rgba(255, 255, 255, .6)",
                }}
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
                  {backgroundColor: recording && !isUploading ? "rgba(255, 255, 255, .6)" : "rgba(255, 255, 255, .0)"},
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
    backgroundColor: "rgba(254, 251, 244, .4)",
    borderRadius: 5,
    // boxShadow: "0px 0px 1px #707070",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#604030",
    marginRight: 50,
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
  surahTitle: { fontSize: 22, fontFamily: "Kufi", color: "#795547" },
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
  listenButton: {
    backgroundColor: "rgba(255, 255, 255, .0)",
    padding: 15,
    borderRadius: 50,
  },
  recordButton: {
    backgroundColor: "rgba(255, 255, 255, .0)",
    padding: 15,
    borderRadius: 50,
  },
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
