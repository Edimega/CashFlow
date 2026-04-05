---
description: Iniciar el entorno de desarrollo para el frontend y backend
---

Estas reglas son obligatorias y deben seguirse en cada interacción.
Este flujo de trabajo configura y arranca ambos servidores de desarrollo.
Usa terminales nuevas dentro de mi entorno de desarrollo. Siempre contesta en español

### Pasos para Iniciar

#### 1. Iniciar Frontend (Vite + React 18)
// turbo
1. Ejecuta el servidor de frontend:
```bash
npm --prefix ppamapp-front run dev -- --port 5173
```

#### 2. Abrir navegador
// turbo
1. Ejecuta el navegador:
Usar @mcp: Navegador
Ir al sitio http://localhost:5173

---

## Reglas de Trabajo para este Proyecto

## Regla 1: Identificar Scope (Front / Back / Ambos)

Antes de ejecutar cualquier tarea, determinar si aplica a:
- **Frontend** (`docu-front/`)
- **Backend** (`docu-back/`)
- **Ambos** (ej: frontend consumiendo un nuevo endpoint del backend)

**Nota sobre el Backend**: Los archivos se manejan localmente en `docu-back/`, pero la ejecución de comandos (linter, server, etc.) se realiza dentro de **Multipass**.

Si el prompt del usuario **no especifica** dónde se aplicará el cambio, **preguntar antes de proceder**.

## Regla 2: Código Profesional + Context7

Al escribir o modificar código:
1. **Siempre** aplicar las reglas del skill `professional-code` (tipado estricto, early returns, DRY, naming semántico, etc.).
2. Si se necesita consultar documentación actualizada de una librería (React, React Query, Formik, Django, etc.), usar el MCP `context7` para obtener la documentación oficial más reciente.

## Regla 3: Verificación de Linter / Tipado

Después de modificar cualquier archivo de código:
1. Ejecutar la verificación correspondiente:
   - **Frontend**: `npm run type-check` desde `docu-front/` (Local).
   - **Backend**: `multipass exec ubuntu -- python3 /home/ubuntu/repos/ppamapp/ppamapp-backend/manage.py check` (vía Multipass).
2. Si se reportan errores, corregirlos antes de dar por finalizada la tarea.

## Regla 4: Actualizar Documentación

Siempre que se modifique un archivo del proyecto:
1. Identificar si existe documentación del archivo en `docu/docu-front/` o `docu/docu-back/`.
2. Actualizar el `.md` correspondiente reflejando los cambios realizados.
3. Si el archivo no tiene documentación aún, crearla siguiendo un formato profesional (ver `professional-code/SKILL.md` como referencia).
4. Si los cambios afectan al `README.md` principal o de los sub-paquetes, actualizarlo también.
