import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';

// Componente de fallback para mostrar durante o carregamento
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Guias Maternos</h1>
        <LoadingSpinner />
        <p className="mt-4">Carregando dashboard...</p>
      </div>
    </div>
  );
}

// Importar o componente Dashboard dinamicamente
const DashboardComponent = dynamic(
  () => import('../components/DashboardComponent'),
  { 
    ssr: false,
    loading: () => <DashboardLoading />
  }
);

// Página Dashboard que pode ser renderizada no servidor
export default function Dashboard() {
  return <DashboardComponent />;
}

// Isso garante que a página exista no servidor
export async function getStaticProps() {
  return {
    props: {}
  };
}
