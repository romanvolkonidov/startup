import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC60pTvCppQqKbK3KsebBDwS0A80jfA0no",
  authDomain: "startapp-a9c51.firebaseapp.com",
  projectId: "startapp-a9c51",
  storageBucket: "startapp-a9c51.firebasestorage.app",
  messagingSenderId: "1050742832474",
  appId: "1:1050742832474:web:3fd615e4d2897c05248763"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Setup authentication providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

appleProvider.addScope('email');
appleProvider.addScope('name');

export { auth, googleProvider, appleProvider };
export default app;