import React from 'react';

const MilestoneCard = ({ milestone, isLast }) => {
  // Função para obter cor baseada na categoria
  const getCategoryColor = (categoria) => {
    switch (categoria) {
      case 'desenvolvimento':
        return 'bg-blue-100 text-blue-800';
      case 'saude':
        return 'bg-green-100 text-green-800';
      case 'alimentacao':
        return 'bg-yellow-100 text-yellow-800';
      case 'sono':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para formatar texto baseado na fase materna
  const getTimeframeText = () => {
    if (milestone.fase_materna === 'gestante' && milestone.semana_gestacao) {
      return `Semana ${milestone.semana_gestacao} de gestação`;
    } else if (milestone.idade_bebe_meses !== undefined) {
      return milestone.idade_bebe_meses === 1 
        ? `${milestone.idade_bebe_meses} mês de idade` 
        : `${milestone.idade_bebe_meses} meses de idade`;
    }
    return '';
  };

  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex items-start">
        {/* Ícone ou indicador visual */}
        <div className="mr-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 text-lg">{milestone.icone || '📌'}</span>
          </div>
        </div>
        
        <div className="flex-grow">
          {/* Categoria */}
          <div className="flex items-center mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(milestone.categoria)}`}>
              {milestone.categoria.charAt(0).toUpperCase() + milestone.categoria.slice(1)}
            </span>
            
            {getTimeframeText() && (
              <span className="ml-2 text-sm text-gray-500">
                {getTimeframeText()}
              </span>
            )}
          </div>
          
          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {milestone.titulo}
          </h3>
          
          {/* Descrição */}
          <p className="text-gray-600 mb-4">
            {milestone.descricao}
          </p>
          
          {/* Links relacionados */}
          {(milestone.conteudos_relacionados?.length > 0 || milestone.ferramentas_relacionadas?.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Recursos relacionados:
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {milestone.conteudos_relacionados?.map((conteudo, index) => (
                  <a 
                    key={`content-${index}`}
                    href={`/conteudo/${conteudo.slug}`}
                    className="text-sm text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1 rounded-full"
                  >
                    {conteudo.titulo}
                  </a>
                ))}
                
                {milestone.ferramentas_relacionadas?.map((ferramenta, index) => (
                  <a 
                    key={`tool-${index}`}
                    href={`/ferramentas/${ferramenta.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full"
                  >
                    {ferramenta.nome}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;
