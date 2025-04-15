import { Categoria } from './categoria';
export interface Linea {
    id?: number;
    titulo: string;
    idCategoria: number | null;
    estado?: string;
    categoria?: Categoria; // Agrega la relación con la categoría para mostrar su nombre
    descripcion?: string;
}
