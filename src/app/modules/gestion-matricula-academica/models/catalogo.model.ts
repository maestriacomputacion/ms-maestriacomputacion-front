import { CursoUI } from './curso.model';

// Opcion generica para combos de catalogo.
export type CatalogoOption = { label: string; value: string };

// Evento minimo para cambio de tab.
export type TabChangeEvent = { index?: number };

// Agrupacion de cursos por asignatura para el UI.
export type CursoAgrupado = { asignatura: string; cursos: CursoUI[] };
