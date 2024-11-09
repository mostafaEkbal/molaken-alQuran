import { gql } from "@apollo/client";

export const GET_AYAH = gql`
  query GetAyah($number: Int!, $soraNumber: Int!) {
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
  query GetAyat($soraId: ID!) {
    ayat(soraId: $soraId) {
      id
      text
      segments
      number
      transliteration
      meaning
    }
  }
`;