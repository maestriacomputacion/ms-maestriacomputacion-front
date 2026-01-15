// Resultado basico del buscador de estudiantes.
export type EstudianteBusqueda = {
    id?: number;
    identificacion?: string;
    codigo?: string;
    nombre?: string;
    apellido?: string;
    persona?: {
        nombre?: string;
        apellido?: string;
        tipoIdentificacion?: string;
    };
};
