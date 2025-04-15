import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TutorYDirector } from 'src/app/modules/gestion-solicitudes/models/tutores/tutorYDirector';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-asignaturadicioncancel',
    templateUrl: './asignaturadicioncancel.component.html',
    styleUrls: ['./asignaturadicioncancel.component.scss'],
})
export class AsignaturadicioncancelComponent implements OnInit {
    @Input() indice: number;
    formAsigAdiCancel: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formAsigAdiCancel = this.fb.group({
            nombreAsignatura: ['', Validators.required],
            grupoAsignatura: ['', Validators.required],
            docenteAsig: ['', this.customValidator()],
        });
    }

    ngOnInit(): void {
        if (this.radicar.datosAsignAdiCancel[this.indice]) {
            this.formAsigAdiCancel.patchValue({
                nombreAsignatura: this.radicar.datosAsignAdiCancel[this.indice].nombreAsignatura,
                grupoAsignatura: this.radicar.datosAsignAdiCancel[this.indice].grupoAsignatura,
                docenteAsig: this.radicar.datosAsignAdiCancel[this.indice].docente,
            });
        }

        if (!this.radicar.datosAsignAdiCancel[this.indice]) {
            const nuevoTutor: TutorYDirector = {
                id: '-1',
                codigoTutor: 'codigoNuevoTutor',
                nombreTutor: 'Seleccione un docente',
            };

            this.formAsigAdiCancel.patchValue({
                docenteAsig: nuevoTutor,
            });
        }
    }

    actualizarDatos() {
        const datos: {
            nombreAsignatura: string;
            grupoAsignatura: string;
            docente: TutorYDirector;
        } = {
            nombreAsignatura: this.formAsigAdiCancel.value.nombreAsignatura,
            grupoAsignatura: this.formAsigAdiCancel.value.grupoAsignatura,
            docente: this.formAsigAdiCancel.value.docenteAsig,
        };

        this.radicar.datosAsignAdiCancel[this.indice] = datos;
    }

    customValidator() {
        return (control: AbstractControl) => {
            const docenteSeleccionado: TutorYDirector = control.value;
            if (!docenteSeleccionado || docenteSeleccionado.nombreTutor === 'Seleccione un docente') {
                return { invalidTutor: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formAsigAdiCancel.valid;
    }
}
