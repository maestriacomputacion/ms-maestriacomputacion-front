import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TutorListado } from '../../../models/tutor-listado.model';
import { TutorService } from '../../../services/tutor.service';

@Component({
    selector: 'app-listado-tutores',
    templateUrl: './listado-tutores.component.html',
    styleUrls: ['./listado-tutores.component.scss'],
})
export class ListadoTutoresComponent implements OnInit {
    loading: boolean = false;
    tutores: TutorListado[] = [];

    constructor(
        private readonly tutorService: TutorService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadTutores();
    }

    private loadTutores(): void {
        this.loading = true;
        this.tutorService.getTutores().subscribe({
            next: (response) => {
                if (response.typeResponse === 'SUCCESS') {
                    this.tutores = response.data || [];
                } else {
                    this.tutores = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudieron cargar los tutores',
                    });
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando tutores', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error al cargar los tutores';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
                this.loading = false;
            },
        });
    }

    verDetallesTutor(tutor: TutorListado): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'estudiantes-por-tutor',
            tutor.docenteId,
        ]);
    }
}
