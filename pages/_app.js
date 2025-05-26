import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Definir um stub para gtag para evitar erros
    if (typeof window !== 'undefined') {
      window.gtag = window.gtag || function() {
        console.log('Google Analytics não configurado');
      };
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
