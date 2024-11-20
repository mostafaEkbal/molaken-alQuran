import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Props for the AyahWord component.
 * @typedef {Object} IAyahWordProps
 * @property {string} word - The word to display.
 * @property {number} [percentage] - The percentage to display.
 * @property {boolean} [highlight] - Whether to highlight the word.
 */
interface IAyahWordProps {
  word: string;
  percentage?: number;
  highlight?: boolean;
}

/**
 * AyahWord component to display a word with optional percentage and highlight.
 * @param {IAyahWordProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const AyahWord = ({ word, percentage, highlight }: IAyahWordProps): JSX.Element => {
  /**
   * Determines the background color based on the percentage.
   * @param {number} percentage - The percentage to determine the color.
   * @returns {Object} The style object with color and backgroundColor.
   */
  const handleBakgroundColor = (percentage: number): { color: string; backgroundColor: string } => {
    if (percentage === 1) {
      return { color: "white", backgroundColor: "rgb(76,175,80)" };
    } else if (percentage > 0.9) {
      return { color: "black", backgroundColor: "#ffcc80" };
    } else if (percentage > 0.7) {
      return { color: "white", backgroundColor: "#fb8c00" };
    } else {
      return { color: "white", backgroundColor: "rgb(176,0,32)" };
    }
  };

  return (
    <View style={styles.ayahWord}>
      <Text style={{ ...styles.ayahText, color: highlight ? "red" : "#795547" }}>
        {word}
      </Text>
      {percentage && (
        <View
          style={{
            ...styles.wordPercentageContainer,
            backgroundColor: handleBakgroundColor(percentage).backgroundColor,
          }}
        >
          <Text
            style={{
              ...styles.wordPercentage,
              color: handleBakgroundColor(percentage).color,
            }}
          >
            {(percentage * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ayahWord: {
    transform: [{ scaleX: -1 }],
    padding: 3,
    flex: 1,
    height: 72,
    margin: 70,
  },
  ayahText: {
    fontSize: 28, // Replace with your font
    textAlign: "right",
    color: "#795547",
    fontFamily: "Amiri",
  },
  wordPercentageContainer: {
    borderRadius: 5,
    padding: 2,
    margin: "auto",
    marginTop: 2,
  },
  wordPercentage: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default AyahWord;
