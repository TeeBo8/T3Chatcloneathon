# File Structure

```
/
├── /docs/                # Project documentation (you are here)
├── /public/              # Static assets (images, fonts, etc.)
├── /src/
│   ├── /app/             # App Router: layouts, pages, and API routes
│   │   ├── /api/
│   │   │   └── /chat/
│   │   │       └── route.ts  # The main backend endpoint for the chat
│   │   ├── /chat/
│   │   │   ├── /[chatId]/
│   │   │   │   └── page.tsx  # Page for a specific chat
│   │   │   └── page.tsx      # Page for a new chat
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing/home page
│   ├── /components/
│   │   ├── /custom/        # Our own composite components (e.g., ChatWindow, Sidebar)
│   │   └── /ui/            # Components from shadcn/ui (auto-generated)
│   ├── /lib/
│   │   ├── /auth.ts        # Auth.js configuration
│   │   ├── /db/
│   │   │   ├── index.ts    # Drizzle client instance
│   │   │   └── schema.ts   # Database table schemas
│   │   ├── /groq.ts        # Groq client setup
│   │   └── /utils.ts       # Utility functions
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout (renamed from app/layout.tsx if src is used)
├── .env.local            # Environment variables (API keys, etc.)
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
``` 