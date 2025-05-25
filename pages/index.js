import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionamento mais direto com um pequeno atraso para garantir que o router esteja pronto
    const redirectTimer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
    
    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <>
      <Head>
        <title>Guias Maternos</title>
        <meta name="description" content="Plataforma de apoio materno" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Guias Maternos</h1>
        <p>Carregando...</p>
      </div>
    </>
  );
}
