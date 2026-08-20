export function getEstadoMatriculaSeverity(estaPago: boolean | undefined | null): 'success' | 'warning' | 'danger' | 'info' {
    if (estaPago === true)  return 'success';
    if (estaPago === false) return 'danger';
    return 'warning';
}

export function getEstadoMatriculaLabel(estaPago: boolean | undefined | null): string {
    if (estaPago === true)  return 'PAGADO';
    if (estaPago === false) return 'NO PAGADO';
    return 'PENDIENTE';
}
