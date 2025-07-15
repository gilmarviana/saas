# saas-frontend

Este projeto agora é apenas o frontend (React + Vite).

- Para rodar localmente: `npm install && npm run dev`
- Para build: `npm run build`
- Para deploy na Vercel: suba este diretório como projeto Vite/React.

As chamadas para `/api/*` devem ser atendidas por funções serverless (API Routes) na Vercel.

O backend antigo foi removido. As rotas da API devem ser migradas para a pasta `/api` na raiz do projeto, seguindo o padrão de Serverless Functions da Vercel.