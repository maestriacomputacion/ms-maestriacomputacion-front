export const fieldMap: { [key: string]: string } = {
    'persona.identificacion': 'Identificación',
    'persona.nombre': 'Nombres',
    'persona.apellido': 'Apellidos',
    'persona.correoElectronico': 'Correo Electrónico',
    'persona.telefono': 'Teléfono',
    'persona.genero': 'Género',
    'persona.tipoIdentificacion': 'Tipo de Identificación',
    'tituloexper': 'Título',
    'universidadtitexp': 'Universidad del título',
    'universidadexp': 'Universidad vinculación',
    'facultadexp': 'Facultad',
    'grupoinvexp': 'Grupo de Investigación',
    'observacionexp': 'Observación',
    'estado': 'Estado'
};

// let excludedKeys = ['id', 'categoria', 'estado', 'copiadocidentidad']; // Define las partes de las claves a excluir
export const excludedKeys = ['id', 'categoria', 'estado', 'copiadocidentidad','lineasInvestigacion','lineasInvestigacion.titulo','iddocidentidad']; // Define las partes de las claves a excluir