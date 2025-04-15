import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CuestionarioService } from '../../services/cuestionario.service';
import { Cuestionario } from '../../models/cuestionario';
import { Pregunta } from '../../../gestion-preguntas/models/pregunta';
import { PreguntaService } from '../../../gestion-preguntas/services/pregunta.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-agregar-pregunta-cuestionario',
    templateUrl: './agregar-pregunta-cuestionario.component.html',
    styleUrls: ['./agregar-pregunta-cuestionario.component.scss'],
})
export class AgregarPreguntaCuestionarioComponent implements OnInit {
    cuestionario: Cuestionario;
    preguntasCuestionario: Pregunta[] = [];
    preguntasDisponibles: Pregunta[] = [];
    allPreguntas: Pregunta[] = [];

    constructor(
        private route: ActivatedRoute,
        private cuestionarioService: CuestionarioService,
        private preguntaService: PreguntaService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.cargarCuestionario(id);
        this.cargarPreguntasDisponibles();
    }

    cargarCuestionario(id: number) {
        this.cuestionarioService
            .getCuestionario(id)
            .subscribe((data: Cuestionario) => {
                this.cuestionario = data;
                this.preguntasCuestionario =
                    data.preguntas?.filter((p) => p.estado === 'ACTIVO') || [];
                this.filtrarPreguntasDisponibles();
            });
    }

    cargarPreguntasDisponibles() {
        this.preguntaService.listPreguntas().subscribe((data: Pregunta[]) => {
            this.allPreguntas = data.filter((p) => p.estado === 'ACTIVO'); // Filtrar solo preguntas activas
            this.filtrarPreguntasDisponibles();
        });
    }

    filtrarPreguntasDisponibles() {
        this.preguntasDisponibles = this.allPreguntas.filter(
            (p) => !this.preguntasCuestionario.find((q) => q.id === p.id)
        );
    }

    actualizarPreguntas() {
        if (this.cuestionario) {
            const idPreguntas = this.preguntasCuestionario.map(p => p.id);
            this.cuestionarioService.addPreguntas(this.cuestionario.id!, idPreguntas).subscribe({
                next: () => {
                    this.messageService.add({severity:'success', summary:'Éxito', detail:'Preguntas actualizadas correctamente'});
                },
                error: (err) => {
                    this.messageService.add({severity:'error', summary:'Error', detail:'Error actualizando preguntas'});
                }
            });
        }
    }
}
