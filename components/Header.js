import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <a className="flex items-center">
                <Image 
                  src="/images/logo.png" 
                  alt="Guias Maternos" 
                  width={150} 
                  height={40} 
                  priority
                />
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard">
              <a className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
            </Link>
            <Link href="/conteudo">
              <a className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Conteúdos
              </a>
            </Link>
            <Link href="/ferramentas">
              <a className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Ferramentas
              </a>
            </Link>
            <Link href="/comunidade">
              <a className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Comunidade
              </a>
            </Link>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center">
            {userProfile ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <span className="sr-only">Abrir menu do usuário</span>
                    {userProfile.perfil?.foto ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={userProfile.perfil.foto}
                        alt={userProfile.nome}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-purple-700 font-medium">
                          {userProfile.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="ml-2 text-gray-700">{userProfile.nome.split(' ')[0]}</span>
                    <svg
                      className="ml-1 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <Link href="/perfil">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Meu Perfil
                        </a>
                      </Link>
                      <Link href="/configuracoes">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Configurações
                        </a>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <a className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                    Entrar
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium">
                    Cadastrar
                  </a>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard">
              <a className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Dashboard
              </a>
            </Link>
            <Link href="/conteudo">
              <a className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Conteúdos
              </a>
            </Link>
            <Link href="/ferramentas">
              <a className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Ferramentas
              </a>
            </Link>
            <Link href="/comunidade">
              <a className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Comunidade
              </a>
            </Link>
          </div>
          {userProfile ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {userProfile.perfil?.foto ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={userProfile.perfil.foto}
                      alt={userProfile.nome}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-purple-700 font-medium">
                        {userProfile.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userProfile.nome}</div>
                  <div className="text-sm font-medium text-gray-500">{userProfile.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link href="/perfil">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
                    Meu Perfil
                  </a>
                </Link>
                <Link href="/configuracoes">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
                    Configurações
                  </a>
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 px-5">
                <Link href="/auth/login">
                  <a className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
                    Entrar
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700">
                    Cadastrar
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
