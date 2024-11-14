import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IAyahWordProps {
  word: string;
  percentage?: number;
}

const AyahWord = ({ word, percentage }: IAyahWordProps) => {
  const handleBakgroundColor = (percentage: number) => {
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
      <Text style={styles.ayahText}>{word}</Text>
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
    margin: 70
  },
  ayahText: {
    fontSize: 28,// Replace with your font
    textAlign: "right",
    color: "#000",
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
