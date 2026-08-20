export interface ApiError {
    codigoError: string;
    mensaje: string;
    codigoHttp: number;
    url: string;
    metodo: string;
}

export interface ApiErrorResponse {
    error: ApiError;
    timestamp?: string;
}




