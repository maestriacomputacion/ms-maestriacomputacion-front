import { Component, OnInit } from '@angular/core';
import { Estudiante } from '../../models/estudiante';
import { EstudianteService } from '../../services/estudiante.service';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Router } from '@angular/router';
import { EstadoMastria } from 'src/app/core/enums/domain-enum';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Mensaje } from 'src/app/core/enums/enums';

@Component({
    selector: 'app-bandeja-estudiantes',
    templateUrl: './bandeja-estudiantes.component.html',
    styleUrls: ['./bandeja-estudiantes.component.scss'],
})
export class BandejaEstudiantesComponent implements OnInit {

    loading: boolean;
    estudiantes: Estudiante[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private estudianteService: EstudianteService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.listEstudiantes();
    }

    listEstudiantes() {
        this.loading = true;
        this.estudianteService.listEstudiantes().subscribe({
            next: (response) => this.estudiantes = response,
        }).add(() => this.loading = false);
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Estudiantes' },
        ]);
    }

    onRegistrarEstudiante() {
        this.router.navigate(['estudiantes/registrar']);
    }

    onCargaExitosa() {
        this.listEstudiantes();
    }

    getEstadoMaestria(codigo: string) {
        return EstadoMastria[codigo]
    }

    onVerEstados(id: number) {
        this.router.navigate(['estudiantes/estados', id]);
    }

    onEditar(id: number) {
        this.router.navigate(['estudiantes/editar', id]);
    }

    onDelete(event:any, id: number, ) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.CONFIRMAR_ELIMINAR_ESTUDIANTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE ,
            acceptLabel: 'Si, eliminar', rejectLabel: 'No',
            accept: () => this.deleteEstudiante(id)
        });
    }

    deleteEstudiante(id: number) {
        this.estudianteService.deleteEstudiante(id).subscribe({
            next: () => {
                this.messageService.add(infoMessage(Mensaje.ESTUDIANTE_ELIMINADO_CORRECTAMENTE));
                this.listEstudiantes();
            }
        });
    }
}
