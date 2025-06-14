import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/(main)/page'; // On cible la nouvelle page d'accueil

// Mock des dépendances client
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false, openSignIn: vi.fn() }),
  useUser: () => ({ isSignedIn: false, user: null }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  UserButton: () => <div>User Button Mock</div>,
}));

// Mock des hooks React utilisés
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock du composant ChatWindow
vi.mock('@/components/custom/chat-window', () => ({
  ChatWindow: ({ chatId, initialMessages }: { chatId: string; initialMessages: any[] }) => (
    <div data-testid="chat-window">
      <h1>How can I help you, choom?</h1>
      <button>The World of Night City</button>
      <div>Chat ID: {chatId}</div>
      <div>Initial messages: {initialMessages.length}</div>
    </div>
  ),
}));

describe('Homepage (Chat Interface)', () => {
  it('should render the empty state for a logged-out user', async () => {
    const HomePageComponent = await HomePage();
    render(HomePageComponent);
    
    // On vérifie que le titre de l'empty state est présent
    const heading = screen.getByRole('heading', {
      name: /How can I help you, choom\?/i,
    });
    expect(heading).toBeInTheDocument();

    // On vérifie qu'un des boutons de suggestion est là
    const suggestionButton = screen.getByRole('button', {
      name: /The World of Night City/i,
    });
    expect(suggestionButton).toBeInTheDocument();
  });
}); 