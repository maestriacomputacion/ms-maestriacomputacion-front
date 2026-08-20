import { MenuItem } from 'primeng/api';

export const menuItems: MenuItem[] = [
    {
        label: 'INICIO',
        icon: 'pi pi-fw pi-home',
        routerLink: '/',
    },
    {
        label: 'GESTIÓN',
        icon: 'pi pi-fw pi-sliders-h',
        items: [
            {
                label: 'AVALES',
                icon: 'pi pi-check-circle',
                routerLink: '/gestionsolicitudes/avales/pendientes',
            },
            {
                label: 'ESTUDIANTES',
                icon: 'pi pi-user',
                routerLink: '/estudiantes',
            },
            {
                label: 'DOCENTES',
                icon: 'pi pi-user',
                routerLink: '/docentes',
            },
            {
                label: 'EXPERTOS',
                icon: 'pi pi-user',
                routerLink: '/expertos',
            },
            {
                label: 'ASIGNATURAS',
                icon: 'pi pi-fw pi-clone',
                routerLink: '/gestion-asignaturas',
            },
            {
                label: 'DOCUMENTOS',
                icon: 'pi pi-fw pi-clone',
                routerLink: '/gestion-documentos',
            },
            {
                label: 'SOLICITUDES',
                icon: 'pi pi-fw pi-inbox',
                routerLink: '/gestionsolicitudes/buzon/nuevas',
            },
            {
                label: 'CERTIFICADOS VOTACIÓN',
                icon: 'pi pi-fw pi-inbox',
                routerLink: '/certificado-votacion',
            },
            {
                label: 'LÍNEAS INVESTIGACIÓN',
                icon: 'pi pi-fw pi-clone',
                items: [
                    {
                        label: 'Categorías',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: '/gestion-lineas-investigacion/categorias',
                    },
                    {
                        label: 'Lienas de Investigación',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: '/gestion-lineas-investigacion/lineas',
                    },
                ],
            },
            {
                label: 'CUESTIONARIO DE EVALUACIÓN',
                icon: 'pi pi-fw pi-inbox',
                items: [
                    {
                        label: 'Preguntas Evaluación',
                        icon: 'pi pi-fw pi-question',
                        routerLink: '/gestion-evaluacion-docente/preguntas',
                    },
                    {
                        label: 'Cuestionarios de Evaluación',
                        icon: 'pi pi-fw pi-file',
                        routerLink: '/gestion-evaluacion-docente/cuestionarios',
                    },
                ],
            },
        ],
    },
    {
        label: 'GESTIÓN MATRÍCULAS',
        icon: 'pi pi-fw pi-id-card',
        items: [
            {
                label: 'Tipos de Matrícula',
                icon: 'pi pi-fw pi-id-card',
                items: [
                    {
                        label: 'Matricula por Curso',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink:
                            '/gestion-matricula-academica/gestion-matricula-curso',
                    },
                    {
                        label: 'Matricula por Estudiante o Masiva',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink:
                            '/gestion-matricula-academica/gestion-estudiantes',
                    },
                ],
            },
            {
                label: 'Listado de Matrículas',
                icon: 'pi pi-fw pi-list',
                routerLink: '/gestion-matricula-academica/listado-matriculas',
            },
            {
                label: 'Reportes de Matrícula',
                icon: 'pi pi-fw pi-chart-bar',
                items: [
                    {
                        id: 'reporte-matricula-estudiantes',
                        label: 'Reporte matricula estudiantes',
                        icon: 'pi pi-fw pi-chart-bar',
                    },
                    {
                        label: 'Notificación de matricula a estudiantes',
                        icon: 'pi pi-fw pi-envelope',
                        routerLink: '/gestion-matricula-academica/notificacion-estudiate',
                    },
                ]
            },
            {
                label: 'Tutor',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Listado de Tutores',
                        icon: 'pi pi-fw pi-users',
                        routerLink: '/gestion-matricula-academica/listado-tutores',
                    }
                ],
            },
            {
                label:'Revisión de Matrículas',
                icon:'pi pi-fw pi-user',
                routerLink:'/gestion-matricula-academica/estudiantes-por-tutor'
            }

        ],
    },
    {
        label: 'GESTIÓN ACADÉMICA',
        icon: 'pi pi-fw pi-book',
        items: [
            {
                label: 'Periodo Académico',
                icon: 'pi pi-fw pi-calendar',
                routerLink: '/gestion-matricula-academica/periodo-academico',
            },
            {
                label: 'Gestión de Cursos',
                icon: 'pi pi-fw pi-book',
                routerLink: '/gestion-matricula-academica/gestion-cursos',
            },
            {
                label: 'Material de Apoyo',
                icon: 'pi pi-fw pi-file',
                routerLink: '/gestion-matricula-academica/material-apoyo',
            },
            {
                label: 'Reportes',
                icon: 'pi pi-fw pi-chart-bar',
                items: [
                    {
                        label: 'Reporte Cursos Ofertados',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: '/gestion-matricula-academica/reporte-cursos-ofertados',
                    },
                    {
                        label: 'Reporte Centro Postgrados',
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: '/gestion-matricula-academica/reporte-centro-postgrados',
                    },
                ]
            },
            {
                label: 'Evaluación Docente',
                icon: 'pi pi-fw pi-id-card',
                routerLink: '/gestion-matricula-evaluacion',
            },
        ],

    },
    {
        label: 'MATRÍCULA FINANCIERA',
        icon: 'pi pi-fw pi-money-bill',
        routerLink: '/gestion-matricula-financiera',
    },
    {
        label: 'SOLICITUDES',
        icon: 'pi pi-fw pi-inbox',
        routerLink: '/gestionsolicitudes/portafolio/opciones',
    },
    {
        label: 'PRESUPUESTO',
        icon: 'pi pi-fw pi-chart-line',
        routerLink: '/informacion-presupuestaria',
    },
    {
        label: 'TRABAJOS DE GRADO',
        icon: 'pi pi-fw pi-book',
        items: [
            {
                label: 'Examen de valoracion',
                icon: 'pi pi-user',
                routerLink: '/examen-de-valoracion',
            },
            {
                label: 'Generar Hoja de Vida',
                icon: 'pi pi-user',
                routerLink: '/hoja-de-vida',
            },
            {
                label: 'Seguimiento a egresados',
                icon: 'pi pi-user',
                routerLink: '/seguimiento-a-egresados',
            },
        ],
    },
    {
        label: 'EVALUACIÓN DOCENTE',
        icon: 'pi pi-fw pi-star',
        routerLink: '/evaluacion-docente',
    },
    {
        label: 'LOGIN',
        icon: 'pi pi-fw pi-user',
        command: () => { },
    },
];
