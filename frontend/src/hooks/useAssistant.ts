import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import type { AssistantReply, ChatTurn } from '../lib/types';

/**
 * S8 · Mantiene el HILO de conversación con el asistente de compras.
 *
 * La Lambda es stateless, así que la memoria vive acá, en estado de React. Cada
 * envío manda el historial acumulado y el backend lo pasa a la Converse API de
 * Bedrock como mensajes con roles user/assistant.
 *
 * Dos decisiones que importan (y que son concepto de examen, D3):
 *
 * 1. Se guarda el mensaje LIMPIO del usuario. La Lambda envuelve el turno actual
 *    con el bloque "CATÁLOGO RELEVANTE" para el grounding, pero eso NO se
 *    reenvía: si volviera en el historial, cada turno arrastraría un catálogo
 *    viejo y los inputTokens crecerían de forma cuadrática.
 *
 * 2. Se manda una VENTANA de los últimos MAX_HISTORY_TURNS turnos, no el hilo
 *    entero. Un historial sin límite encarece cada llamada y termina chocando con
 *    la ventana de contexto del modelo. Es el mismo trade-off que TOP_K: más
 *    contexto = mejor respuesta, más tokens y más costo.
 */

// 8 turnos ≈ 4 intercambios usuario/asistente. Subilo para más memoria a cambio
// de más tokens de entrada por llamada.
export const MAX_HISTORY_TURNS = 8;

export interface ChatMessage extends ChatTurn {
  /** Productos que el backend usó como contexto (solo en turnos del asistente). */
  retrieved?: { productId: string; name: string }[];
  /** Tokens reportados por Bedrock: crece con el historial → visible el costo. */
  usage?: AssistantReply['usage'];
}

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (rawMessage: string) => {
      const message = rawMessage.trim();
      if (!message || loading) return;

      setError(null);
      setLoading(true);

      // El historial que viaja es el estado ANTERIOR a este turno: el mensaje
      // actual va aparte, en `message`, porque la Lambda lo envuelve con el
      // contexto recuperado. Mandarlo también en `history` lo duplicaría.
      const history: ChatTurn[] = messages
        .slice(-MAX_HISTORY_TURNS)
        .map(({ role, text }) => ({ role, text }));

      // Optimista: el turno del usuario se ve al instante.
      setMessages((prev) => [...prev, { role: 'user', text: message }]);

      try {
        const data = await api.askAssistant(message, history);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            retrieved: data.retrieved,
            usage: data.usage,
          },
        ]);
      } catch (err) {
        // El turno del usuario se queda en pantalla (puede reintentar sin
        // reescribirlo), pero no se agrega turno del asistente: así el historial
        // que se reenvía nunca queda con un `user` colgado sin respuesta.
        setError(err instanceof Error ? err.message : 'Error al consultar el asistente');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, send, reset };
}
