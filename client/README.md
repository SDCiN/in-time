# iN!Time - Frontend

Sistema de gestão de projetos enterprise - Interface React.

## Tecnologias

- React 18 + JavaScript
- Vite 4
- React Router 6
- React Query 5 (TanStack Query)
- Zustand 4
- Tailwind CSS 3
- Axios
- Socket.io Client

## Estrutura de Diretórios

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas/telas do sistema (será criado)
├── hooks/          # Custom React hooks
├── services/       # API clients (Axios)
├── store/          # Zustand stores
├── utils/          # Funções auxiliares
└── assets/         # Imagens, ícones
```

## Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## Configuração

1. Copie `.env.example` para `.env`
2. Configure as URLs dos serviços backend
3. Execute `npm install`
4. Execute `npm run dev`

## Convenções

- Components em PascalCase
- Hooks começam com `use`
- Services com sufixo `Service`
- Stores com sufixo `Store`
- Código em JavaScript (não TypeScript)
- Documentação e UI em português (pt-BR)
