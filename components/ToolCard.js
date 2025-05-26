import React from 'react';
import Link from 'next/link';

const ToolCard = ({ tool }) => {
  // Função para obter cor de fundo baseada no tipo da ferramenta
  const getBackgroundColor = (tipo) => {
    switch (tipo) {
      case 'rastreador':
        return 'bg-blue-50 border-blue-200';
      case 'diario':
        return 'bg-green-50 border-green-200';
      case 'calculadora':
        return 'bg-yellow-50 border-yellow-200';
      case 'checklist':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Função para obter cor do ícone baseada no tipo da ferramenta
  const getIconColor = (tipo) => {
    switch (tipo) {
      case 'rastreador':
        return 'text-blue-500';
      case 'diario':
        return 'text-green-500';
      case 'calculadora':
        return 'text-yellow-500';
      case 'checklist':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  // Função para obter ícone baseado no tipo da ferramenta
  const getIcon = (tipo) => {
    switch (tipo) {
      case 'rastreador':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'diario':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'calculadora':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'checklist':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Verificar se a ferramenta está em beta
  const isBeta = tool.status === 'beta';

  return (
    <Link href={`/ferramentas/${tool.slug}`}>
      <a className={`block rounded-lg border p-5 transition-all duration-300 hover:shadow-md ${getBackgroundColor(tool.tipo)}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-full ${getIconColor(tool.tipo)} bg-white`}>
              {getIcon(tool.tipo)}
            </div>
            
            {isBeta && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Beta
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {tool.nome}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 flex-grow">
            {tool.descricao}
          </p>
          
          <div className="flex justify-end mt-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              Acessar
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ToolCard;
