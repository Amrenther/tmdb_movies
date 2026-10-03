import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.tsx';
import { MovieListProvider } from './context/MovieListContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MovieListProvider>
          <App />
        </MovieListProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
