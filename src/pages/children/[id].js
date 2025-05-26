import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useChildren } from '../../contexts/ChildrenContext';
import { useDevelopment } from '../../contexts/DevelopmentContext';

const ChildDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getChild, updateChild, deleteChild } = useChildren();
  const { milestones, isDelayed, isOnTime, isEarly } = useDevelopment();
  
  const [child, setChild] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Buscar dados da criança
  useEffect(() => {
    const fetchChildData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getChild(id);
        setChild(data);
        
        // Preencher formulário com dados atuais
        setFormData({
          name: data.name,
          birthDate: new Date(data.birthDate).toISOString().split('T')[0],
          gender: data.gender,
          notes: data.notes || ''
        });
      } catch (error) {
        console.error('Erro ao buscar dados da criança:', error);
        setError('Não foi possível carregar os dados da criança.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildData();
  }, [id, getChild]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await updateChild(id, formData);
      setIsEditing(false);
      
      // Atualizar dados locais
      setChild(prev => ({
        ...prev,
        ...formData
      }));
    } catch (error) {
      console.error('Erro ao atualizar criança:', error);
      setError('Não foi possível atualizar os dados da criança.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteChild(id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao excluir criança:', error);
      setError('Não foi possível excluir a criança.');
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  };

  if (isLoading && !child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !child) {
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
              {isEditing ? 'Editar perfil' : child?.name}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Perfil da Criança */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                      Data de nascimento
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      required
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gênero
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Observações (opcional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
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
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        {child?.gender === 'female' ? (
                          <span className="text-pink-500 text-2xl">👧</span>
                        ) : (
                          <span className="text-blue-500 text-2xl">👦</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-800">{child?.name}</h2>
                        <p className="text-gray-500">
                          {child?.birthDate && calculateAge(child.birthDate)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <dl className="divide-y divide-gray-200">
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Data de nascimento</dt>
                        <dd className="text-sm text-gray-900">
                          {child?.birthDate && new Date(child.birthDate).toLocaleDateString('pt-BR')}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Gênero</dt>
                        <dd className="text-sm text-gray-900">
                          {child?.gender === 'male' ? 'Masculino' : 
                           child?.gender === 'female' ? 'Feminino' : 
                           child?.gender === 'other' ? 'Outro' : ''}
                        </dd>
                      </div>
                      {child?.notes && (
                        <div className="py-3">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Observações</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-line">{child.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="mt-6 w-full px-4 py-2 border border-red-300 text-red-600 rounded-md shadow-sm text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Excluir perfil
                    </button>
                  ) : (
                    <div className="mt-6 border border-red-300 rounded-md p-4 bg-red-50">
                      <p className="text-sm text-red-600 mb-3">
                        Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.
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
                </>
              )}
            </div>
          </div>

          {/* Marcos de Desenvolvimento */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Marcos de desenvolvimento</h2>
                <button
                  onClick={() => router.push(`/development/new?childId=${id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Adicionar marco
                </button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum marco de desenvolvimento registrado ainda.</p>
                  <button
                    onClick={() => router.push(`/development/new?childId=${id}`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Adicionar primeiro marco
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div 
                      key={milestone._id}
                      className="border rounded-lg p-4 hover:border-indigo-300 transition-colors"
                      onClick={() => router.push(`/development/${milestone._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{milestone.title}</h3>
                          <p className="text-sm text-gray-500">
                            Esperado entre {milestone.expectedAge.min}-{milestone.expectedAge.max} meses
                          </p>
                        </div>
                        <div>
                          {milestone.achievedDate ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isEarly(milestone) ? 'bg-green-100 text-green-800' :
                              isOnTime(milestone) ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {isEarly(milestone) ? 'Precoce' :
                               isOnTime(milestone) ? 'No prazo' :
                               'Alcançado'}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDelayed(milestone) ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isDelayed(milestone) ? 'Atrasado' : 'Pendente'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {milestone.description.length > 100
                          ? `${milestone.description.substring(0, 100)}...`
                          : milestone.description}
                      </p>
                      {milestone.achievedDate && (
                        <p className="mt-2 text-xs text-gray-500">
                          Alcançado em: {new Date(milestone.achievedDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildDetailPage;
