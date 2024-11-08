import { gql } from "@apollo/client";

export const GET_SURAHS = gql`
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

export const GET_AYAT = gql`
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

export const GET_AYAH = gql`
  query GetAyah($ayahId: ID!, $surahId: ID!) {
    aya(id: $ayahId, soraId: $surahId) {
      id
      text
      segments
      number
      transliteration
      meaning
    }
  }
`;
