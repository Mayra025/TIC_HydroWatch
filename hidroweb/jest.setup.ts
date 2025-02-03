import '@testing-library/jest-dom'; // Matchers adicionales para pruebas DOM
import 'matchmedia-polyfill';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

global.HTMLCanvasElement.prototype.getContext = function (contextId, contextAttributes) {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(300, 150); // Ajustar el tamaño 
    return canvas.getContext(contextId, contextAttributes);
  };
  
const firebaseConfig = {
    apiKey: "AIzaSyCdc0GXG2E1zr-FYtOKkKFjc-h98gok4ME",
    authDomain: "hidroweb-data.firebaseapp.com",
    projectId: "hidroweb-data",
    storageBucket: "hidroweb-data.appspot.com",
    messagingSenderId: "820071530453",
    appId: "1:820071530453:web:fb5fa25a0693361686c75c",
    measurementId: "G-QZTK3BRXYZ"
};



// Inicializar Firebase
initializeApp(firebaseConfig);
getFirestore();



