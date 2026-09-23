import type { AssistantReply, ChatTurn, Product } from './types';

// Runtime environment configuration (injected at deployment time)
declare global {
  interface Window {
    __ENV?: {
      VITE_API_URL?: string;
      VITE_ASSISTANT_URL?: string;
    };
  }
}

// Get API URL from runtime config (priority) or build-time env variable
// Priority: window.__ENV (runtime) > import.meta.env (build-time) > fallback
//
// En el sandbox AWS re/Start NO hay API Gateway: la base es una Lambda Function
// URL (https://<id>.lambda-url.<region>.on.aws/). Esa URL termina en '/', así que
// la normalizamos quitando el slash final para que `${API_URL}/products` no genere
// un doble slash. (El router tolera el doble slash igual, pero mantenemos URLs limpias.)
const RAW_API_URL =
  window.__ENV?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://your-function-url-id.lambda-url.us-east-1.on.aws';

const API_URL = RAW_API_URL.replace(/\/+$/, '');

// S8 · El asistente de compras NO cuelga del router: es una Lambda aparte con su
// PROPIA Function URL (output `ShoppingAssistantUrl` del stack). Por eso necesita
// su propia variable y no se puede derivar de API_URL.
//
// Queda vacío a propósito si S8 no está desplegado: `assistantEnabled` devuelve
// false y la UI no monta el chat, en vez de fallar con un fetch a una URL inválida.
const RAW_ASSISTANT_URL =
  window.__ENV?.VITE_ASSISTANT_URL || import.meta.env.VITE_ASSISTANT_URL || '';

const ASSISTANT_URL = RAW_ASSISTANT_URL.replace(/\/+$/, '');

// Log the API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
  console.log('Assistant URL:', ASSISTANT_URL || '(S8 no configurado)');
  console.log('Runtime config:', window.__ENV);
  console.log('Build-time config:', import.meta.env.VITE_API_URL);
}

export const api = {
  // List all products
  async listProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // API returns {products: [...]}
    return data.products || [];
  },

  // Get a single product
  async getProduct(productId: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new product
  async createProduct(product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Update a product
  async updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a product
  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  },

  // ---- S8 · Asistente de compras (RAG) ----

  /** ¿Está configurada la Function URL de S8? Si no, la UI no monta el chat. */
  assistantEnabled(): boolean {
    return ASSISTANT_URL !== '';
  },

  /**
   * S8 · Manda un turno al asistente de compras.
   *
   * La Lambda es STATELESS: no guarda nada entre invocaciones. El hilo de la
   * conversación se mantiene porque el cliente reenvía `history` completo en cada
   * turno — ese es el patrón que enseña la sesión (los FM no tienen memoria; el
   * contexto se reenvía y por eso se paga en tokens de entrada).
   */
  async askAssistant(message: string, history: ChatTurn[] = []): Promise<AssistantReply> {
    if (!ASSISTANT_URL) {
      throw new Error(
        'Asistente no configurado: falta VITE_ASSISTANT_URL (output ShoppingAssistantUrl del stack).'
      );
    }

    const response = await fetch(`${ASSISTANT_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      // El handler devuelve {error, detail, hint} en 400/502: el `hint` es lo
      // útil para el estudiante (¿habilitaste el modelo? ¿corriste S7?).
      let detail = `Error ${response.status}: ${response.statusText}`;
      try {
        const body = await response.json();
        if (body?.error) {
          detail = body.hint ? `${body.error} — ${body.hint}` : body.error;
        }
      } catch {
        // respuesta sin JSON: nos quedamos con el status
      }
      throw new Error(detail);
    }

    return response.json();
  },
};
