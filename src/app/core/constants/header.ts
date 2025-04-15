import { HttpHeaders } from "@angular/common/http";

export function getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
