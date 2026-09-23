import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.__ENV for tests.
// Usamos una Lambda Function URL con slash final (como las del sandbox AWS re/Start)
// para ejercitar la normalización que hace api.ts (quita el slash final).
globalThis.window = globalThis.window || ({} as Window & typeof globalThis);
window.__ENV = {
  VITE_API_URL: 'https://test-api.lambda-url.us-east-1.on.aws/',
  // S8 · El asistente tiene su PROPIA Function URL (distinta de la del router).
  // También con slash final, para ejercitar la misma normalización.
  VITE_ASSISTANT_URL: 'https://test-assistant.lambda-url.us-east-1.on.aws/'
};

// Mock fetch globally
globalThis.fetch = vi.fn();
