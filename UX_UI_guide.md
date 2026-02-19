# In-Time Project Hub - UI/UX & Design System Guide

Este documento serve como a fonte única da verdade para o design, UI (User Interface) e UX (User Experience) do projeto **In-Time Project Hub**.

## 1. Filosofia de Design
O projeto adota uma estética **moderna, limpa e funcional**, priorizando a usabilidade e a clareza das informações. A interface é construída sobre o framework **Tailwind CSS** em conjunto com a biblioteca de componentes **shadcn/ui**, garantindo consistência e acessibilidade.

## 2. Paleta de Cores
O sistema de cores utiliza variáveis CSS (HSL) para facilitar a manutenção e o suporte a temas (Light/Dark mode).

### 2.1. Cores Primárias e Secundárias

| Nome | Variável | Hex (aprox. Light Mode) | Descrição |
| :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `#8B1538` (Bordô/Vinho) | Cor principal da marca. Usada em botões de ação principal, estados ativos e destaques. |
| **Secondary** | `--secondary` | `#1E3A5F` (Azul Escuro) | Cor de suporte. Usada para elementos de navegação secundária e contrastes. |
| **Accent** | `--accent` | `#FCE7EC` (Pálido) | Usada para fundos de destaque sutis e interações de hover. |

### 2.2. Cores de Superfície e Fundo

| Nome | Variável | Descrição |
| :--- | :--- | :--- |
| **Background** | `--background` | Cor de fundo da página principal (`#F8FAFC` light / `#121212` dark). |
| **Surface** | `--surface` | Cor para superfícies elevadas (cards, modais, sidebars). |
| **Foreground** | `--foreground` | Cor principal do texto (`#212121`). |
| **Muted** | `--muted` | Elementos desabilitados ou de menor hierarquia. |

### 2.3. Cores Semânticas (Status)
Essenciais para o feedback do usuário, especialmente em formulários e tabelas de status.

| Estado | Token | Cor (Light) | Uso |
| :--- | :--- | :--- | :--- |
| **Success** | `--success` | `#4CAF50` (Verde) | Operações bem-sucedidas, status "Aprovado". |
| **Warning** | `--warning` | `#FF9800` (Laranja) | Alertas, atenção necessária. |
| **Destructive** | `--destructive` | `#EF4444` (Vermelho) | Ações perigosas (excluir), erros, status "Rejeitado". |
| **Info** | `--info` | `#3B82F6` (Azul) | Informações neutras, status em andamento. |

### 2.4. Cores Específicas de Domínio (Time Tracking)
Cores utilizadas especificamente para células de horas e alocação.

*   **Rascunho (Draft):** Fundo Branco, Borda Cinza.
*   **Submetido (Submitted):** Fundo Laranja Claro (`bg-warning-light`), Borda Laranja.
*   **Aprovado (Approved):** Fundo Verde Claro (`bg-success-light`), Borda Verde.
*   **Rejeitado (Rejected):** Fundo Vermelho Claro (`bg-destructive-light`), Borda Vermelha.

## 3. Tipografia
A família tipográfica principal é **Inter**.

*   **Font Family:** `Inter`, `sans-serif`
*   **Pesos:**
    *   `Regular (400)`: Texto corrido via corpo da página.
    *   `Medium (500)`: Labels e ênfases sutis.
    *   `SemiBold (600)`: Títulos e botões.
    *   `Bold (700)`: Cabeçalhos principais.

## 4. Biblioteca de Componentes (shadcn/ui)
O projeto utiliza componentes modulares baseados no **Radix UI** e estilizados com **Tailwind CSS**.

### Componentes Chave:
*   **Botões (`Button`):** Variantes `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
*   **Entradas (`Input`):** Estilizadas com bordas sutis e foco claro (`ring`).
*   **Checkboxes & Radios:** Controles de seleção nativos estilizados.
*   **Dialogs & Modals:** Para fluxos de confirmação e formulários complexos.
*   **Toasts (`sonner`):** Para notificações de feedback não bloqueantes.
*   **Cards:** Containers principais para agrupamento de conteúdo (`Card`, `CardHeader`, `CardContent`).

## 5. Layout e Espaçamento
*   **Container:** Centralizado com padding padrão (`padding: 2rem`). Max-width de `1280px`.
*   **Grid:** Utiliza `grid-pattern` para fundos sutis em áreas específicas.
*   **Border Radius:** Padronizado via variável `--radius` (`0.375rem` / `6px`), garantindo cantos levemente arredondados e modernos.

## 6. Iconografia
Recomenda-se o uso de **Lucide React** (padrão shadcn/ui) para ícones SVG consistentes e leves.

## 7. Diretrizes de UX (User Experience)

### 7.1. Feedback Visual
*   Sempre forneça feedback imediato após ações do usuário (ex: Toast após salvar).
*   Use estados de `loading` em botões durante requisições assíncronas.
*   Destaque erros de validação diretamente nos campos afetados (`border-destructive`).

### 7.2. Acessibilidade
*   Mantenha contraste adequado entre texto e fundo.
*   Todos os campos de formulário devem ter `labels` associados.
*   Elementos interativos devem ter estados de `:focus` visíveis.

### 7.3. Fluxos Comuns
*   **Navegação:** Sidebar persistente ou Menu superior para fácil acesso às seções principais.
*   **Tabelas:** Devem ter cabeçalhos fixos ou paginação clara quando houver muitos dados.
*   **Edição:** Preferência por edição inline ou modais para edições rápidas, evitando navegação excessiva.
