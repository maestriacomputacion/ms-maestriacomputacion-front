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
                routerLink:'/expertos',
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
                label:'LÍNEAS INVESTIGACIÓN',
                icon: 'pi pi-fw pi-clone',
                items:[
                    {
                        label: 'Categorías',
                        icon: 'pi pi-fw pi-bars',
                        routerLink:'/gestion-lineas-investigacion/categorias'
                    },
                    {
                        label: 'Lienas de Investigación',
                        icon: 'pi pi-fw pi-clone',
                        routerLink:'/gestion-lineas-investigacion/lineas'
                    }
                ]
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
            }
        ],
    },
    {
        label: 'MATRICULAS',
        icon: 'pi pi-fw pi-id-card',
        items: [
            {
                label: 'Evaluación Docente',
                icon: 'pi pi-fw pi-id-card',
                routerLink: '/gestion-matricula-evaluacion',
            },
            
        ],
    },
    {
        label: 'SOLICITUDES',
        icon: 'pi pi-fw pi-inbox',
        routerLink: '/gestionsolicitudes/portafolio/opciones',
    },
    {
        label: 'PRESUPUESTO',
        icon: 'pi pi-fw pi-chart-line',
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
        label: 'LOGIN',
        icon: 'pi pi-fw pi-user',
        command: () => {},
    },
];
