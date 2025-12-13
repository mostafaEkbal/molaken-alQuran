export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  GlobalID: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

/**
 *
 * This represents the verse type where:
 * id: the identifier of the verse
 * text: the arabic text of the verse
 * segments: timing of the words audio segments. For every word the starting millisecond and the end millisencond [[start, end], [start, end], ...]
 * number: the order of the verse in the chapter 1, 2, ...
 * transliteration: the transliteration of the verse text (same pronounciation but in lating letters)
 * meaning: The english translation of the meaning of the verse
 *
 */
export type AyaType = {
  id: Scalars['GlobalID']['output'];
  meaning?: Maybe<Scalars['String']['output']>;
  number: Scalars['Int']['output'];
  segments: Array<Array<Scalars['Int']['output']>>;
  text: Scalars['String']['output'];
  transliteration?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  /**
   *
   * Requests the evaluation of an audio recording:
   * params:
   * ayaId: the identifier of the verse
   * audio: the audio file
   *
   */
  evaluate: EvaluationType;
  /**
   *
   *         request a token that you can use in subsequent requests
   *
   */
  token: Scalars['String']['output'];
};


export type MutationEvaluateArgs = {
  audio: Scalars['Upload']['input'];
  ayaId: Scalars['ID']['input'];
};


export type MutationTokenArgs = {
  canPay: Scalars['Int']['input'];
};

export type Query = {
  /**
   *
   * Gets a verse by chapter number (1-114) and verse number
   * params:
   * number: The order number of the verse
   * soraNumber: The chapter number
   *
   */
  aya: AyaType;
  /**
   *
   * Get all verses of a given chapter(Sora) by a chapter ID
   * params:
   *     soraId: the id of the chapter. You should get it from sorat query
   * returns:
   *     the list of verses that belong to the requested chapter
   *
   */
  ayat: Array<AyaType>;
  /** Get all chapters of Quran */
  sorat: Array<SoraType>;
  version: Scalars['String']['output'];
};


export type QueryAyaArgs = {
  number: Scalars['Int']['input'];
  soraNumber: Scalars['Int']['input'];
};


export type QueryAyatArgs = {
  soraId: Scalars['ID']['input'];
};

/**
 *
 * id: the identifier of the chapter
 * ar: the arabic name of the chapter
 * en: the english name of the chapter
 * ayatCount: number of verses in this chapter
 * number: the order of the chapter (1-114)
 *
 */
export type SoraType = {
  ar: Scalars['String']['output'];
  ayatCount?: Maybe<Scalars['Int']['output']>;
  en?: Maybe<Scalars['String']['output']>;
  id: Scalars['GlobalID']['output'];
  number: Scalars['Int']['output'];
};

/**
 *
 * ratios: the correctness ratios of words pronounced in the recording
 * misPos: positions of letters where the user mispronounced in the verse text
 * startIndex: the index of the word the user started reciting
 * endIndex: the index of the word the user's recitation ended with
 *
 */
export type EvaluationType = {
  endIndex: Scalars['Int']['output'];
  messages: Array<Array<Scalars['String']['output']>>;
  misPos: Array<Array<Scalars['Int']['output']>>;
  ratios: Array<Scalars['Float']['output']>;
  startIndex: Scalars['Int']['output'];
};
