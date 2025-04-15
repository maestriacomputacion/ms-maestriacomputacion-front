import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { EstudianteService } from '../../services/estudiante.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoEstudiante } from '../../models/estado-estudiante';
import { EstadoMastria } from 'src/app/core/enums/domain-enum';
@Component({
    selector: 'app-estados-estudiante',
    templateUrl: './estados-estudiante.component.html',
    styleUrls: ['./estados-estudiante.component.scss'],
})
export class EstadosEstudianteComponent implements OnInit {

    loading: boolean;
    estadoRadioButton: string;
    estudiante: EstadoEstudiante;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private estudianteService: EstudianteService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.getEstadoEstudiante();
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Estudiantes' , routerLink:'estudiantes' },
            { label: 'Estados' },
        ]);
    }

    getEstadoEstudiante() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.estudianteService.getEstadoEstudiante(id).subscribe({
            next: (response) => this.estudiante = response,
        });
    }

    getEstadoMaestria(codigo: string) {
        return EstadoMastria[codigo]
    }

    onVolver() {
        this.router.navigate(['estudiantes']);
    }

    onEdicion() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.router.navigate([`estudiantes/editar/${id}`]);
    }
}
