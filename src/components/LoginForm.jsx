import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

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
        // Reemplazamos el alert por la redirección al dashboard
        navigate('/dashboard');
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

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="container-fluid bg-dark" style={{ minHeight: "100vh" }}>
      <div className="row justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="col-md-8 col-lg-6 col-xl-4">
          {/* Logo y nombre del banco */}
          <div className="text-center mb-4">
            <h1 className="text-white fw-bold">
              <span style={{ color: "#6f42c1" }}>Banco</span>MuriTripares
            </h1>
            <p className="text-light">Tu dinero, siempre seguro</p>
          </div>
          
          {/* Tarjeta de login */}
          <div className="card shadow-lg border-0" style={{ backgroundColor: "#1a1a1a", borderRadius: "15px" }}>
            <div className="card-header bg-dark text-white text-center py-3" style={{ borderBottom: "2px solid #6f42c1", borderRadius: "15px 15px 0 0" }}>
              <h3 className="mb-0">Acceso a tu cuenta</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label text-light">Correo electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-light border-secondary">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control bg-dark text-white border-secondary" 
                      required 
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-light">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-light border-secondary">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input 
                      type="password" 
                      name="password" 
                      className="form-control bg-dark text-white border-secondary" 
                      required 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid gap-2">
                  <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: "#6f42c1", padding: "12px", fontSize: "1.1rem" }}>
                    Iniciar Sesión
                  </button>
                </div>
                <div className="text-center mt-3">
                  <p className="text-light mb-0">¿No tienes una cuenta?</p>
                  <button 
                    type="button" 
                    className="btn btn-link text-light" 
                    onClick={handleRegisterClick}
                    style={{ textDecoration: "none", color: "#a17fe0" }}
                  >
                    Registrarse ahora
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer bg-dark text-center text-muted py-3" style={{ borderTop: "1px solid #333", borderRadius: "0 0 15px 15px" }}>
              <small>Protegido con encriptación de nivel bancario</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

