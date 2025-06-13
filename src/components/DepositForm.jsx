import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { auth } from '../firebase/config';

const DepositForm = ({ onClose, onDepositComplete, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      // Crear el depósito
      const depositRef = await addDoc(collection(db, 'transferencias'), {
        uid: user.uid,
        monto: Number(amount),
        fecha: new Date(),
        descripcion: description || 'Depósito',
        tipo: 'deposito',
      });

      // Actualizar saldo del usuario
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        saldo: currentBalance + Number(amount),
      });

      onDepositComplete();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Realizar Depósito</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Monto a Depositar
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows="3"></textarea>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      'Depositar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default DepositForm;
