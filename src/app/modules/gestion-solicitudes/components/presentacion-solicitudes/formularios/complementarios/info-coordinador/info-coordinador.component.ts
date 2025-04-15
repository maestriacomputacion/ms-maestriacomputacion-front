import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { InformacionRoles } from 'src/app/modules/gestion-solicitudes/models/indiceModelos';

@Component({
    selector: 'app-info-coordinador',
    templateUrl: './info-coordinador.component.html',
    styleUrls: ['./info-coordinador.component.scss'],
})
export class InfoCoordinadorComponent implements OnInit {
    formInfoCoordinador: FormGroup;
    showWarning: boolean = false; // Flag para mostrar advertencia
    pronombres: { label: string; value: string }[]; // Cambiado para usar label y value

    constructor(private fb: FormBuilder, private http: HttpService, public ref: DynamicDialogRef) {
        this.pronombres = [
            { label: 'Sr.', value: 'sr.' },
            { label: 'Sra.', value: 'sra.' },
        ];
    }

    ngOnInit(): void {
        this.formInfoCoordinador = this.fb.group({
            nombreCompleto: ['', Validators.required],
            titulo: ['', Validators.required],
            pronombre: ['', this.customValidator()],
        });

        // Verificar si ya hay datos en la base de datos
        this.http.consultarInfoDeRolExterno('coordinador').subscribe(
            (data: InformacionRoles) => {
                if (data) {
                    // Si hay datos, los cargamos en el formulario
                    const formData = {
                        nombreCompleto: data.nombreCompleto,
                        titulo: data.titulo,
                        pronombre: data.tratamiento, // Asegurarse de que coincida con los valores 'el' o 'ella'
                    };
                    this.formInfoCoordinador.patchValue(formData);
                }
            },
            (error) => {
                console.error('Error al obtener la información del coordinador:', error);
            }
        );
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tipoSeleccionado: string = control.value;
            if (!tipoSeleccionado || tipoSeleccionado === '') {
                return { tipoInvalido: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formInfoCoordinador.valid;
    }

    guardarInfo() {
        if (this.formInfoCoordinador.valid) {
            const infoRoles: InformacionRoles = {
                cargo: 'Coordinador',
                nombreCompleto: this.formInfoCoordinador.get('nombreCompleto').value,
                titulo: this.formInfoCoordinador.get('titulo').value,
                tratamiento: this.formInfoCoordinador.get('pronombre').value,
            };

            this.http.guardarInfoDeRolExterno(infoRoles).subscribe(
                (response) => {
                    console.log('Información guardada correctamente:', response);
                    this.ref.close(); // Cierra el diálogo
                },
                (error) => {
                    console.error('Error al guardar la información:', error);
                }
            );
        } else {
            this.showWarning = true;
        }
    }

    cancelar() {
        this.ref.close(); // Cierra el diálogo sin enviar datos
    }
}
