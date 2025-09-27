import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase configuration details
const firebaseConfig = {
    apiKey: "AIzaSyD4nTp2sw2eQshbFg0DzLk6IyJ2b8aTROA",
    authDomain: "guess-table.firebaseapp.com",
    databaseURL: "https://guess-table-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "guess-table",
    storageBucket: "guess-table.appspot.com",
    messagingSenderId: "183879589799",
    appId: "1:183879589799:web:cc43830d59223bf0a5e082",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
