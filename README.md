# Guias Maternos - Frontend

Frontend do SaaS Guias Maternos, desenvolvido com Next.js e Tailwind CSS.

## Requisitos

- Node.js 16+
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env.local` e preencha as variáveis de ambiente
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Build para Produção

```bash
npm run build
npm start
```

## Deploy na Vercel

1. Crie uma conta na Vercel (https://vercel.com)
2. Conecte seu repositório Git
3. Configure as variáveis de ambiente
4. Deploy!

## Estrutura do Projeto

- `public/`: Arquivos estáticos
- `src/components/`: Componentes React reutilizáveis
- `src/contexts/`: Contextos para gerenciamento de estado
- `src/hooks/`: Hooks personalizados
- `src/pages/`: Páginas da aplicação
- `src/services/`: Serviços para comunicação com API
- `src/styles/`: Estilos globais e configurações do Tailwind
- `src/utils/`: Funções utilitárias
