# Plan de tareas — `<título del proyecto>`

> Cópiala a `specs/03-tasks.md` y llénala en la fase Plan (`/epcc-plan`).
> Tareas pequeñas, ordenadas y verificables. Cada una se implementa con `/epcc-code` y se
> commitea con `/epcc-commit`. Marca `- [x]` al terminar.

## Fase A — Cimientos
- [ ] A1. Crear estructura del proyecto y `README` propio · _(ref: setup)_
- [ ] A2. Configurar acceso a Bedrock y probar una invocación mínima con Converse API · _(ref: RF-1)_
- [ ] A3. Definir el system prompt base · _(ref: RF-1, diseño §3)_

## Fase B — Funcionalidad central
- [ ] B1. `<implementar caso de uso principal>` · _(ref: RF-1)_
- [ ] B2. `<manejo de entrada/salida>` · _(ref: RF-2)_
- [ ] B3. Manejo de errores (modelo no disponible, throttling) · _(ref: RNF-1, diseño §5)_

## Fase C — IA responsable y seguridad
- [ ] C1. Implementar mitigaciones de IA responsable · _(ref: RNF-2, diseño §6)_
- [ ] C2. Verificar IAM de mínimo privilegio y manejo de secretos · _(ref: RNF-3, diseño §7)_

## Fase D — Validación y entrega
- [ ] D1. Probar contra todos los criterios de aceptación de `01-requirements.md`
- [ ] D2. Documentar costo real estimado · _(ref: diseño §8)_
- [ ] D3. Pulir `README` del proyecto con instrucciones de ejecución
- [ ] D4. Revisión final del historial de commits (evidencia EPCC)

---

### Registro de desviaciones
> Si al implementar descubres que el diseño estaba mal, anótalo aquí y corrige la spec antes de seguir.

| Fecha | Tarea | Qué cambió respecto al plan | Spec actualizada |
|-------|-------|------------------------------|------------------|
| | | | |
