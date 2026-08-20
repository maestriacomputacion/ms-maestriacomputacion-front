export interface GastoGeneralDTORespuesta {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
}

export interface GastoGeneralDTOPeticion {
    categoria: string;
    descripcion: string;
    monto: number;
    idConfiguracionReporteGrupos: number;
}
