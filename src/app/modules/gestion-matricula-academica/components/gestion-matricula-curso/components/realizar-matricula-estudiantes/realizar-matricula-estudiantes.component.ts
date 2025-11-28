import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CursoService } from '../../../../services/curso.service';
import { BackendCurso } from '../../../../models/curso.model';

@Component({
    selector: 'app-realizar-matricula-estudiantes',
    templateUrl: './realizar-matricula-estudiantes.component.html',
    styleUrls: ['./realizar-matricula-estudiantes.component.scss'],
})
export class RealizarMatriculaEstudiantesComponent implements OnInit {
    cursoId: number | null = null;
    curso: BackendCurso | null = null;
    loading = false;

    estudiantesMock = [
        {
            codigo: '2-121212',
            nombres: 'Camilo Ruiz Daza',
            correo: 'cruiz@unicauca.edu.co',
            semestre: 2,
        },
        {
            codigo: '2-121213',
            nombres: 'Ana María Patiño',
            correo: 'apatino@unicauca.edu.co',
            semestre: 3,
        },
        {
            codigo: '2-121214',
            nombres: 'Juan Sebastián Muñoz',
            correo: 'jsmunoz@unicauca.edu.co',
            semestre: 1,
        },
        {
            codigo: '2-121215',
            nombres: 'Laura Vanessa López',
            correo: 'lvlopez@unicauca.edu.co',
            semestre: 2,
        },
    ];

    estudiantesMatricularMock = [
        {
            codigo: '2-121305',
            nombres: 'Natalia Herrera Torres',
            semestre: 1,
            observaciones: 'Listo para matricular',
        },
        {
            codigo: '2-121306',
            nombres: 'Esteban Ruiz Bonilla',
            semestre: 2,
            observaciones: 'Documentación incompleta',
        },
        {
            codigo: '2-121307',
            nombres: 'Valentina Rojas Jiménez',
            semestre: 3,
            observaciones: 'Esperando aprobación del coordinador',
        },
        {
            codigo: '2-121308',
            nombres: 'David Alejandro Peña',
            semestre: 4,
            observaciones: 'Curso compatible con su plan de estudio',
        },
    ];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly cursoService: CursoService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.cursoId = +params['id'];
                this.cargarCurso(this.cursoId);
            }
        });
    }

    cargarCurso(id: number): void {
        this.loading = true;
        this.cursoService.getCursoById(id).subscribe({
            next: (resp) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.curso = resp.data;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: resp.message || 'No se pudo cargar la información del curso',
                    });
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando curso', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar la información del curso',
                });
                this.loading = false;
            },
        });
    }

    seleccionarEstudiante(codigo: string): void {
        console.log('Seleccionando estudiante con código:', codigo);
        // Aquí se puede implementar lógica para seleccionar estudiantes
    }

    agregarObservacion(codigo: string): void {
        console.log('Agregando observación al estudiante con código:', codigo);
        // Aquí se puede implementar lógica para agregar observaciones
    }

    finalizarMatricula(): void {
        console.log('Finalizando matrícula');
        // Aquí se puede implementar lógica para finalizar la matrícula
    }

    cancelarMatricula(): void {
        this.router.navigate(['/gestion-matricula-academica', 'gestion-matricula-curso']);
    }

    getDocentesFormateados(): string {
        if (!this.curso?.docentes?.length) return '-';
        return this.curso.docentes
            .map((d) => {
                const nombreCompleto = `${d.nombre ?? ''} ${d.apellido ?? ''}`.trim();
                return nombreCompleto || d.codigo || d.correoElectronico || '-';
            })
            .join(', ');
    }

    getTagPeriodo(): string {
        return this.curso?.periodo?.tagPeriodo?.toString() ?? '-';
    }

    getFechasPeriodo(): string {
        if (!this.curso?.periodo) return '-';
        const fechaInicio = this.formatDate(this.curso.periodo.fechaInicio);
        const fechaFin = this.formatDate(this.curso.periodo.fechaFin);
        return `${fechaInicio} - ${fechaFin}`;
    }

    private formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '-';
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
}
