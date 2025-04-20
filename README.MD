Phone Mic to Speaker
A simple web application that uses your device's microphone as input and outputs the audio to any connected speaker (Bluetooth, USB, aux).

Features
One-click microphone activation
Adjustable microphone volume
Visual audio level meter
Works on any device with a browser
Responsive design for both mobile and desktop
Getting Started
Installation
Clone this repository
Install dependencies:
npm install
Start the development server:
npm start
Building for Production
To create a production build:

npm run buildnpm start
The build output will be in the build directory, ready for deployment.

Deploying to Netlify
This project includes a netlify.toml file for easy deployment to Netlify:

Push your code to a Git repository (GitHub, GitLab, etc.)
Connect your repository to Netlify
Netlify will automatically detect the build settings and deploy your app
Alternatively, you can deploy manually using the Netlify CLI:

npm install -g netlify-cli
netlify deploy
How It Works
The app uses the Web Audio API to:

Capture audio from your device's microphone
Process the audio with adjustable gain
Output the audio to your device's default audio output
Analyze the audio signal to display the level meter
Usage
Connect your Bluetooth/USB/aux speaker to your device
Open the app in a web browser
Click the microphone button to start
Speak into your device's microphone
Your voice will be output through the connected speaker
Adjust the volume slider as needed
Browser Support
This app works on:

Chrome (desktop and mobile)
Firefox (desktop and mobile)
Safari (desktop and mobile)
Edge
License
This project is licensed under the MIT License - see the LICENSE file for details.

np, 