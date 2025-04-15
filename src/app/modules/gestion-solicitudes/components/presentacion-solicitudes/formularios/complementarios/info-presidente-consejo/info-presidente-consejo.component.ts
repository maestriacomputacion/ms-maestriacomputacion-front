import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { InformacionRoles } from 'src/app/modules/gestion-solicitudes/models/indiceModelos';

@Component({
    selector: 'app-info-presidente-consejo',
    templateUrl: './info-presidente-consejo.component.html',
    styleUrls: ['./info-presidente-consejo.component.scss'],
})
export class InfoPresidenteConsejoComponent implements OnInit {
    formInfoPresidenteConsejo: FormGroup;
    showWarning: boolean = false; // Flag para mostrar advertencia
    pronombres: { label: string; value: string }[];

    constructor(private fb: FormBuilder, private http: HttpService, public ref: DynamicDialogRef) {
        this.pronombres = [
            { label: 'Sr.', value: 'sr.' },
            { label: 'Sra.', value: 'sra.' },
        ];
    }

    ngOnInit(): void {
        this.formInfoPresidenteConsejo = this.fb.group({
            nombreCompleto: ['', Validators.required],
            titulo: ['', Validators.required],
            pronombre: ['', this.customValidator()],
        });

        // Verificar si ya hay datos en la base de datos
        this.http.consultarInfoDeRolExterno('Presidente').subscribe(
            (data: InformacionRoles) => {
                if (data) {
                    // Si hay datos, los cargamos en el formulario
                    const formData = {
                        nombreCompleto: data.nombreCompleto,
                        titulo: data.titulo,
                        pronombre: data.tratamiento, // Asegurarse de que coincida con los valores 'sr.' o 'sra.'
                    };
                    this.formInfoPresidenteConsejo.patchValue(formData);
                }
            },
            (error) => {
                console.error('Error al obtener la información del presidente:', error);
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
        return this.formInfoPresidenteConsejo.valid;
    }

    guardarInfo() {
        if (this.formInfoPresidenteConsejo.valid) {
            const infoRoles: InformacionRoles = {
                cargo: 'Presidente',
                nombreCompleto: this.formInfoPresidenteConsejo.get('nombreCompleto').value,
                titulo: this.formInfoPresidenteConsejo.get('titulo').value,
                tratamiento: this.formInfoPresidenteConsejo.get('pronombre').value,
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
