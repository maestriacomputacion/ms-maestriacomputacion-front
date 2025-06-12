import { Component, OnInit } from '@angular/core';
import {
    CursoOfertadoService,
    CursoOfertado,
} from '../../services/curso-ofertado.service';
import { ApiResponse } from '../../models/api-response.model';

@Component({
    selector: 'app-generar-cursos-ofertados',
    templateUrl: './generar-cursos-ofertados.component.html',
    styleUrls: ['./generar-cursos-ofertados.component.scss'],
})
export class GenerarCursosOfertadosComponent implements OnInit {
    cursosOfertados: CursoOfertado[] = [];

    // Filtros
    periodoNumero: number = 1;
    periodoAnio: number | null = null;
    anios = Array.from({ length: 6 }, (_, i) => ({
        label: `${2023 + i}`,
        value: 2023 + i,
    }));

    areasFormacion: { label: string; value: string }[] = [];
    areaSeleccionada: string | null = null;

    asignaturas: { label: string; value: string }[] = [];
    asignaturaSeleccionada: string | null = null;

    constructor(private readonly cursoOfertadoService: CursoOfertadoService) {}

    ngOnInit() {
        this.cursoOfertadoService
            .getCursosOfertados()
            .subscribe((resp: ApiResponse<CursoOfertado[]>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.cursosOfertados = resp.data;
                }
            });
        this.cursoOfertadoService
            .getAreasFormacion()
            .subscribe(
                (resp: ApiResponse<{ label: string; value: string }[]>) => {
                    if (resp.typeResponse === 'SUCCESS') {
                        this.areasFormacion = resp.data;
                    }
                }
            );
        this.cursoOfertadoService
            .getAsignaturas()
            .subscribe(
                (resp: ApiResponse<{ label: string; value: string }[]>) => {
                    if (resp.typeResponse === 'SUCCESS') {
                        this.asignaturas = resp.data;
                    }
                }
            );
    }

}
