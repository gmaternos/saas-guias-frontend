import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDevelopment } from '../../contexts/DevelopmentContext';
import { useChildren } from '../../contexts/ChildrenContext';

const DevelopmentDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getMilestone, updateMilestone, achieveMilestone, deleteMilestone } = useDevelopment();
  const { selectedChild } = useChildren();
  
  const [milestone, setMilestone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAchieving, setIsAchieving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expectedAge: {
      min: '',
      max: ''
    },
    resources: []
  });
  const [achieveData, setAchieveData] = useState({
    achievedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [resource, setResource] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Buscar dados do marco
  useEffect(() => {
    const fetchMilestoneData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getMilestone(id);
        setMilestone(data);
        
        // Preencher formulário com dados atuais
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          expectedAge: {
            min: data.expectedAge.min,
            max: data.expectedAge.max
          },
          resources: data.resources || []
        });
      } catch (error) {
        console.error('Erro ao buscar dados do marco:', error);
        setError('Não foi possível carregar os dados do marco de desenvolvimento.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestoneData();
  }, [id, getMilestone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAchieveChange = (e) => {
    const { name, value } = e.target;
    setAchieveData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResource = () => {
    if (resource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resource.trim()]
      }));
      setResource('');
    }
  };

  const handleRemoveResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validar idades
    const minAge = parseInt(formData.expectedAge.min);
    const maxAge = parseInt(formData.expectedAge.max);
    
    if (isNaN(minAge) || isNaN(maxAge) || minAge < 0 || maxAge < 0) {
      setError('As idades devem ser números positivos.');
      return;
    }
    
    if (minAge > maxAge) {
      setError('A idade mínima não pode ser maior que a idade máxima.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Converter strings para números
      const milestoneData = {
        ...formData,
        expectedAge: {
          min: parseInt(formData.expectedAge.min),
          max: parseInt(formData.expectedAge.max)
        }
      };
      
      const updatedMilestone = await updateMilestone(id, milestoneData);
      setMilestone(updatedMilestone);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar marco de desenvolvimento:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao atualizar marco de desenvolvimento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAchieve = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const updatedMilestone = await achieveMilestone(id, achieveData);
      setMilestone(updatedMilestone);
      setIsAchieving(false);
    } catch (error) {
      console.error('Erro ao registrar marco de desenvolvimento:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao registrar marco de desenvolvimento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteMilestone(id);
      router.push(`/children/${selectedChild?._id || 'dashboard'}`);
    } catch (error) {
      console.error('Erro ao excluir marco de desenvolvimento:', error);
      setError('Não foi possível excluir o marco de desenvolvimento.');
      setIsLoading(false);
    }
  };

  if (isLoading && !milestone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !milestone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar marco' : milestone?.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="motor">Desenvolvimento motor</option>
                  <option value="cognitive">Desenvolvimento cognitivo</option>
                  <option value="language">Desenvolvimento da linguagem</option>
                  <option value="social">Desenvolvimento social</option>
                  <option value="emotional">Desenvolvimento emocional</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expectedAge.min" className="block text-sm font-medium text-gray-700">
                    Idade mínima esperada (meses)
                  </label>
                  <input
                    type="number"
                    id="expectedAge.min"
                    name="expectedAge.min"
                    required
                    min="0"
                    value={formData.expectedAge.min}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="expectedAge.max" className="block text-sm font-medium text-gray-700">
                    Idade máxima esperada (meses)
                  </label>
                  <input
                    type="number"
                    id="expectedAge.max"
                    name="expectedAge.max"
                    required
                    min="0"
                    value={formData.expectedAge.max}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="resources" className="block text-sm font-medium text-gray-700">
                  Recursos (opcional)
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    id="resources"
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="URL de artigo, vídeo ou outro recurso"
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar
                  </button>
                </div>
                {formData.resources.length > 0 && (
                  <div className="mt-2">
                    <ul className="divide-y divide-gray-200">
                      {formData.resources.map((res, index) => (
                        <li key={index} className="py-2 flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate">{res}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveResource(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : isAchieving ? (
            <form onSubmit={handleAchieve} className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar marco como alcançado</h2>
                <div>
                  <label htmlFor="achievedDate" className="block text-sm font-medium text-gray-700">
                    Data em que foi alcançado
                  </label>
                  <input
                    type="date"
                    id="achievedDate"
                    name="achievedDate"
                    required
                    value={achieveData.achievedDate}
                    onChange={handleAchieveChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={achieveData.notes}
                    onChange={handleAchieveChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Adicione observações sobre como o marco foi alcançado"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAchieving(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  {isLoading ? 'Registrando...' : 'Registrar como alcançado'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 mr-2">{milestone?.title}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      milestone?.category === 'motor' ? 'bg-blue-100 text-blue-800' :
                      milestone?.category === 'cognitive' ? 'bg-purple-100 text-purple-800' :
                      milestone?.category === 'language' ? 'bg-yellow-100 text-yellow-800' :
                      milestone?.category === 'social' ? 'bg-green-100 text-green-800' :
                      milestone?.category === 'emotional' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {milestone?.category === 'motor' ? 'Motor' :
                       milestone?.category === 'cognitive' ? 'Cognitivo' :
                       milestone?.category === 'language' ? 'Linguagem' :
                       milestone?.category === 'social' ? 'Social' :
                       milestone?.category === 'emotional' ? 'Emocional' :
                       milestone?.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Esperado entre {milestone?.expectedAge.min}-{milestone?.expectedAge.max} meses
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>

              {deleteConfirm && (
                <div className="mb-6 border border-red-300 rounded-md p-4 bg-red-50">
                  <p className="text-sm text-red-600 mb-3">
                    Tem certeza que deseja excluir este marco? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {isLoading ? 'Excluindo...' : 'Confirmar exclusão'}
                    </button>
                  </div>
                </div>
              )}

              <div className="prose max-w-none mb-6">
                <p>{milestone?.description}</p>
              </div>

              {milestone?.achievedDate ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Marco alcançado em {new Date(milestone.achievedDate).toLocaleDateString('pt-BR')}
                      </p>
                      {milestone.notes && (
                        <p className="text-sm text-green-700 mt-2">
                          {milestone.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <button
                    onClick={() => setIsAchieving(true)}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Registrar como alcançado
                  </button>
                </div>
              )}

              {milestone?.resources && milestone.resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Recursos</h3>
                  <ul className="divide-y divide-gray-200">
                    {milestone.resources.map((resource, index) => (
                      <li key={index} className="py-3">
                        <a 
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {resource}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DevelopmentDetailPage;
