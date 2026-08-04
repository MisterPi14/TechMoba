#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# post-create.sh — se ejecuta UNA vez al crear el Codespace.
# Instala Claude Code, uv (runtime de los MCP servers de AWS) y dependencias.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "▶ [1/4] Instalando Claude Code…"
npm install -g @anthropic-ai/claude-code

echo "▶ [2/4] Instalando uv (gestor que ejecuta los MCP servers de AWS)…"
curl -LsSf https://astral.sh/uv/install.sh | sh
# Asegura que uv quede en el PATH de futuras shells
if ! grep -q 'astral.sh\|/.local/bin' "$HOME/.bashrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi
export PATH="$HOME/.local/bin:$PATH"

echo "▶ [3/4] Instalando dependencias del sistema (graphviz para diagramas de arquitectura)…"
sudo apt-get update -y >/dev/null 2>&1 && sudo apt-get install -y graphviz >/dev/null 2>&1 || \
  echo "  (graphviz no se pudo instalar automáticamente; el MCP de diagramas lo pedirá si lo usas)"

echo "▶ [4/4] Pre-descargando los MCP servers de AWS (cachea para el primer arranque)…"
uvx awslabs.aws-documentation-mcp-server@latest --help >/dev/null 2>&1 || true
uvx awslabs.aws-diagram-mcp-server@latest         --help >/dev/null 2>&1 || true

cat <<'EOF'

✅ Entorno listo.

Siguientes pasos (ver README.md):
  1. Configura el secret AWS_BEARER_TOKEN_BEDROCK en GitHub Codespaces.
  2. Verifica el acceso:  aws bedrock list-foundation-models --query 'length(modelSummaries)'
  3. Lanza Claude Code:   claude
  4. Arranca tu capstone: /epcc-explore   (ver docs/EPCC-WORKFLOW.md)

EOF
