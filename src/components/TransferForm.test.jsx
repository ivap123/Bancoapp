import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransferForm from './TransferForm';
import { auth, db } from '../firebase/config';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

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
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe('TransferForm', () => {
  const onClose = jest.fn();
  const onTransferComplete = jest.fn();
  const currentBalance = 1000;

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();

    // Configurar mock de getDoc para un usuario existente
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ saldo: 500 }),
    });

    // Configurar mock de getDocs para una consulta de RUT existente
    getDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'recipient-uid',
          data: () => ({ saldo: 500 }),
        },
      ],
    });
  });

  test('renderiza el formulario de transferencia', () => {
    render(
      <TransferForm
        onClose={onClose}
        onTransferComplete={onTransferComplete}
        currentBalance={currentBalance}
      />
    );
    expect(screen.getByText('Realizar Transferencia')).toBeInTheDocument();
    expect(screen.getByLabelText('RUT del Destinatario')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transferir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  test('actualiza los campos de entrada al escribir', () => {
    render(
      <TransferForm
        onClose={onClose}
        onTransferComplete={onTransferComplete}
        currentBalance={currentBalance}
      />
    );

    const rutInput = screen.getByLabelText('RUT del Destinatario');
    fireEvent.change(rutInput, { target: { value: '12345678-9' } });
    expect(rutInput).toHaveValue('12345678-9');

    const amountInput = screen.getByLabelText('Monto');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(amountInput).toHaveValue(100);

    const descriptionInput = screen.getByLabelText('Descripción');
    fireEvent.change(descriptionInput, { target: { value: 'Pago de prueba' } });
    expect(descriptionInput).toHaveValue('Pago de prueba');
  });

  test('muestra error si el saldo es insuficiente', async () => {
    render(
      <TransferForm onClose={onClose} onTransferComplete={onTransferComplete} currentBalance={50} />
    );

    fireEvent.change(screen.getByLabelText('RUT del Destinatario'), {
      target: { value: '12345678-9' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Transferir/i }));

    await waitFor(() => {
      expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument();
    });
    expect(onTransferComplete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('muestra error si el RUT del destinatario no es encontrado', async () => {
    getDocs.mockResolvedValueOnce({ empty: true }); // Mock para esta prueba

    render(
      <TransferForm
        onClose={onClose}
        onTransferComplete={onTransferComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('RUT del Destinatario'), {
      target: { value: '99999999-9' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Transferir/i }));

    await waitFor(() => {
      expect(screen.getByText('RUT de destinatario no encontrado')).toBeInTheDocument();
    });
    expect(onTransferComplete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('muestra error si el usuario intenta transferirse a sí mismo', async () => {
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'test-user-uid', // Mismo UID que el usuario actual
          data: () => ({ saldo: 500 }),
        },
      ],
    });

    render(
      <TransferForm
        onClose={onClose}
        onTransferComplete={onTransferComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('RUT del Destinatario'), {
      target: { value: '12345678-9' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Transferir/i }));

    await waitFor(() => {
      expect(screen.getByText('No puedes transferirte a ti mismo')).toBeInTheDocument();
    });
    expect(onTransferComplete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('llama a onTransferComplete y onClose en transferencia exitosa', async () => {
    addDoc.mockResolvedValueOnce({});
    updateDoc.mockResolvedValue({});

    render(
      <TransferForm
        onClose={onClose}
        onTransferComplete={onTransferComplete}
        currentBalance={currentBalance}
      />
    );

    fireEvent.change(screen.getByLabelText('RUT del Destinatario'), {
      target: { value: '12345678-9' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByRole('button', { name: /Transferir/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledTimes(2); // Una para el remitente, otra para el destinatario
      expect(onTransferComplete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
