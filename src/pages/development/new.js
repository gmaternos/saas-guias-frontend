import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDevelopment } from '../../contexts/DevelopmentContext';
import { useChildren } from '../../contexts/ChildrenContext';

const NewDevelopmentPage = () => {
  const router = useRouter();
  const { childId } = router.query;
  const { createMilestone } = useDevelopment();
  const { getChild } = useChildren();
  
  const [child, setChild] = useState(null);
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
  const [resource, setResource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar dados da criança
  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId) return;
      
      try {
        const data = await getChild(childId);
        setChild(data);
      } catch (error) {
        console.error('Erro ao buscar dados da criança:', error);
        setError('Não foi possível carregar os dados da criança.');
      }
    };

    fetchChildData();
  }, [childId, getChild]);

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
      
      await createMilestone(milestoneData);
      router.push(`/children/${childId}`);
    } catch (error) {
      console.error('Erro ao criar marco de desenvolvimento:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao criar marco de desenvolvimento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              Adicionar marco de desenvolvimento
              {child && ` para ${child.name}`}
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
                placeholder="Ex: Sentar sem apoio"
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
                placeholder="Descreva o marco de desenvolvimento e como identificá-lo"
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </div>
                ) : 'Adicionar marco'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewDevelopmentPage;
