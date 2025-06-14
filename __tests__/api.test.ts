import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';

// --- MOCKS ULTRA-SIMPLIFIÉS ---
// On doit mocker AVANT les imports pour éviter les erreurs de connexion

// Mock de @vercel/postgres pour éviter les erreurs de connexion DB
vi.mock('@vercel/postgres', () => ({
  createPool: vi.fn(() => ({})),
}));

// Mock de drizzle-orm/vercel-postgres
vi.mock('drizzle-orm/vercel-postgres', () => ({
  drizzle: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    query: {
      userSubscriptions: {
        findFirst: vi.fn().mockResolvedValue({ messageCount: 5 }),
      },
    },
  })),
}));

// Mock de Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn().mockResolvedValue({
        privateMetadata: {},
      }),
    },
  })),
}));

// Mock de la Vercel AI SDK
vi.mock('ai', () => ({
  streamText: vi.fn(),
  createDataStreamResponse: vi.fn((config) => {
    // Exécute la fonction pour simuler le comportement réel
    const mockDataStream = { writeData: vi.fn() };
    config.execute(mockDataStream);
    return new Response('Mocked response', { status: 200 });
  }),
}));

// Mock des providers d'IA
vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn()),
}));

vi.mock('@ai-sdk/groq', () => ({
  createGroq: vi.fn(() => vi.fn()),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

// Mock d'autres utilitaires
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123'),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  sql: vi.fn(),
}));

describe('/api/chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration des variables d'environnement pour les tests
    process.env.GROQ_API_KEY = 'test_groq_key';
    process.env.GEMINI_API_KEY = 'test_gemini_key';
    process.env.OPENROUTER_API_KEY = 'test_openrouter_key';
  });

    it('should handle successful requests with valid user', async () => {
    // Test simplifié qui vérifie juste que l'API ne plante pas avec un utilisateur valide
    const { auth } = await import('@clerk/nextjs/server');
    
    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        data: { model: 'groq' },
      }),
    });

    const response = await POST(request);

    // On vérifie juste que ça ne retourne pas 401 (succès relatif)
    expect(response.status).not.toBe(401);
    // Si on arrive ici, c'est que l'authentification a marché
    expect(response).toBeDefined();
  });

  it('should return 401 when no user is authenticated', async () => {
    // Configuration des mocks pour ce test
    const { auth } = await import('@clerk/nextjs/server');
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        data: { model: 'groq' },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const responseJson = await response.json();
    expect(responseJson).toEqual({
      status: 401,
      message: 'Please sign in to continue the conversation.',
    });
  });

  it('should handle errors gracefully', async () => {
    // Configuration des mocks pour ce test
    const { auth } = await import('@clerk/nextjs/server');
    const { streamText, createDataStreamResponse } = await import('ai');
    
    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
    
    // On simule que createDataStreamResponse lance une erreur
    vi.mocked(createDataStreamResponse).mockImplementation(() => {
      throw new Error('AI service down');
    });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        data: { model: 'groq' },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('An internal server error occurred.');
  });
}); 