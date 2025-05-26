import dynamic from 'next/dynamic';

// Componente de fallback para mostrar durante o carregamento
function DashboardLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Guias Maternos</h1>
      <p>Carregando dashboard...</p>
    </div>
  );
}

// Importar o componente Dashboard dinamicamente
const DashboardComponent = dynamic(
  () => import('../components/DashboardComponent'),
  { 
    ssr: false,
    loading: DashboardLoading
  }
);

// Página Dashboard que pode ser renderizada no servidor
export default function Dashboard() {
  return <DashboardComponent />;
}
