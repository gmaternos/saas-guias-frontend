import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';

// Importar o componente Dashboard dinamicamente com SSR desabilitado
const DashboardComponent = dynamic(
  () => import('../components/DashboardComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
);

// Página Dashboard que apenas carrega o componente dinâmico
export default function Dashboard() {
  return <DashboardComponent />;
}
