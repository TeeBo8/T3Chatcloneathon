# Frontend Guidelines

## 1. Component Library
- **Primary Library:** `shadcn/ui`. We will use the CLI to add components as needed.
- **Initial Components:** `Button`, `Input`, `ScrollArea`, `Avatar`, `Tooltip`, `Sheet` (for mobile sidebar), `Card`.
- **Custom Components:** All custom-built components will reside in `src/components/custom`.

## 2. Styling
- **Framework:** Tailwind CSS.
- **Methodology:** Utility-first. Avoid custom CSS files whenever possible.
- **Variables:** Use CSS variables defined in `globals.css` for theming (colors, radii) as managed by `shadcn/ui`.

## 3. State Management
- **Local State:** Use React's `useState` and `useReducer` for component-level state.
- **Global State:** For simple global state (like theme), use React `useContext`.
- **AI Chat State:** Leverage the hooks provided by the Vercel AI SDK (`useChat`) for managing messages, input, and submission.

## 4. Code Style & Linting
- **Enforcement:** ESLint and Prettier are pre-configured. All code must pass linting checks.
- **Naming Convention:** Components will be PascalCase (`ChatMessage`). Functions and variables will be camelCase (`sendMessage`). 