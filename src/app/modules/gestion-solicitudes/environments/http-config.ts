import { gestion_solicitudes } from 'src/environments/environment';

export const httpConfig = {
    apiUrl: `${gestion_solicitudes.api_url}/gestionSolicitud`,
    apiUrlSub: `${gestion_solicitudes.api_url}/gestionSubtipos`,
    apiGesion: `${gestion_solicitudes.api_url}`,
    obtenerTiposDeSolicitudUrl: '/tiposSolicitud',
    obtenerRequisitosDeSolicitudUrl: '/requisitoSolicitud/',
    obtenerInfoPersonalSolicitanteUrl: '/obtenerInfoPersonal/',
    obtenerTutoresYDirectoresUrl: '/obtenerTutores',
    guardarSolicitudUrl: '/save',
    guardarAvalesSolicitudUrl: '/save/firmas',
    obtenerListaSolPendientesAvalUrl: '/obtener-solicitudes-pendientes/',
    obtenerInfoSolGuardadaUrl: '/obtener-datos-solicitud/',
    obtenerActividadesPracticaDocente: '/subTiposSolicitud/',
    obtenerHistorialDeSolicitudUrl: '/historial/solicitud/',
    obtenerSolicitudesCoordinacion: '/obtener-solicitudes-pendientes-coordinador/',
    obtenerConceptoComite: '/obtener-solicitudes-en-comite/',
    obtenerConceptoConsejo: '/obtener-solicitudes-en-concejo/',
    guardarConceptoComite: '/save-solicitud-en-comite',
    cambiarEstado: '/save/solicitud/',
    guardarConceptoConsejo: '/save-solicitud-en-concejo',
    rechazarSolicitud: '/rechazar-solicitud',
    enviarCorreo: '/gestionEnvioCorreo/send-email',
    consultarInfoRolExterno: '/gestion/rol-informacion/buscar?cargo=',
    guardarInfoRolExterno: '/gestion/rol-informacion/guardar',
    consultarSiEsDirector: '/solicitud/requiere-director/',
    obtenerCertificadosVotos: '/gestionSolicitud/obtener-solicitudes-certificado-votacion',
    descargarCertificadosVotos: '/gestionSolicitud/documentos-certificado-votacion/zip',
    guardarFechasSolicitudUrl: '/update/fechas',
    fechaActual: '/fechaActual',
    actualizarEstadoSolicitud: '/actualizar-estado-solicitud-cervoto'
};
