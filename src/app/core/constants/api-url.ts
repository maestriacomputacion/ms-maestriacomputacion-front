import {
    environment,
    gestion_solicitudes,
    gestion_autenticacion,
    gestion_expertos,
    gestion_egresados,
    gestion_trabajo_grado,
    gestion_docentes_estudiantes,
    evaluacion_docente,
} from 'src/environments/environment';

export function backend(path: string): string {
    return environment.api_url.concat(path);
}

export function backendGestionExpertos(path: string): string {
    return gestion_expertos.api_url.concat(path);
}

export function backendGestionEgresados(path: string): string {
    return gestion_egresados.api_url.concat(path);
}

export function backendGestionTrabajoDeGrado(path: string): string {
    return gestion_trabajo_grado.api_url.concat(path);
}

export function backendGestionDocentesEstudiantes(path: string): string {
    return gestion_docentes_estudiantes.api_url.concat(path);
}

export function backendGestionSolicitudes(path: string): string {
    return gestion_solicitudes.api_url.concat(path);
}

export function backendGestionAutenticacion(path: string): string {
    return gestion_autenticacion.api_url.concat(path);
}

export function backendEvalucionDocente(path: string): string {
    return evaluacion_docente.api_url.concat(path);
}
