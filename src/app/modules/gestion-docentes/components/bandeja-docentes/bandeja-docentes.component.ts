import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Docente } from '../../models/docente';
import { DocenteService } from '../../services/docente.service';

@Component({
  selector: 'app-bandeja-docentes',
  templateUrl: './bandeja-docentes.component.html',
  styleUrls: ['./bandeja-docentes.component.scss']
})
export class BandejaDocentesComponent implements OnInit {

    loading: boolean;
    docentes: Docente[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private docenteService: DocenteService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.listDocentes();
    }

    listDocentes() {
        this.loading = true;
        this.docenteService.listDocentes().subscribe({
            next: (response) => this.docentes = response.filter((d) => d.estado === 'ACTIVO'),
        }).add(() => this.loading = false);
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Docentes' },
        ]);
    }

    onRegistrarDocente() {
        this.router.navigate(['docentes/registrar']);
    }

    onCargaExitosa() {
        this.listDocentes();
    }

    onEditar(id: number) {
        this.router.navigate(['docentes/editar', id]);
    }

    onDelete(event:any, id: number, ) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.CONFIRMAR_ELIMINAR_DOCENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE ,
            acceptLabel: 'Si, eliminar', rejectLabel: 'No',
            accept: () => this.deleteDocente(id)
        });
    }

    deleteDocente(id: number) {
        this.docenteService.deleteDocente(id).subscribe({
            next: () => {
                this.messageService.add(infoMessage(Mensaje.DOCENTE_ELIMINADO_CORRECTAMENTE));
                this.listDocentes();
            }
        });
    }
}
