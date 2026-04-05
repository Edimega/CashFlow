#!/usr/bin/env bash
# sync-config.sh
# Crea/actualiza enlaces simbólicos desde .windsurf hacia .agent (Antigravity)
# Uso: ./sync-config.sh
# Es idempotente: puede ejecutarse múltiples veces sin problemas.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WINDSURF_DIR="$SCRIPT_DIR/.windsurf"
AGENT_DIR="$SCRIPT_DIR/.agent"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✔${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✖${NC} $1"; }

# ── Verificar que .windsurf existe ────────────────────────────────────────────
if [ ! -d "$WINDSURF_DIR" ]; then
  fail ".windsurf/ no encontrado en $SCRIPT_DIR"
  exit 1
fi

echo "Sincronizando .windsurf → .agent ..."

# ── Crear .agent si no existe ─────────────────────────────────────────────────
mkdir -p "$AGENT_DIR"

# ── Directorios a enlazar ─────────────────────────────────────────────────────
# Agregar nuevos directorios aquí para extender la sincronización:
DIRS_TO_LINK=("workflows" "skills")

for dir in "${DIRS_TO_LINK[@]}"; do
  src="../.windsurf/$dir"
  dest="$AGENT_DIR/$dir"

  if [ ! -d "$WINDSURF_DIR/$dir" ]; then
    warn "$dir/ no existe en .windsurf — omitido"
    continue
  fi

  if [ -L "$dest" ]; then
    # Ya es un symlink, verificar que apunta al lugar correcto
    current_target="$(readlink "$dest")"
    if [ "$current_target" = "$src" ]; then
      ok "$dir → ya enlazado correctamente"
    else
      ln -sfn "$src" "$dest"
      ok "$dir → re-enlazado (antes: $current_target)"
    fi
  elif [ -e "$dest" ]; then
    fail "$dir → existe pero NO es un symlink. Revisa manualmente."
  else
    ln -sfn "$src" "$dest"
    ok "$dir → enlace creado"
  fi
done

# ── GEMINI.md: concatenar todas las reglas para Antigravity ───────────────────
RULES_DEST="$SCRIPT_DIR/GEMINI.md"
RULES_DIR="$WINDSURF_DIR/workflows"
HEADER="# ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE por sync-config.sh
# No editar directamente. Editar los archivos en .windsurf/workflows/
"

rule_files=("$RULES_DIR"/*.md)

if [ ${#rule_files[@]} -eq 0 ] || [ ! -e "${rule_files[0]}" ]; then
  warn "No se encontraron archivos .md en .windsurf/workflows/ — GEMINI.md omitido"
else
  # Eliminar symlink previo si existe
  [ -L "$RULES_DEST" ] && rm "$RULES_DEST"

  # Concatenar todos los archivos de reglas
  echo "$HEADER" > "$RULES_DEST"
  first=true
  for rule_file in "${rule_files[@]}"; do
    if [ "$first" = true ]; then
      first=false
    else
      echo -e "\n---\n" >> "$RULES_DEST"
    fi
    cat "$rule_file" >> "$RULES_DEST"
  done

  ok "GEMINI.md → generado con ${#rule_files[@]} archivo(s) de reglas:"
  for rule_file in "${rule_files[@]}"; do
    echo "       • $(basename "$rule_file")"
  done
fi

echo ""
echo "Listo. Estado actual:"
echo ""
echo ".agent/:"
ls -la "$AGENT_DIR"
