/**
 * Contrato de datos del catálogo.
 *
 * IMPORTANTE: estos nombres de campo deben coincidir EXACTAMENTE con lo que
 * guarda el backend en DynamoDB (camelCase). La fuente de verdad es:
 *   - la PK de la tabla:            productId   (template.yaml)
 *   - lo que persiste create-item:  functions/create-item/index.js
 *   - lo que escriben las Lambdas de IA (sessions/S0N/functions/.../app.py)
 *
 * Si agregás un campo acá, agregalo también en create-item y update-item, o se
 * descarta en silencio (el handler arma un objeto explícito, no hace passthrough).
 */
export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;

  // ---- Campos que agregan las sesiones de IA (opcionales) ----
  aiLabels?: string[];              // S1 · Rekognition DetectLabels
  aiLabelsRaw?: { name: string; confidence: number }[];
  aiModeration?: Record<string, unknown>;  // S2 · Rekognition moderación
  aiAltText?: string;               // S2 · alt-text accesible
  aiSentiment?: Record<string, unknown>;   // S3 · Comprehend
  aiTranslations?: Record<string, string>; // S4 · Translate
  aiAudioUrl?: string;              // S5 · Polly (URL prefirmada)
  aiDescription?: string;           // S6 · Bedrock
  aiEmbedding?: number[];           // S7 · Bedrock embeddings
}

/**
 * S8 · Un turno del hilo de conversación con el asistente de compras.
 *
 * IMPORTANTE: `text` guarda el mensaje LIMPIO del usuario, nunca el texto
 * aumentado con el bloque "CATÁLOGO RELEVANTE" que la Lambda arma internamente.
 * Si se reenviara el texto aumentado, cada turno arrastraría un catálogo viejo:
 * los `inputTokens` crecen de forma cuadrática y el modelo ve precios obsoletos.
 * El nombre del campo (`text`, no `content`) es el que espera app.py.
 */
export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** S8 · Respuesta de POST /assistant (shopping-assistant/app.py). */
export interface AssistantReply {
  reply: string;
  retrieved: { productId: string; name: string }[];
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}
