import React, { useEffect } from 'react';
import db from '../firebase/config';

const FirestoreTest = () => {
  useEffect(() => {
    if (db) {
      console.log(" Firestore está conectado correctamente:", db);
    } else {
      console.error(" Firestore no está conectado");
    }
  }, []);

  return <div>Verifica la consola: conexión a Firestore.</div>;
};

export default FirestoreTest;