import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { useAssistant, MAX_HISTORY_TURNS } from '../hooks/useAssistant';

/**
 * S8 · Asistente de compras conversacional (RAG sobre el catálogo).
 *
 * El hilo de la conversación vive en `useAssistant` (estado de React): la Lambda
 * es stateless y el cliente reenvía el historial en cada turno.
 *
 * Se monta como panel flotante para no tocar el layout del catálogo.
 */
export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, error, send, reset } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autoscroll al último turno.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    await send(text);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir asistente de compras"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" />
        Asistente
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Asistente de compras"
      className="fixed bottom-6 right-6 z-40 flex flex-col w-[calc(100vw-3rem)] sm:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      <header className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          <div>
            <h2 className="font-semibold leading-tight">Asistente TechModa</h2>
            <p className="text-xs text-blue-100">Recomienda solo productos del catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar asistente"
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-600 font-medium mb-1">¿Qué estás buscando?</p>
            <p className="text-xs text-gray-500">
              Probá: «algo cómodo y blanco para caminar todo el día»
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Grounding visible: qué productos se usaron como contexto. */}
              {m.retrieved && m.retrieved.length > 0 && (
                <p className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  Contexto: {m.retrieved.map((p) => p.name).join(' · ')}
                </p>
              )}

              {/* Los inputTokens crecen con el historial: el costo de RAG, a la vista. */}
              {m.usage?.totalTokens != null && (
                <p className="mt-1 text-xs text-gray-400">
                  {m.usage.inputTokens} in / {m.usage.outputTokens} out
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div role="status" aria-live="polite" className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" aria-hidden="true" />
              <span className="sr-only">El asistente está escribiendo…</span>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="assistant-input" className="sr-only">
            Mensaje para el asistente
          </label>
          <input
            id="assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Escribí tu consulta…"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {messages.length > MAX_HISTORY_TURNS && (
          <p className="mt-2 text-xs text-gray-400">
            Se envían los últimos {MAX_HISTORY_TURNS} turnos como contexto.
          </p>
        )}
      </form>
    </div>
  );
}
