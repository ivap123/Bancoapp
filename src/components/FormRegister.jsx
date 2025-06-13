import React from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

const FormRegister = () => {
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rut: data.rut,
        fecha: data.fecha,
        saldo: 1000000,
        creado: new Date().toISOString(),
      });

      alert('Usuario registrado correctamente!');
      e.target.reset();
      navigate('/');
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div
      className="container-fluid"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6f42c1 0%, #4a1f7f 35%, #2d1155 65%, #1a1a1a 100%)',
        padding: '0',
      }}>
      <div
        className="row justify-content-center align-items-center"
        style={{ minHeight: '100vh', margin: '0' }}>
        <div className="col-md-8 col-lg-6">
          {/* Logo y nombre del banco */}
          <div className="text-center mb-4">
            <h1
              className="text-white fw-bold"
              style={{ fontSize: '2.5rem', textShadow: '0 0 10px rgba(111, 66, 193, 0.7)' }}>
              <span style={{ color: '#a17fe0' }}>Banco</span>Digital
            </h1>
            <p className="text-light" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>
              Crea tu cuenta en simples pasos
            </p>
          </div>

          <div
            className="card shadow-lg border-0"
            style={{
              backgroundColor: 'rgba(26, 26, 26, 0.8)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(111, 66, 193, 0.3)',
            }}>
            <div
              className="card-header text-white text-center py-3"
              style={{
                borderBottom: '2px solid #a17fe0',
                borderRadius: '15px 15px 0 0',
                background: 'linear-gradient(90deg, #4a1f7f, #6f42c1)',
              }}>
              <h3 className="mb-0" style={{ fontWeight: '600' }}>
                Registro de Cuenta
              </h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nombre" className="form-label text-light">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{
                        backgroundColor: 'rgba(26, 26, 26, 0.6)',
                        color: 'white',
                        borderColor: '#4a1f7f',
                        caretColor: '#a17fe0',
                      }}
                      id="nombre"
                      name="nombre"
                      required
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="apellido" className="form-label text-light">
                      Apellido
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{
                        backgroundColor: 'rgba(26, 26, 26, 0.6)',
                        color: 'white',
                        borderColor: '#4a1f7f',
                        caretColor: '#a17fe0',
                      }}
                      id="apellido"
                      name="apellido"
                      required
                      placeholder="Apellido"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-light">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.6)',
                      color: 'white',
                      borderColor: '#4a1f7f',
                      caretColor: '#a17fe0',
                    }}
                    id="email"
                    name="email"
                    required
                    placeholder="ejemplo@ejemplo.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="rut" className="form-label text-light">
                    RUT
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.6)',
                      color: 'white',
                      borderColor: '#4a1f7f',
                      caretColor: '#a17fe0',
                    }}
                    id="rut"
                    name="rut"
                    required
                    placeholder="11.111.111-1"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="fecha" className="form-label text-light">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.6)',
                      color: 'white',
                      borderColor: '#4a1f7f',
                      caretColor: '#a17fe0',
                    }}
                    id="fecha"
                    name="fecha"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-light">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.6)',
                      color: 'white',
                      borderColor: '#4a1f7f',
                      caretColor: '#a17fe0',
                    }}
                    id="password"
                    name="password"
                    required
                    placeholder="Contraseña"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn text-white fw-bold"
                    style={{
                      background: 'linear-gradient(90deg, #6f42c1, #4a1f7f)',
                      padding: '12px',
                      fontSize: '1.1rem',
                      border: 'none',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                    }}>
                    Crear Cuenta
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light mt-2"
                    onClick={() => navigate('/')}>
                    Volver al Inicio de Sesión
                  </button>
                </div>
              </form>
            </div>
            <div
              className="card-footer bg-dark text-center text-muted py-3"
              style={{ borderTop: '1px solid #333', borderRadius: '0 0 15px 15px' }}>
              <small>Tus datos están protegidos con los más altos estándares de seguridad</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;
