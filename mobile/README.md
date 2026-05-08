# Mobile (Expo)

## Tech Stack
- Expo (React Native)
- Uses backend API via `API_BASE_URL`

## Requirements
- macOS with Xcode (for iOS Simulator)
- Node 18+
- Expo CLI (via `npx expo`)

## Setup
### 1) Install Xcode
1. Install Xcode from the Mac App Store.
2. Open Xcode once to finish installation.
3. In Terminal, install command line tools:
```bash
xcode-select --install
```

### 2) Install dependencies
```bash
cd mobile
npm install
```

### 3) Set API URL
Create `mobile/.env` (do not commit). Use the deployed backend:
```
EXPO_PUBLIC_API_BASE_URL=https://type-a-buddy-api.onrender.com
```

### 4) Run the app
```bash
npm run ios
# or
npm run android
```

If env changes are not picked up, clear Expo cache:
```bash
npx expo start -c --ios
```

## Production Notes
- For mobile builds, keep the API base URL in `EXPO_PUBLIC_API_BASE_URL`.

## Demo Notes
For demo-specific behavior (e.g., password reset code exposure on Render Free), see the root README.
