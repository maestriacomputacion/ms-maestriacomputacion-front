import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { TutorYDirector } from 'src/app/modules/gestion-solicitudes/models/indiceModelos';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-listatutores',
    templateUrl: './listatutores.component.html',
    styleUrls: ['./listatutores.component.scss'],
})
export class ListatutoresComponent implements OnInit {
    formListaTutores: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formListaTutores = this.fb.group({
            tutor: ['', this.customValidator()],
        });

        this.formListaTutores.valueChanges.subscribe((value) => {
            if (value.tutor) {
                this.radicar.tutor = value.tutor;
            }
        });
    }

    ngOnInit(): void {
        if (this.radicar.tutor) {
            this.formListaTutores.patchValue({
                tutor: this.radicar.tutor,
            });
        } else {
            const nuevoTutor: TutorYDirector = {
                id: '-1',
                codigoTutor: 'codigoNuevoTutor',
                nombreTutor: 'Seleccione un docente',
            };
            this.formListaTutores.patchValue({
                tutor: nuevoTutor,
            });
        }
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tutorSeleccionado: TutorYDirector = control.value;
            if (
                !tutorSeleccionado ||
                tutorSeleccionado.nombreTutor === 'Seleccione un docente'
            ) {
                return { invalidTutor: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formListaTutores.valid;
    }
}
