import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AuthLogin() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar imediatamente para a página de login correta
    router.replace('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecionando... | Guias Maternos</title>
        <meta name="description" content="Redirecionando para a página de login" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-600 mb-4">Guias Maternos</h1>
          <p className="text-gray-600">Redirecionando para a página de login...</p>
        </div>
      </div>
    </>
  );
}
