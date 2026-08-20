import { ApiError } from "./api-error";

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    success: boolean;
    timestamp?: string;
}




