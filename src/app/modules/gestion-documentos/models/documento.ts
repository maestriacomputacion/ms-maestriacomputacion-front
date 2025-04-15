export class Documento {
    // Propiedades para el formulario
    selectedOption: string;
    fechaAprobacion: string;
    base64File: any = []; // En esta propiedad almacenaremos el archivo en base64

    //Variables para actas
    numeroActa: number;

    //Variables para el oficio
    numeroOficio: number;
    asunto: string;

    //Variables para Otros
    nombreDocumento: string;
    versionDoc: string;
    descripcionDocumento: string;

    estado:boolean;
}
