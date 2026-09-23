import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAssistant, MAX_HISTORY_TURNS } from './useAssistant';
import { api } from '../lib/api';

/**
 * S8 · El hilo de conversación vive en el cliente (la Lambda es stateless).
 * Lo que se prueba acá es justamente el contrato de ese hilo.
 */
describe('useAssistant', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const reply = (text: string) => ({
    reply: text,
    retrieved: [{ productId: 'p1', name: 'Tenis blancos minimalistas' }],
    model: 'anthropic.claude-haiku-4-5-20251001-v1:0',
    usage: { inputTokens: 210, outputTokens: 58, totalTokens: 268 },
  });

  it('agrega el turno del usuario y la respuesta del asistente al hilo', async () => {
    vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('Te recomiendo los tenis.'));

    const { result } = renderHook(() => useAssistant());

    await act(async () => {
      await result.current.send('algo para caminar');
    });

    expect(result.current.messages).toEqual([
      { role: 'user', text: 'algo para caminar' },
      expect.objectContaining({ role: 'assistant', text: 'Te recomiendo los tenis.' }),
    ]);
  });

  it('el primer turno se manda con history vacío', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('ok'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('hola');
    });

    expect(spy).toHaveBeenCalledWith('hola', []);
  });

  it('reenvía el historial acumulado en el segundo turno (mantiene el hilo)', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('Respuesta 1'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('primero');
    });

    spy.mockResolvedValue(reply('Respuesta 2'));
    await act(async () => {
      await result.current.send('segundo');
    });

    expect(spy).toHaveBeenLastCalledWith('segundo', [
      { role: 'user', text: 'primero' },
      { role: 'assistant', text: 'Respuesta 1' },
    ]);
  });

  it('no incluye el mensaje actual dentro de history (evita duplicarlo)', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('ok'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('mensaje único');
    });

    const [message, history] = spy.mock.calls[0];
    expect(message).toBe('mensaje único');
    expect(history).toEqual([]);
  });

  it('recorta el historial a MAX_HISTORY_TURNS turnos', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockImplementation(async () => reply('r'));

    const { result } = renderHook(() => useAssistant());

    // 6 intercambios = 12 turnos, por encima del límite de 8.
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        await result.current.send(`turno ${i}`);
      });
    }

    const lastHistory = spy.mock.calls[spy.mock.calls.length - 1][1]!;
    expect(lastHistory.length).toBe(MAX_HISTORY_TURNS);
    // La ventana conserva los turnos MÁS RECIENTES, no los primeros.
    expect(lastHistory[lastHistory.length - 1]).toEqual({ role: 'assistant', text: 'r' });
    expect(lastHistory.some((t) => t.text === 'turno 0')).toBe(false);
  });

  it('el history solo lleva role y text (nada de retrieved ni usage)', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('con metadata'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('uno');
    });
    await act(async () => {
      await result.current.send('dos');
    });

    const history = spy.mock.calls[1][1]!;
    history.forEach((turn) => {
      expect(Object.keys(turn).sort()).toEqual(['role', 'text']);
    });
  });

  it('ante un error deja el turno del usuario pero no agrega turno del asistente', async () => {
    vi.spyOn(api, 'askAssistant').mockRejectedValue(new Error('AccessDeniedException'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('falla');
    });

    await waitFor(() => expect(result.current.error).toBe('AccessDeniedException'));
    expect(result.current.messages).toEqual([{ role: 'user', text: 'falla' }]);
  });

  it('ignora mensajes vacíos o solo espacios', async () => {
    const spy = vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('ok'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('   ');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it('reset limpia el hilo', async () => {
    vi.spyOn(api, 'askAssistant').mockResolvedValue(reply('ok'));

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('hola');
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
