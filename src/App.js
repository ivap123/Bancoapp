import React from 'react';
import FirestoreTest from './components/FirestoreTest';
import FormRegister from './components/FormRegister';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import db from './firebase/config';

function App() {
  return (
    <div>
      <h1>Prueba de Firestore</h1>
      
      <h2>Formulario de Registro</h2>
     <FormRegister />
    </div>
  );
}

export default App;
