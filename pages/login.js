import dynamic from 'next/dynamic';

// Componente de fallback para mostrar durante o carregamento
function LoginLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Guias Maternos</h1>
      <p>Carregando página de login...</p>
    </div>
  );
}

// Importar o componente Login dinamicamente
const LoginComponent = dynamic(
  () => import('../components/LoginComponent'), // Crie este componente se não existir
  { 
    ssr: false,
    loading: LoginLoading
  }
);

// Página Login que pode ser renderizada no servidor
export default function Login() {
  return <LoginComponent />;
}
