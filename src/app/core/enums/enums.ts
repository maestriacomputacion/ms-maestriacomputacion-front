export enum Mensaje {
    REGISTRO_ESTUDIANTES_EXITOSO = 'Estudiantes cargados exitosamente',
    ERROR_CARGAR_ESTUDIANTES = 'Carga de estudiantes fallida. Verifica los datos e intenta nuevamente',
    REGISTRE_CAMPOS_OBLIGATORIOS = 'Completa los campos marcados como obligatorios (*)',
    ESTUDIANTE_ELIMINADO_CORRECTAMENTE = 'Estudiante eliminado correctamente',
    CONFIRMAR_ELIMINAR_ESTUDIANTE = '¿Está seguro de eliminar este estudiante?',
    CONFIRMAR_SALIR_SIN_GUARDAR = 'La información no ha sido guardada, ¿Desea salir?',
    REGISTRO_DOCENTES_EXITOSO = 'Docentes cargados exitosamente',
    ERROR_CARGAR_DOCENTESS = 'Carga de docentes fallida. Verifica los datos e intenta nuevamente',
    DOCENTE_ELIMINADO_CORRECTAMENTE = 'Docente eliminado correctamente',
    CONFIRMAR_ELIMINAR_DOCENTE = '¿Está seguro de eliminar este docente?',
    ACTUALIZACION_EXITOSA = 'El registro fue actualizado exitosamente',
    GUARDADO_EXITOSO = 'Los datos han sido guardados exitosamente',

    CONFIRMAR_DESACTIVAR_PREGUNTA = "¿Está seguro de desactivar esta pregunta?",
    PREGUNTA_DESACTIVADA_CORRECTAMENTE = "Pregunta desactivada correctamente",
    ESTADO_PREGUNTA_ACTUALIZADO_CORRECTAMENTE = "Estado de la pregunta actualizado correctamente",

    CONFIRMAR_DESACTIVAR_CUESTIONARIO = "¿Está seguro de desactivar este cuestionario?",
    CUESTIONARIO_DESACTIVADO_CORRECTAMENTE   = "Cuestionario desactivado correctamente",
    ESTADO_CUESTIONARIO_ACTUALIZADO_CORRECTAMENTE = "Estado del cuestionario actualizado correctamente",
}

export enum Aviso {
    CURSO_ELIMINADO_CORRECTAMENTE = 'Curso eliminado correctamente',
    EMPRESA_ELIMINADA_CORRECTAMENTE = 'Empresa eliminada correctamente',

    RESPUESTA_ELIMINADA_CORRECTAMENTE = 'Respuesta eliminada correctamente',
    RESPUESTA_GUARDADA_CORRECTAMENTE = 'Respuesta cargada correctamente',
    RESPUESTA_ACTUALIZADA_CORRECTAMENTE = 'Respuesta actualizada correctamente',

    SOLICITUD_SIN_MODIFICAR = 'Selecciona modificar informacion (*)',
    SOLICITUD_CANCELADA_CORRECTAMENTE = 'Solicitud cancelada correctamente',

    CREDENCIALES_INCORRECTAS = 'Credenciales incorrectas',
    CORREGIR_CAMPOS_OBLIGATORIOS = 'Con correciones pendientes',
    CAMPOS_COORDINADOR_PENDIENTE = 'Pendiente subir informacion de coordinador (*)',
    CAMPOS_DOCENTE_PENDIENTE = 'Pendiente subir informacion de docente (*)',

    CONFIRMAR_CANCELAR_SOLICITUD = '¿Está seguro de cancelar esta solicitud?',
    CONFIRMAR_ELIMINAR_REGISTRO = '¿Está seguro de eliminar este registro?',
    ARCHIVO_ELIMINADO_CORRECTAMENTE = 'Archivo eliminado correctamente',
    ARCHIVO_DEMASIADO_GRANDE = 'El tamaño del archivo excede el límite máximo de 5 MB.',
}

