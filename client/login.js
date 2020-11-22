var firebaseConfig = {
  apiKey: 'AIzaSyCE4muhRwifzke2T8hIxJ5bsO4gM3oG2Pk',
  authDomain: 'hex-ai-7039a.firebaseapp.com',
  databaseURL: 'https://hex-ai-7039a.firebaseio.com',
  projectId: 'hex-ai-7039a',
  storageBucket: 'hex-ai-7039a.appspot.com',
  messagingSenderId: '551246524696',
  appId: '1:551246524696:web:6642358b41f4fa7b93ee6d',
  measurementId: 'G-2BZ5VPX5W7',
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function signUp() {
  const auth = firebase.auth();
  var email = document.getElementById('email');
  var password = document.getElementById('pass');
  const promise = auth.createUserWithEmailAndPassword(
    email.value,
    password.value
  );
  promise.catch((e) => alert(e.message));
}

function signIn() {
  const auth = firebase.auth();
  var email = document.getElementById('email');
  var password = document.getElementById('pass');
  const promise = auth.signInWithEmailAndPassword(email.value, password.value);
  promise.catch((e) => alert(e.message));
  console.log('You are signedIn');
}

function signOut() {
  const auth = firebase.auth();
  auth.signOut();
  alert('Signed Out');
}
