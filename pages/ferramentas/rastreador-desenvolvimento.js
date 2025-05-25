import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// Importar o componente RastreadorDesenvolvimento dinamicamente com SSR desabilitado
const RastreadorDesenvolvimentoComponent = dynamic(
  () => import('@/components/RastreadorDesenvolvimentoComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
);

// Página RastreadorDesenvolvimento que apenas carrega o componente dinâmico
export default function RastreadorDesenvolvimento() {
  return <RastreadorDesenvolvimentoComponent />;
}
