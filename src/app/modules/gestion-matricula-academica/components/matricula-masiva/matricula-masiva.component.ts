import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodoAcademicoService } from '../../services/periodo-academico.service';
import { PeriodoAcademico } from '../../models/periodo-academico.model';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-matricula-masiva',
    templateUrl: './matricula-masiva.component.html',
    styleUrls: ['./matricula-masiva.component.scss'],
})
export class MatriculaMasivaComponent implements OnInit {
    selectedEstudiantes: any[] = [];
    periodoActivo: PeriodoAcademico | null = null;

    constructor(
        private readonly router: Router,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Obtener estudiantes desde navigation state o history.state
        const nav = this.router.getCurrentNavigation();
        if (nav?.extras?.state && nav.extras.state['selectedEstudiantes']) {
            this.selectedEstudiantes = nav.extras.state['selectedEstudiantes'];
        } else if (
            history &&
            (history as any).state &&
            (history as any).state.selectedEstudiantes
        ) {
            this.selectedEstudiantes =
                (history as any).state.selectedEstudiantes || [];
        } else {
            this.selectedEstudiantes = [];
        }

        // Cargar periodo académico activo
        this.periodoService.getPeriodoActivo().subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS' && resp.data) {
                    this.periodoActivo = resp.data;
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Aviso',
                        detail:
                            resp?.message || 'No se encontró periodo activo',
                    });
                }
            },
            error: (err) => {
                console.error('Error obteniendo periodo activo', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo obtener el periodo activo',
                });
            },
        });
    }

    regresar(): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-estudiantes',
        ]);
    }
}
