import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import TransferForm from './TransferForm';
import DepositForm from './DepositForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchTransactions();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (!user || !user.uid) {
        console.log('Usuario no autenticado (fetchUserData)');
        return;
      }
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          ...data,
          saldo: Number(data.saldo) || 0,
        });
      } else {
        console.log('No existe el documento de usuario.');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      setUserData(null);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user || !user.uid) {
        console.log('Usuario no autenticado (fetchTransactions)');
        return;
      }

      // Obtener transferencias enviadas
      const qEnviadas = query(
        collection(db, 'transferencias'),
        where('uid', '==', user.uid),
        orderBy('fecha', 'desc'),
        limit(10)
      );

      // Obtener transferencias recibidas
      const qRecibidas = query(
        collection(db, 'transferencias'),
        where('destinatarioUid', '==', user.uid),
        orderBy('fecha', 'desc'),
        limit(10)
      );

      const [enviadasSnapshot, recibidasSnapshot] = await Promise.all([
        getDocs(qEnviadas),
        getDocs(qRecibidas),
      ]);

      const enviadas = enviadasSnapshot.docs.map(doc => {
        const data = doc.data();
        const fecha =
          data.fecha && typeof data.fecha.toDate === 'function' ? data.fecha.toDate() : new Date();
        return {
          id: doc.id,
          ...data,
          fecha: fecha,
          tipo: 'transferencia_saliente',
        };
      });

      const recibidas = recibidasSnapshot.docs.map(doc => {
        const data = doc.data();
        const fecha =
          data.fecha && typeof data.fecha.toDate === 'function' ? data.fecha.toDate() : new Date();
        return {
          id: doc.id,
          ...data,
          fecha: fecha,
          tipo: 'transferencia_entrante',
        };
      });

      // Combinar y ordenar todas las transacciones por fecha
      const todasLasTransacciones = [...enviadas, ...recibidas].sort((a, b) => b.fecha - a.fecha);

      console.log('Transacciones enviadas:', enviadas);
      console.log('Transacciones recibidas:', recibidas);
      console.log('Todas las transacciones combinadas:', todasLasTransacciones);

      setTransactions(todasLasTransacciones);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      setTransactions([]);
    }
  };

  const handleOperationComplete = async () => {
    if (user) {
      await fetchUserData();
      await fetchTransactions();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div
        className="container-fluid bg-dark d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header
        className="bg-dark text-white shadow-sm"
        style={{
          background: 'linear-gradient(90deg, #4a1f7f, #6f42c1)',
          borderBottom: '1px solid #a17fe0',
        }}>
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-6">
              <h4 className="mb-0 fw-bold">
                <span style={{ color: '#a17fe0' }}>Banco</span>Digital
              </h4>
            </div>
            <div className="col-6 text-end">
              <div className="dropdown">
                <button
                  className="btn btn-link dropdown-toggle text-white text-decoration-none"
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <i className="bi bi-person-circle me-1"></i>
                  {userData?.nombre || 'Usuario'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                  <li>
                    <button className="dropdown-item" type="button">
                      Mi Perfil
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" type="button">
                      Configuración
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" type="button" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-4">
        {/* Bienvenida */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title">Bienvenido/a, {userData?.nombre || 'Usuario'}</h2>
                <p className="card-text text-muted">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo y acciones rápidas */}
        <div className="row mb-4">
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title text-muted mb-3">Saldo disponible</h5>
                <h2 className="display-5 fw-bold mb-3">
                  ${userData?.saldo?.toLocaleString('es-CL') || '0,00'}
                </h2>
                <p className="card-text text-muted">Cuenta Corriente {userData?.rut}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title text-muted mb-3">Acciones rápidas</h5>
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      onClick={() => setShowTransferForm(true)}
                      className="btn btn-light border w-100 py-3 d-flex flex-column align-items-center">
                      <i
                        className="bi bi-arrow-up-right-circle fs-4 mb-2"
                        style={{ color: '#6f42c1' }}></i>
                      <span>Transferir</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-light border w-100 py-3 d-flex flex-column align-items-center">
                      <i className="bi bi-credit-card fs-4 mb-2" style={{ color: '#6f42c1' }}></i>
                      <span>Pagar</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => setShowDepositForm(true)}
                      className="btn btn-light border w-100 py-3 d-flex flex-column align-items-center">
                      <i className="bi bi-cash-stack fs-4 mb-2" style={{ color: '#6f42c1' }}></i>
                      <span>Depositar</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-light border w-100 py-3 d-flex flex-column align-items-center">
                      <i className="bi bi-receipt fs-4 mb-2" style={{ color: '#6f42c1' }}></i>
                      <span>Servicios</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Últimos movimientos</h5>
                <button className="btn btn-sm" style={{ color: '#6f42c1' }}>
                  Ver todos
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th className="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>
                            {new Date(transaction.fecha).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>
                            {transaction.tipo === 'transferencia_saliente'
                              ? `Transferencia a ${transaction.destinatarioRut}`
                              : transaction.tipo === 'transferencia_entrante'
                                ? `Transferencia de ${transaction.uid}`
                                : 'Depósito'}
                          </td>
                          <td
                            className={`text-end fw-bold ${
                              transaction.tipo === 'transferencia_saliente'
                                ? 'text-danger'
                                : 'text-success'
                            }`}>
                            {transaction.tipo === 'transferencia_saliente' ? '-' : '+'} $
                            {transaction.monto.toLocaleString('es-CL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white-50 py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h5 className="text-white">BancoDigital</h5>
              <p className="small">Tu banco digital de confianza</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="small mb-0">© 2023 BancoDigital. Todos los derechos reservados.</p>
              <p className="small">Contacto: soporte@bancodigital.com</p>
            </div>
          </div>
        </div>
      </footer>

      {showTransferForm && (
        <TransferForm
          onClose={() => setShowTransferForm(false)}
          onTransferComplete={handleOperationComplete}
          currentBalance={userData?.saldo}
        />
      )}

      {showDepositForm && (
        <DepositForm
          onClose={() => setShowDepositForm(false)}
          onDepositComplete={handleOperationComplete}
          currentBalance={userData?.saldo}
        />
      )}
    </div>
  );
};

export default Dashboard;
