export const MATRICULA_ESTADOS = {
    APROBADA: 'APROBADA',
    RECHAZADA: 'RECHAZADA',
    CREADA: 'CREADA',
    TUTOR_AVALADA: 'TUTOR_AVALADA',
    TUTOR_NO_AVALADA: 'TUTOR_NO_AVALADA',
    CANCELADA: 'CANCELADA',
    PENDIENTE: 'PENDIENTE',
} as const;

export const MATRICULA_ESTADO_OPTIONS: { label: string; value: string }[] = [
    { label: 'Todos', value: '' },
    { label: 'Creada', value: MATRICULA_ESTADOS.CREADA },
    { label: 'Tutor avalada', value: MATRICULA_ESTADOS.TUTOR_AVALADA },
    { label: 'Tutor no avalada', value: MATRICULA_ESTADOS.TUTOR_NO_AVALADA },
    { label: 'Rechazada', value: MATRICULA_ESTADOS.RECHAZADA },
    { label: 'Aprobada', value: MATRICULA_ESTADOS.APROBADA },
    { label: 'Cancelada', value: MATRICULA_ESTADOS.CANCELADA },
];
