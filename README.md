# Molaken al-Quran 📖

A React Native Quran recitation app built with Expo that allows users to listen to Quranic verses, record their recitation, and receive evaluation feedback for accurate Tajweed practice.

## Features

- **Quranic Audio Playback**: Listen to authentic Quran recitations with word-by-word highlighting
- **Voice Recording**: Record your own recitation of verses
- **Recitation Evaluation**: Get instant feedback on your Tajweed accuracy
- **Surah Navigation**: Browse through Surahs of the Quran
- **Verse-by-Verse Learning**: Practice individual Ayahs with detailed text and transliteration
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **GraphQL**: Apollo Client for data fetching
- **Audio**: Expo AV for recording and playback
- **UI**: React Native components with custom styling
- **TypeScript**: Full TypeScript support

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mostafaEkbal/molaken-alQuran.git
   cd molaken-alQuran
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

### Running the App

In the output, you'll find options to open the app in a:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Project Structure

```
molaken-alQuran/
├── app/                    # Main app directory (file-based routing)
│   ├── _layout.tsx        # Root layout
│   ├── +not-found.tsx     # 404 page
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx
│       └── index.tsx      # Main Quran screen
├── assets/                # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/            # Reusable components
│   ├── AyahWord.tsx      # Individual word component
│   ├── ModalMenu.tsx     # Navigation menu
│   └── __tests__/        # Component tests
├── constants/             # App constants
│   ├── Colors.ts         # Theme colors
│   ├── GraphqlTypes.ts   # GraphQL type definitions
│   └── Queries.ts        # GraphQL queries and mutations
├── helpers/               # Utility functions
├── hooks/                 # Custom React hooks
└── scripts/               # Build and utility scripts
```

## API Integration

The app integrates with a GraphQL API to fetch:
- Quran text in Arabic
- Transliteration and English meanings
- Audio evaluation for recitation accuracy

## Development

### Code Generation

The project uses GraphQL Code Generator for type-safe queries:

```bash
npm run codegen
```

### Testing

Run tests with:

```bash
npm test
```

### Linting

Check code quality with:

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Quran text and audio provided through integrated APIs
- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
