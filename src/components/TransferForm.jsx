import React, { useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { auth } from '../firebase/config';

const TransferForm = ({ onClose, onTransferComplete, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [recipientRut, setRecipientRut] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const montoNum = Number(amount);
      if (isNaN(montoNum) || montoNum <= 0) {
        throw new Error('Monto inválido');
      }

      if (montoNum > currentBalance) {
        throw new Error('Saldo insuficiente');
      }

      // Buscar destinatario por RUT
      const q = query(collection(db, 'usuarios'), where('rut', '==', recipientRut));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('RUT de destinatario no encontrado');
      }

      const destinatarioDoc = querySnapshot.docs[0];
      const destinatarioData = destinatarioDoc.data();
      const destinatarioUid = destinatarioDoc.id;

      if (destinatarioUid === user.uid) {
        throw new Error('No puedes transferirte a ti mismo');
      }

      // Crear la transferencia con Timestamp correcto
      await addDoc(collection(db, 'transferencias'), {
        uid: user.uid,
        destinatarioUid: destinatarioUid,
        destinatarioRut: recipientRut,
        monto: montoNum,
        fecha: Timestamp.fromDate(new Date()),
        descripcion: description,
      });

      // Actualizar saldo del remitente
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        saldo: currentBalance - montoNum,
      });

      // Actualizar saldo del destinatario
      const destinatarioRef = doc(db, 'usuarios', destinatarioUid);
      await updateDoc(destinatarioRef, {
        saldo: (destinatarioData.saldo || 0) + montoNum,
      });

      setSuccess('Transferencia realizada con éxito');
      setError('');
      onTransferComplete(); // Aquí asumo que recarga los datos necesarios, o actualiza el saldo visible

      // Opcional: limpiar inputs después del éxito
      setAmount('');
      setRecipientRut('');
      setDescription('');

      // NO cerrar el modal automáticamente para que el usuario vea el mensaje de éxito
      // Si quieres cerrarlo luego de unos segundos, puedes usar setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Error haciendo transferencia:', error);
      setError(error.message || 'Error desconocido');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Realizar Transferencia</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="recipientRut" className="form-label">
                    RUT del Destinatario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipientRut"
                    value={recipientRut}
                    onChange={e => setRecipientRut(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Monto
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
                    rows="3"
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

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
                          aria-hidden="true"
                        />
                        Procesando...
                      </>
                    ) : (
                      'Transferir'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferForm;
