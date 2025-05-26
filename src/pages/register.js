// Este arquivo redireciona para a página de registro correta em /auth/register
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegisterRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/auth/register');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecionando para a página de registro...</p>
    </div>
  );
}
