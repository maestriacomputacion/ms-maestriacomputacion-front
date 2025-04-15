import { Component, OnInit } from '@angular/core';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';
import { DocenteService } from '../../services/docente.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-buscador-docentes',
    templateUrl: './buscador-docentes.component.html',
    styleUrls: ['./buscador-docentes.component.scss'],
})
export class BuscadorDocentesComponent implements OnInit {

    docentes: Docente[];
    docenteSeleccionado: Docente;
    loading: boolean;

    constructor(
        private docenteService: DocenteService,
        private ref: DynamicDialogRef,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.listDocentes();
    }

    listDocentes() {
        this.loading = true;
        this.docenteService.listarDocentes().subscribe({
                next: (response) => (this.docentes = response),
            })
            .add(() => this.loading = false);
    }

    filterDocentes(filter: string) {
        if (filter?.trim().length > 0) {
            this.docenteService.listarDocentes().subscribe({
                next: (response) => {
                    this.docentes = response.filter((e) =>
                        e.nombre.includes(filter.trim())
                    );
                },
            });
        }
    }

    onCancel() {
        this.ref.close();
    }

    onSeleccionar() {
        if(this.docenteSeleccionado) {
            this.ref.close(this.docenteSeleccionado);
        }
    }

    onRegistrar() {
        this.ref.close();
        this.router.navigate(['docentes/registrar']);
    }
}
