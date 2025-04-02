# Momentum

A React Native MVP mobile application for powerlifting coaches to send structured programs and track client progress and for athletes to log their weights achieved and to keep track of their progress via analytics. The app addresses a gap in the powerlifting market by offering platform that aims to reduce tool fragmentation and helps coaches separate their work-life balance by consolidating workflows into a single, clean mobile solution for on-the-go access. 



## File Structure

```
Momentum/
├── assets/                 # Static assets (images, icons)
├── components/            # Reusable UI components
├── contexts/             # React Context providers
├── navigation/           # Navigation configuration
├── pages/               # Screen components
├── src/                 # Source code
│   ├── auth/           # Authentication logic
│   ├── config/         # Configuration files
│   └── services/       # Service layer implementations
└── App.js              # App entry point
```



### Requirements

For Developers/Markers:

To set up and run Momentum, ensure you have the following prerequisites installed:

- Node.js: Version 16.14.0 or later
- npm: Version 8.5.0 or later (alternatively, Yarn 1.22.0 or later, tested with npm)
- Expo CLI: Version 6.0.0 or later (install globally with npm install -g expo-cli)
- Expo Go app: Installed on an iOS or Android mobile device
- Git: For cloning the repository
- Devices: Laptop and Mobile device


For End Users:

End users only need:
- Expo Go app: Installed on an iOS or Android mobile device (for testing purposes)
- In production, users would download the app directly from the App Store/Google Play



### Build Steps

1. Open a terminal in your preferred IDE.
2. Clone the project repository: git clone https://github.com/dorsamomeni/Momentum.git
3. Navigate to the project directory: cd Momentum
4. Install dependencies: npm install
5. Start the Expo server: npx expo start
6. Open the Expo Go app on your mobile device (ensure your device and computer are on the same Wi-Fi network).
7. Scan the QR code displayed in the terminal using the camera application on your device to load the app on your device.

This should load up and display the application on your mobile device.



### Test Steps

1. Start the app: Run npx expo start and open the app in Expo Go.

Expected Outcome: The app should load on your mobile device, displaying the first oboarding screen.

2. Test authentication:

- Create two new accounts (one coach, one athlete) to verify signup functionality, or use the test accounts:

	- Coach: Username testcoach, Password testcoach
	- Athlete: Username dorsamomeni3, Password dorsamomeni

Expected Outcome: Successful login should display the respective dashboard (coach or athlete).

3. Test core features:

Coach Role:

- Log in or sign up as a coach.
- Send and accept friend requests with an athlete.
- Select an athlete and create a block (optionally use a template during block creation).
- Add workouts (create weeks, exercises, etc.).
- Modify workouts (e.g., delete weeks/exercises, rename weeks, dates, or blocks).
- In the analytics tab, search for a client to view progress over 5 years (or load demo data).
- Log out or delete the account.

Expected Outcome: Each action should update the UI accordingly (e.g., new blocks appear, analytics graphs load).

Athlete Role:

- Log in or sign up as an athlete.
- Send and accept friend requests with a coach.
- Log weights and notes for a workout.
- Update max weight in the analytics tab.
- View progress over 5 years (or load demo data).
- Log out or delete the account.

Expected Outcome: Logged weights should apprear on coach view, analytics should reflect updates etc.
