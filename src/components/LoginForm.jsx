import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const LoginForm = () => {
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setUserInfo(userData);

        // 🟢 Mostrar cartel nativo del navegador
        alert(`¡Bienvenido/a, ${userData.nombre}!`);
      } else {
        setUserInfo(null);
        console.warn("Usuario autenticado pero no tiene datos en Firestore.");
      }

      setError(null);
      e.target.reset();
    } catch (err) {
      setUserInfo(null);
      setError("Correo o contraseña incorrectos.");
      console.error("Error en login:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="p-4 border rounded bg-light">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input type="email" name="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input type="password" name="password" className="form-control" required />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>

      {/* Ya no usamos toast */}
    </div>
  );
};

export default LoginForm;
