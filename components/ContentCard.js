import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ContentCard = ({ content }) => {
  // Formatar data de publicação
  const formattedDate = format(
    new Date(content.data_publicacao),
    "d 'de' MMMM, yyyy",
    { locale: ptBR }
  );

  // Limitar tamanho da descrição
  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/conteudo/${content.slug}`}>
        <a className="block">
          <div className="relative h-48 w-full">
            <Image
              src={content.imagem_destaque}
              alt={content.titulo}
              layout="fill"
              objectFit="cover"
              priority={true}
            />
          </div>
          
          <div className="p-5">
            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-2">
              {content.categorias.slice(0, 2).map((categoria, index) => (
                <span 
                  key={index}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  {categoria}
                </span>
              ))}
              {content.categorias.length > 2 && (
                <span className="inline-block text-gray-500 text-xs">
                  +{content.categorias.length - 2}
                </span>
              )}
            </div>
            
            {/* Título */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {content.titulo}
            </h3>
            
            {/* Descrição */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {truncateDescription(content.descricao)}
            </p>
            
            {/* Metadados */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <span className="mr-1">Por</span>
                <span className="font-medium">{content.autor.nome}</span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2">{formattedDate}</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {content.tempo_leitura} min
                </span>
              </div>
            </div>
            
            {/* Avaliação */}
            {content.avaliacao_media > 0 && (
              <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(content.avaliacao_media) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-gray-600">
                    ({content.avaliacoes_count})
                  </span>
                </div>
              </div>
            )}
          </div>
        </a>
      </Link>
    </div>
  );
};

export default ContentCard;
