// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    api_url: 'http://localhost:8091/api/',

    firebaseConfig: {
        apiKey: 'AIzaSyC-Dk2Ooux-jiipoYS4ri_FRtOJjVu8WCs',
        authDomain: 'prod-maestria-computacion.firebaseapp.com',
        projectId: 'prod-maestria-computacion',
        storageBucket: 'prod-maestria-computacion.appspot.com',
        messagingSenderId: '668213860429',
        appId: '1:668213860429:web:6ca093c817a6b834f4e404',
    },
};

export const gestion_solicitudes = {
    production: false,
    api_url: 'http://localhost:8095/msmaestriac',
};

export const gestion_autenticacion = {
    production: false,
    api_url: 'http://localhost:8096/api/auth/google',
};

export const dev_login = {
    production: false,
    api_url: 'http://localhost:8080/api/',
};

export const gestion_expertos = {
    production: false,
    api_url: 'http://localhost:8082/api/',
};

export const gestion_egresados = {
    production: false,
    api_url: 'http://localhost:8084/api/',
};

export const gestion_trabajo_grado = {
    production: false,
    api_url: 'http://localhost:8083/api/',
};

export const gestion_docentes_estudiantes = {
    production: false,
    api_url: 'http://localhost:8082/api/',
};

export const evaluacion_docente = {
    production: false,
    api_url: 'http://localhost:8086/api/',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
