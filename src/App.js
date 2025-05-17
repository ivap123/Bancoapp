import React, { useState } from 'react';
import FormRegister from './components/FormRegister';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [view, setView] = useState('login'); // o 'register'

  return (
    <div>
      <h1>Prueba de Firestore</h1>

      <div className="mb-3">
        <button onClick={() => setView('login')} className="btn btn-primary me-2">
          Ver Login
        </button>
        <button onClick={() => setView('register')} className="btn btn-secondary">
          Ver Registro
        </button>
      </div>

      {view === 'login' && <LoginForm />}
      {view === 'register' && <FormRegister />}
    </div>
  );
}

export default App;
