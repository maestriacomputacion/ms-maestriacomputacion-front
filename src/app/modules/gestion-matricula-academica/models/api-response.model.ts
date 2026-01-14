// Respuesta generica de la API.
export interface ApiResponse<T> {
    typeResponse: string;
    message: string;
    data: T;
    statusCode: number;
}
