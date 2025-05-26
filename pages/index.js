import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Guias Maternos</title>
        <meta name="description" content="Plataforma de apoio materno" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <main className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">Guias Maternos</h1>
          <p className="text-gray-600 mb-8">
            Sua plataforma de apoio para todas as fases da maternidade
          </p>
          
          <div className="flex flex-col space-y-4">
            <Link href="/dashboard">
              <a className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Dashboard
              </a>
            </Link>
            
            <Link href="/login">
              <a className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Login
              </a>
            </Link>
          </div>
        </main>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Guias Maternos. Todos os direitos reservados.
        </footer>
      </div>
    </>
  );
}