export enum EstadoProceso {
    SIN_REGISTRAR_SOLICITUD_EXAMEN_DE_VALORACION = 'Sin registrar SOLICITUD EXAMEN DE VALORACIÓN por parte del DOCENTE.',
    PENDIENTE_REVISION_COORDINADOR = 'Pendiente revisión de archivos para la SOLICITUD EXAMEN DE VALORACIÓN por parte del COORDINADOR.',
    DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR = 'Se ha devuelto la SOLICITUD EXAMEN DE VALORACIÓN para realizar correcciones solicitadas del COORDINADOR.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR = 'Pendiente cargue de información por parte del COORDINADOR con respuesta del COMITE sobre la SOLICITUD EXAMEN DE VALORACIÓN.',
    DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE = 'Se ha devuelto la SOLICITUD EXAMEN DE VALORACIÓN para realizar correcciones solicitadas por el COMITE.',
    PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION = 'Pendiente RESPUESTA EXAMEN DE VALORACIÓN por parte de los EVALUADORES.',
    EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_1 = 'Examen de valoración APROBADO por un EVALUADOR.',
    EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2 = 'Examen de valoración APROBADO por los dos EVALUADORES. Pendiente registro de información por parte del DOCENTE para GENERACION RESOLUCIÓN.',
    EXAMEN_DE_VALORACION_NO_APROBADO_EVALUADOR_1 = 'Examen de valoración NO APROBADO por un EVALUADOR.',
    EXAMEN_DE_VALORACION_NO_APROBADO_EVALUADOR_2 = 'Examen de valoración NO APROBADO por ambos EVALUADORES.',
    EXAMEN_DE_VALORACION_APLAZADO_EVALUADOR_1 = 'Examen de valoración APLAZADO por un EVALUADOR.',
    EXAMEN_DE_VALORACION_APLAZADO_EVALUADOR_2 = 'Examen de valoración APLAZADO por ambos EVALUADORES.',
    EXAMEN_DE_VALORACION_APROBADO_Y_NO_APROBADO_EVALUADOR = 'Examen de valoración APROBADO por un EVALUADOR y NO APROBADO por otro.',
    EXAMEN_DE_VALORACION_APROBADO_Y_APLAZADO = 'Examen de valoración APROBADO por un EVALUADOR y APLAZADO por otro.',
    EXAMEN_DE_VALORACION_NO_APROBADO_Y_APLAZADO = 'Examen de valoración NO APROBADO por un EVALUADOR y APLAZADO por otro.',
    EXAMEN_DE_VALORACION_CANCELADO = 'Examen de valoración CANCELADO debido a que se recibieron 4 NO APROBADO por parte de los EVALUADORES.',
    EXAMEN_DE_VALORACION_NO_ACTUALIZADO = 'Se esta registrando concepto APROBADO para el examen de valoración, pero el DOCENTE no ha cargado la información actualizada.',
    EXAMEN_DE_VALORACION_ACTUALIZADO = 'Examen de valoración actualizado, a la espera del registro del COORDINADOR.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION = 'Pendiente revisión de archivos para la GENERACION RESOLUCIÓN por parte del COORDINADOR.',
    DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR = 'Se ha devuelto la GENERACION RESOLUCIÓN para realizar correcciones solicitadas del COORDINADOR.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION = 'Pendiente cargue de información por parte del COORDINADOR con respuesta del COMITE sobre la GENERACION RESOLUCIÓN.',
    DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE = 'Se ha devuelto la GENERACION RESOLUCIÓN. para realizar correcciones solicitadas por el COMITE.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION = 'Pendiente cargue de información por parte del COORDINADOR con respuesta del CONSEJO sobre la GENERACION RESOLUCIÓN.',
    PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION = 'Pendiente registro de información por parte del DOCENTE para la SUSTENTACIÓN.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION = 'Pendiente revisión de archivos para la SUSTENTACIÓN por parte del COORDINADOR.',
    DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR = 'Se ha devuelto la SUSTENTACIÓN para realizar correcciones solicitadas del COORDINADOR.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION = 'Pendiente cargue de información por parte del COORDINADOR con respuesta del COMITE sobre la SUSTENTACIÓN.',
    DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE = 'Se ha devuelto la SUSTENTACIÓN para realizar correcciones solicitadas por el COMITE.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION = 'Pendiente cargue de información por parte del COORDINADOR con respuesta del CONSEJO sobre la SUSTENTACIÓN.',
    PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION = 'Pendiente registro de información por parte del ESTUDIANTE para la SUSTENTACIÓN.',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION = 'Pendiente cargue de información por parte del COORDINADOR para finalización SUSTENTACIÓN',
    SUSTENTACION_APROBADA = 'Sustentación APROBADA. Trabajo de grado finalizado con éxito',
    SUSTENTACION_NO_APROBADA = 'Sustentación no APROBADA. Trabajo de grado finalizado.',
    SUSTENTACION_APLAZADA = 'Sustentación APLAZADA. Trabajo de grado en espera.',
    CANCELADO_TRABAJO_GRADO = 'El trabajo de grado ha sido cancelado de forma DEFINITIVA por el COORDINADOR.',
    EVALUADOR_NO_RESPONDIO = 'Uno o ambos evaluadores no dieron respuesta al EXAMEN DE VALORACIÓN',
    SUSTENTACION_APROBADA_CON_OBSERVACIONES = 'Sustentación APROBADA con OBSERVACIONES. Trabajo de grado en espera.',
}

export enum EstadoEmpresa {
    LABORA_ACTUALMENTE = 'Labora actualmente en la empresa',
    CONTRATO_FINALIZADO = 'Contrato finalizado',
}

export enum Rol {
    ASESOR = 'Asesor',
}

export enum TipoRol {
    INTERNO = 'Interno',
    EXTERNO = 'Externo',


    REGISTRO_EXPERTOS_EXITOSO = 'Expertos cargados exitosamente',
    ERROR_CARGAR_EXPERTOS = 'Carga de docentes fallida. Verifica los datos e intenta nuevamente',
    CONFIRMAR_DESACTIVAR_EXPERTO = '¿Está seguro de desactivar este experto?',
    EXPERTO_DESACTIVADO_CORRECTAMENTE = 'Experto desactivado correctamente',
    ESTADO_EXPERTO_ACTUALIZADO_CORRECTAMENTE = '¿Está seguro de cambiar el estado del experto?',

    CONFIRMAR_DESACTIVAR_CATEGORIA = '¿Está seguro de desactivar esta categoría?',
    CATEGORIA_DESACTIVADA_CORRECTAMENTE = 'Categoría desactivada correctamente',
    ESTADO_CATEGORIA_ACTUALIZADO_CORRECTAMENTE = '¿Está seguro de cambiar el estado de la categoría?',

    CONFIRMAR_DESACTIVAR_LINEA = '¿Está seguro de desactivar esta línea de investigación?',
    LINEA_DESACTIVADA_CORRECTAMENTE = 'Línea desactivada correctamente',
    ESTADO_LINEA_ACTUALIZADO_CORRECTAMENTE = '¿Está seguro de cambiar el estado de la línea de investigación?',
}
