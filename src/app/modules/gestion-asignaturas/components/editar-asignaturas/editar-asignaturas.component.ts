import { Component, OnInit } from '@angular/core';
import { Asignatura } from '../../models/asignatura';
import { AsignaturasService } from '../../services/asignaturas.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-editar-asignaturas',
    templateUrl: './editar-asignaturas.component.html',
    styleUrls: ['./editar-asignaturas.component.scss'],
})
export class EditarAsignaturasComponent implements OnInit {
    asignaturaEdit: Asignatura;
    constructor(private asignaturaService: AsignaturasService,public ref: DynamicDialogRef, public config: DynamicDialogConfig ) {}

    ngOnInit(): void {
          // Obtener la asignatura enviada desde el componente bandeja-asignaturas
          this.asignaturaEdit = this.config.data.asignatura;
          console.log(this.asignaturaEdit);
    }


}
