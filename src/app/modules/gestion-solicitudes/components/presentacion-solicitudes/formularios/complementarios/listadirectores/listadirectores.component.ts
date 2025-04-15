import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { TutorYDirector } from 'src/app/modules/gestion-solicitudes/models/indiceModelos';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-listadirectores',
    templateUrl: './listadirectores.component.html',
    styleUrls: ['./listadirectores.component.scss'],
})
export class ListadirectoresComponent implements OnInit {
    formListaDirectores: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formListaDirectores = this.fb.group({
            director: ['', this.customValidator()],
        });

        this.formListaDirectores.valueChanges.subscribe((value) => {
            if (value.director) {
                this.radicar.director = value.director;
            }
        });
    }

    ngOnInit(): void {
        if (this.radicar.director) {
            this.formListaDirectores.patchValue({
                director: this.radicar.director,
            });
        } else {
            const nuevoDirector: TutorYDirector = {
                id: '-1',
                codigoTutor: 'codigoNuevoTutor',
                nombreTutor: 'Seleccione un docente',
            };
            this.formListaDirectores.patchValue({
                director: nuevoDirector,
            });
        }
    }

    customValidator() {
        return (control: AbstractControl) => {
            const directorSeleccionado: TutorYDirector = control.value;
            if (
                !directorSeleccionado ||
                directorSeleccionado.nombreTutor === 'Seleccione un docente'
            ) {
                return { invalidDirector: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formListaDirectores.valid;
    }
}
