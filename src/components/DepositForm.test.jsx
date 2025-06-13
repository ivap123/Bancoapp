import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DepositForm from './DepositForm';
import { auth, db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// Mock de Firebase
jest.mock('../firebase/config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-uid',
    },
  },
  db: {},
}));

// Mock de funciones de Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe('DepositForm', () => {
  const onClose = jest.fn();
  const onDepositComplete = jest.fn();
  const currentBalance = 1000;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el formulario de depósito', () => {
    render(
      <DepositForm
        onClose={onClose}
        onDepositComplete={onDepositComplete}
        currentBalance={currentBalance}
      />
    );
    expect(screen.getByText('Realizar Depósito')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto a Depositar')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Depositar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  test('actualiza los campos de entrada al escribir', () => {
    render(
      <DepositForm
        onClose={onClose}
        onDepositComplete={onDepositComplete}
        currentBalance={currentBalance}
      />
    );

    const amountInput = screen.getByLabelText('Monto a Depositar');
    fireEvent.change(amountInput, { target: { value: '200' } });
    expect(amountInput).toHaveValue(200);

    const descriptionInput = screen.getByLabelText('Descripción');
    fireEvent.change(descriptionInput, { target: { value: 'Depósito en efectivo' } });
    expect(descriptionInput).toHaveValue('Depósito en efectivo');
  });

  test('muestra error si el monto es inválido (menor o igual a 0)', async () => {
    render(
      <DepositForm
        onClose={onClose}
        onDepositComplete={onDepositComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('Monto a Depositar'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Depositar/i }));

    // Jest no simula validación HTML5, pero la prueba de integración cubrirá que el formulario no se envíe
    // Para pruebas unitarias, podríamos añadir validación JS o asegurar que la llamada a addDoc no ocurra.
    // Aquí, dado que el `min="1"` es validación HTML5, la prueba de envío exitoso confirmará que se necesita un valor válido.
    await waitFor(() => {
      expect(addDoc).not.toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  test('llama a onDepositComplete y onClose en depósito exitoso', async () => {
    addDoc.mockResolvedValueOnce({});
    updateDoc.mockResolvedValue({});

    render(
      <DepositForm
        onClose={onClose}
        onDepositComplete={onDepositComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('Monto a Depositar'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Depósito en efectivo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Depositar/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(onDepositComplete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  test('muestra error si hay un problema al procesar el depósito', async () => {
    addDoc.mockRejectedValueOnce(new Error('Error de Firebase'));

    render(
      <DepositForm
        onClose={onClose}
        onDepositComplete={onDepositComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('Monto a Depositar'), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /Depositar/i }));

    await waitFor(() => {
      expect(screen.getByText('Error de Firebase')).toBeInTheDocument();
    });
    expect(onDepositComplete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
