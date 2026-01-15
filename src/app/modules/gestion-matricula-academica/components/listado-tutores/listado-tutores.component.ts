import { Component } from '@angular/core';

interface TutorListado {
    nombre: string;
    codigo: string;
    correo: string;
    cantidadEstudiantes: number;
}

@Component({
    selector: 'app-listado-tutores',
    templateUrl: './listado-tutores.component.html',
    styleUrls: ['./listado-tutores.component.scss'],
})
export class ListadoTutoresComponent {
    loading: boolean = false;

    tutores: TutorListado[] = [
        {
            nombre: 'Carlos Alberto Méndez Rodríguez',
            codigo: 'TUT-001',
            correo: 'camendez@unicauca.edu.co',
            cantidadEstudiantes: 8,
        },
        {
            nombre: 'Marcela Andrea Rojas',
            codigo: 'TUT-002',
            correo: 'maroja@unicauca.edu.co',
            cantidadEstudiantes: 5,
        },
        {
            nombre: 'Jorge Luis Pérez',
            codigo: 'TUT-003',
            correo: 'jlperez@unicauca.edu.co',
            cantidadEstudiantes: 10,
        },
        {
            nombre: 'Sofía Martínez',
            codigo: 'TUT-004',
            correo: 'smartinez@unicauca.edu.co',
            cantidadEstudiantes: 3,
        },
    ];
}
