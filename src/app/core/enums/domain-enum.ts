export enum EstadoMastria {
    RETIRADO = 'Retirado',
    ACTIVO = 'Activo',
    MAESTRIA_FINALIZADA = 'Finalizó la maestria',
    EN_SUSPENSION = 'En suspención',
}

export enum TipoIdentificacion {
    CEDULA_CIUDADANIA = 'Cédula de ciudadanía',
    PASAPORTE = 'Pasaporte',
    CEDULA_EXTRANGERIA = 'Cédula de extranjería',
    DOCUMENTO_EXTRANGERO = 'Documento extranjero',
    VISA = 'Visa',
}

export enum TipoPoblacion {
    ADULTO_MAYOR = 'Adulto mayor',
    ARTISTA = 'Artista',
    AUTOR = 'Autor',
    CABEZA_DE_FAMILIA = 'Cabeza de familia',
    COMPOSITOR = 'Compositor',
    HABITANTE_CALLE = 'Habitante calle',
    JOVENES_VULNERABLES_RURALES = 'Jovenes vulnerables rurales',
    JOVENES_VULNERABLES_URBANOS = 'Jovenes vulnerables urbanos',
    MADRES_COMUNITARIAS = 'Madres comunitarias',
    MUJER_EMBARAZADA = 'Mujer embarazada',
    MUJER_LACTANTE = 'Mujer lactante',
    POBLACION_INFANTIL_ICBF = 'Poblacion infantil ICBF',
    POBLACION_SISBENIZADA = 'Poblacion sisbenizada',
    POBLACION_DESMOVILIZADA = 'Poblacion desmovilizada',
    POBLACION_DESPLAZAMIENTO_FORZADO = 'Poblacion desplazamiento forzado',
    POBLACION_CENTROS_PSIQUIATRICOS = 'Poblacion centros psiquiatricos',
    POBLACION_RURAL_MIGRATORIA = 'Poblacion rural migratoria',
    POBLACION_RURAL_NO_MIGRATORIA = 'Poblacion rural no Mmgratoria',
    POBLACION_CENTROS_CARCELARIOS = 'Poblacion centros carcelarios',
    POBLACION_TERCERA_EDAD = 'Poblacion tercera edad',
    SIN_OCUPACION = 'Sin ocupacion',
    TRABAJADOR_URBANO = 'Trabajador urbano',
    TRABAJADOR_RURAL = 'Trabajador rural',
    VICTIMA_VIOLENCIA_ARMADA = 'Victima violencia armada',
}

export enum Etnia {
    OTRA = 'Otra',
    AFROCOLOMBIANO = 'Afrocolombiano',
    AFRODESCENDIENTE = 'Afrodescendiente',
    INDIGENA = 'Indigena',
    MULATO = 'Mulato',
    NEGRO = 'Negro',
    PALENQUERO_SAN_BACILIO = 'PalenqueroSanBacilio',
    ROM = 'Rom',
    RAIZAL_ARCHIPIELAGO_SAN_ANDRES_PROVIDENCIA = 'Raizal archipielago SanAndres Providencia',
}

export enum Discapacidad {
    NINGUNO = 'Ninguno',
    SITEMA_NERVIOSO = 'Sistema nervioso',
    OJOS = 'Ojos',
    OIDOS = 'Oidos',
    OLFATO = 'Olfato',
    TACTO = 'Tacto',
    GUSTO = 'Gusto',
    CARDIORRESPIRATORIO = 'Cardio respiratorio',
    DEFENSAS = 'Defensas',
    DIGESTION = 'Digestion',
    METABOLISMO = 'Metabolismo',
    HORMONAS = 'Hormonas',
    SISTEMA_GENITAL = 'Sistema genital',
    SISTEMA_URINARIO = 'Sistema urinario',
    SISTEMA_REPRODUCTIVO = 'Sistema reproductivo',
    MANOS = 'Manos',
    BRAZOS = 'Brazos',
    PIERNAS = 'Piernas',
    PIEL = 'Piel',
    CABELLO = 'Cabello',
}

export enum ModalidadIngreso {
    ADMISION = 'Admision',
    REINTEGRO = 'Reintegro',
    CONVENIO = 'Convenio',
    TRANSFERENCIA = 'Transferencia',
    HOMOLOGACION = 'Homologacion',
}

export enum TipoBeca {
	PARCIAL = "Parcial",
    TOTAL = "Total"
}

export enum DedicacionBeca {
	TIEMPO_PARCIAL = "Tiempo parcial",
	TIEMPO_COMPLETO = "Tiempo completo",
}

export enum CategoriaMinCiencia {
	JUNIOR = "Junior",
	SENIOR = "Senior",
	ASOCIADO = "Asociado",
	SIN_CATEGORIA = "Sin categoría",
}

export enum TipoVinculacion {
	PLANTA = "Planta",
	OCACIONAL = "Ocacional",
	CATEDRA = "Catedra",
}

export enum EscalafonDocente {
	AUXILIAR = "Auxiliar",
	ASISTENTE = "Asistente",
	ASOCICADO = "Asociado",
	TITULAR = "Titular",
}

export enum AbreviaturaTitulo {
	ING = "Ing.",
	ESP = "Esp.",
	MG = "Mg.",
	PHD = "Phd.",
}

export enum TipoProrrogaSupencion {
    CIRCUNSTANCIAS_PERSONALES = "Circunstancias personales",
    INVESTIGACION_O_PROYECTOS = "Investigación o proyectos especiales",
    LICENCIA_MEDICA = "Licencia médica",
    PROBLEMAS_ACADEMICOS = "Problemas académicos",
    RAZONES_FAMILIARES = "Razones familiares",
    SERVICIO_MILITAR = "Servicio militar o servicio público",
  }
