-- ============================================
-- MIGRACIÓN: Subproyectos (jerarquía de proyectos)
-- ============================================
-- Descripción: Añade una relación padre-hijo a la tabla `proyectos`
-- para permitir que un proyecto contenga subproyectos.
--
-- La estrategia es autorreferencial: añadimos `parent_id` a `proyectos`
-- que apunta a `proyectos.id`. Un subproyecto ES un proyecto, solo que
-- tiene un padre.
--
-- Para ejecutar en el SQL Editor de Supabase Dashboard.
-- ============================================

-- ============================================
-- PASO 1: Añadir columna parent_id
-- ============================================
-- ON DELETE SET NULL: si se elimina un proyecto padre,
-- los subproyectos pasan a ser proyectos raíz (sin padre).
ALTER TABLE public.proyectos
ADD COLUMN parent_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL;

-- ============================================
-- PASO 2: Índice para búsquedas rápidas por padre
-- ============================================
CREATE INDEX IF NOT EXISTS idx_proyectos_parent_id
ON public.proyectos(parent_id);

-- ============================================
-- PASO 3: Vista jerárquica (recursiva)
-- ============================================
-- Muestra todos los proyectos con su nivel y ruta completa.
-- Útil para selects en el frontend.
CREATE OR REPLACE VIEW public.vista_proyectos_jerarquia AS
WITH RECURSIVE project_tree AS (
  -- Ancla: proyectos raíz (sin padre)
  SELECT
    id,
    nombre,
    descripcion,
    lugar,
    parent_id,
    nombre AS path_nombre,
    0 AS nivel,
    ARRAY[id] AS path_ids
  FROM public.proyectos
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursión: subproyectos
  SELECT
    p.id,
    p.nombre,
    p.descripcion,
    p.lugar,
    p.parent_id,
    CONCAT(pt.path_nombre, ' > ', p.nombre) AS path_nombre,
    pt.nivel + 1 AS nivel,
    pt.path_ids || p.id AS path_ids
  FROM public.proyectos p
  JOIN project_tree pt ON p.parent_id = pt.id
)
SELECT * FROM project_tree
ORDER BY path_nombre;

-- ============================================
-- PASO 4: Función para obtener subproyectos directos
-- ============================================
CREATE OR REPLACE FUNCTION public.get_subproyectos(project_id UUID)
RETURNS SETOF public.proyectos
LANGUAGE SQL
STABLE
AS $$
  SELECT * FROM public.proyectos
  WHERE parent_id = project_id
  ORDER BY nombre;
$$;

-- ============================================
-- PASO 5: Función para obtener la ruta completa de un proyecto
-- ============================================
-- Ejemplo: "Obra > Reforma > Cocina"
CREATE OR REPLACE FUNCTION public.get_proyecto_path(project_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE project_ancestors AS (
    SELECT id, nombre, parent_id, 0 AS depth
    FROM public.proyectos
    WHERE id = project_id

    UNION ALL

    SELECT p.id, p.nombre, p.parent_id, pa.depth + 1
    FROM public.proyectos p
    JOIN project_ancestors pa ON p.id = pa.parent_id
  )
  SELECT STRING_AGG(nombre, ' > ' ORDER BY depth DESC)
  FROM project_ancestors;
$$;

-- ============================================
-- PASO 6: Disparador para evitar referencias circulares
-- ============================================
-- Evita que un proyecto se asigne como padre de sí mismo
-- o que se cree un ciclo (A -> B -> C -> A).
CREATE OR REPLACE FUNCTION public.check_circular_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Caso 1: No puede ser padre de sí mismo
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'Un proyecto no puede ser padre de sí mismo';
    END IF;

    -- Caso 2: No puede crear ciclos (recorrer hacia arriba)
    WITH RECURSIVE ancestors AS (
      SELECT id, parent_id
      FROM public.proyectos
      WHERE id = NEW.parent_id

      UNION ALL

      SELECT p.id, p.parent_id
      FROM public.proyectos p
      JOIN ancestors a ON p.id = a.parent_id
    )
    SELECT id FROM ancestors WHERE id = NEW.id
    INTO NEW.id;

    IF FOUND THEN
      RAISE EXCEPTION 'No se puede crear una referencia circular entre proyectos';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_check_circular_parent
  BEFORE INSERT OR UPDATE OF parent_id
  ON public.proyectos
  FOR EACH ROW
  EXECUTE FUNCTION public.check_circular_parent();

-- ============================================
-- PASO 7: Políticas de Seguridad (RLS)
-- ============================================
-- Si ya tienes RLS habilitado en `proyectos`, las políticas existentes
-- ya cubren SELECT/INSERT/UPDATE/DELETE. Asegúrate de que la política
-- de UPDATE permita modificar `parent_id`:
--
-- Ejemplo de política UPDATE (si usas una política genérica):
--   CREATE POLICY "Usuarios autenticados pueden actualizar proyectos"
--   ON public.proyectos FOR UPDATE
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
--
-- Si NO tienes RLS habilitado, puedes habilitarlo:
--   ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
--
-- Y crear políticas básicas:
--   CREATE POLICY "Todos los usuarios autenticados pueden leer proyectos"
--   ON public.proyectos FOR SELECT
--   USING (auth.role() = 'authenticated');
--
--   CREATE POLICY "Todos los usuarios autenticados pueden insertar proyectos"
--   ON public.proyectos FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');
--
--   CREATE POLICY "Todos los usuarios autenticados pueden actualizar proyectos"
--   ON public.proyectos FOR UPDATE
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
--
--   CREATE POLICY "Todos los usuarios autenticados pueden eliminar proyectos"
--   ON public.proyectos FOR DELETE
--   USING (auth.role() = 'authenticated');

-- ============================================
-- PASO 8: Verificación
-- ============================================
-- Para probar que todo funciona:
--
-- -- Insertar proyecto raíz
-- INSERT INTO public.proyectos (nombre, descripcion, lugar)
-- VALUES ('Obra Nueva', 'Reforma integral', 'Barcelona');
--
-- -- Insertar subproyecto (usar el ID devuelto arriba)
-- INSERT INTO public.proyectos (nombre, descripcion, lugar, parent_id)
-- VALUES ('Cocina', 'Cocina completa', 'Barcelona', '<id_del_proyecto_raiz>');
--
-- -- Ver jerarquía
-- SELECT * FROM public.vista_proyectos_jerarquia;
--
-- -- Ver ruta de un subproyecto
-- SELECT public.get_proyecto_path('<id_del_subproyecto>');

-- ============================================
-- NOTAS: Integración con time_entries
-- ============================================
-- La tabla `time_entries` ya tiene `project_id` -> `proyectos.id`.
-- Como los subproyectos SON proyectos (misma tabla), NO hace falta
-- modificar `time_entries`. Simplemente se asigna el `project_id`
-- al ID del subproyecto directamente.
--
-- Ejemplo en SQL:
--   INSERT INTO time_entries (date, name, entry_time, exit_time, comment, project_id)
--   VALUES ('2026-06-12', 'Pere Ribalta', '09:00', '13:00', 'Trabajando en cocina', '<id_subproyecto>');
