import { calculateNewBalance } from './balanceUtils';

describe('calculateNewBalance', () => {
  test('debería aumentar el saldo para un depósito', () => {
    expect(calculateNewBalance(100, 50, 'deposit')).toBe(150);
  });

  test('debería disminuir el saldo para una transferencia', () => {
    expect(calculateNewBalance(100, 30, 'transfer')).toBe(70);
  });

  test('debería retornar el saldo actual para un tipo de operación desconocido', () => {
    expect(calculateNewBalance(100, 20, 'unknown')).toBe(100);
  });

  test('debería manejar montos cero correctamente en depósito', () => {
    expect(calculateNewBalance(100, 0, 'deposit')).toBe(100);
  });

  test('debería manejar montos cero correctamente en transferencia', () => {
    expect(calculateNewBalance(100, 0, 'transfer')).toBe(100);
  });
});
