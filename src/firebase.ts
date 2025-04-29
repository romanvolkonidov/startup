import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIza...", // Replace with your actual Firebase API key
  authDomain: "startapp-a9c51.firebaseapp.com",
  projectId: "startapp-a9c51",
  storageBucket: "startapp-a9c51.appspot.com",
  messagingSenderId: "107514139787802433993",
  appId: "1:107514139787802433993:web:your-app-id" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Setup authentication providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// You can configure additional provider settings here
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, facebookProvider, twitterProvider };
export default app;