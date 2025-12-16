import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { Persona } from 'src/app/modules/gestion-estudiantes/models/persona';
import { TutorInfo } from '../../models/tutor.model';

@Component({
    selector: 'app-vista-tutor',
    templateUrl: './vista-tutor.component.html',
    styleUrls: ['./vista-tutor.component.scss'],
})
export class VistaTutorComponent implements OnInit {
    loading: boolean = false;

    tutor: TutorInfo = {
        id: 1,
        persona: {
            id: 1,
            nombre: 'Carlos Alberto',
            apellido: 'Méndez Rodríguez',
            correoElectronico: 'camendez@unicauca.edu.co',
            identificacion: 12345678,
        },
        lineaInvestigacion: 'Ingeniería de Software',
    };

    estudiantes: (Estudiante & { totalMaterias?: number })[] = [];

    constructor(
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarEstudiantes();
    }

    private cargarEstudiantes(): void {
        this.loading = true;

        setTimeout(() => {
            this.estudiantes = [
                {
                    id: 1,
                    codigo: 'MC2024001',
                    persona: {
                        nombre: 'Ana María',
                        apellido: 'González López',
                        identificacion: 1061234567,
                        correoElectronico: 'ana.gonzalez@unicauca.edu.co',
                    },
                    informacionMaestria: {
                        semestreAcademico: 3,
                        estadoMaestria: 'RESUELTO',
                    },
                    totalMaterias: 4,
                },
                {
                    id: 2,
                    codigo: 'MC2024002',
                    persona: {
                        nombre: 'Juan Carlos',
                        apellido: 'Pérez Martínez',
                        identificacion: 1067654321,
                        correoElectronico: 'juan.perez@unicauca.edu.co',
                    },
                    informacionMaestria: {
                        semestreAcademico: 2,
                        estadoMaestria: 'PENDIENTE',
                    },
                    totalMaterias: 3,
                },
                {
                    id: 3,
                    codigo: 'MC2023015',
                    persona: {
                        nombre: 'María Fernanda',
                        apellido: 'Ruiz Castro',
                        identificacion: 1061122334,
                        correoElectronico: 'maria.ruiz@unicauca.edu.co',
                    },
                    informacionMaestria: {
                        semestreAcademico: 4,
                        estadoMaestria: 'RESUELTO',
                    },
                    totalMaterias: 2,
                },
                {
                    id: 4,
                    codigo: 'MC2024008',
                    persona: {
                        nombre: 'Pedro Antonio',
                        apellido: 'Silva Vargas',
                        identificacion: 1069876543,
                        correoElectronico: 'pedro.silva@unicauca.edu.co',
                    },
                    informacionMaestria: {
                        semestreAcademico: 1,
                        estadoMaestria: 'PENDIENTE',
                    },
                    totalMaterias: 5,
                },
            ];
            this.loading = false;
        }, 300);
    }

    getNombreCompleto(estudiante: Estudiante): string {
        return `${estudiante.persona?.nombre ?? ''} ${estudiante.persona?.apellido ?? ''}`.trim() || 'Sin nombre';
    }

    getTutorNombreCompleto(): string {
        return `${this.tutor.persona?.nombre ?? ''} ${this.tutor.persona?.apellido ?? ''}`.trim();
    }

    onVerEstudiante(estudiante: Estudiante): void {
        if (estudiante.id) {
            this.router.navigate(['/gestion-matricula-academica', 'aprobar-matricula-estudiante', estudiante.id]);
        }
    }

    getSeverityEstado(estado?: string): string {
        switch (estado) {
            case 'RESUELTO':
                return 'success';
            case 'PENDIENTE':
                return 'warning';
            case 'INRESUELTO':
                return 'danger';
            default:
                return 'info';
        }
    }

    formatEstado(estado?: string): string {
        if (!estado) return 'N/A';
        return estado.charAt(0) + estado.slice(1).toLowerCase();
    }
}
