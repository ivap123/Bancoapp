import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renderiza componente App sin crashear', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Puedes buscar por cualquier texto que tu App muestre al inicio:
  // Por ejemplo, si tu login tiene "Iniciar Sesión"
  const title = screen.getByText(/Iniciar Sesión/i);
  expect(title).toBeInTheDocument();
});
