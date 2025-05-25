import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar para o dashboard ao carregar a página inicial
    router.push('/dashboard');
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Guias Maternos</h1>
      <p>Carregando...</p>
    </div>
  );
}

// Adicionar redirecionamento do lado do servidor
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
}
