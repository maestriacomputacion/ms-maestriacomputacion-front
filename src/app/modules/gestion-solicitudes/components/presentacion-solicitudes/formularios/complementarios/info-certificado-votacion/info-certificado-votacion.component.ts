import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-info-certificado-votacion',
    templateUrl: './info-certificado-votacion.component.html',
    styleUrls: ['./info-certificado-votacion.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class InfoCertificadoVotacionComponent implements OnInit {
    formInfoCertificadoVotacion: FormGroup;
    showWarning: boolean = false;

    constructor(
        private fb: FormBuilder, 
        private http: HttpService, 
        public ref: DynamicDialogRef,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.formInfoCertificadoVotacion = this.fb.group({
            nombreCompleto: [{ value: 'Registro certificado votación', disabled: true }, Validators.required],
            titulo: ['', Validators.required],
            pronombre: ['', Validators.required]
        });

        // Validación cuando cambian las fechas
        this.formInfoCertificadoVotacion.get('titulo').valueChanges.subscribe(() => {
            this.validarFechas();
        });

        this.formInfoCertificadoVotacion.get('pronombre').valueChanges.subscribe(() => {
            this.validarFechas();
        });
    }

    validarFechas() {
        const fechaInicio = this.formInfoCertificadoVotacion.get('titulo').value;
        const fechaFinal = this.formInfoCertificadoVotacion.get('pronombre').value;

        if (fechaInicio && fechaFinal) {
            if (fechaFinal < fechaInicio) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'La fecha final no puede ser menor a la fecha inicial'
                });
                this.formInfoCertificadoVotacion.get('pronombre').setErrors({ 'fechaInvalida': true });
            } else {
                this.formInfoCertificadoVotacion.get('pronombre').setErrors(null);
            }
        }
    }

    guardarInfo() {
        if (this.formInfoCertificadoVotacion.valid) {
            const fechaInicio = this.formInfoCertificadoVotacion.get('titulo').value;
            const fechaFinal = this.formInfoCertificadoVotacion.get('pronombre').value;

            if (!fechaInicio || !fechaFinal) {
                this.showWarning = true;
                return;
            }

            this.confirmationService.confirm({
                message: '¿Estás seguro que deseas guardar las fechas?',
                acceptLabel: 'Si',
                accept: () => {
                    const body = {
                        codigo: "CER_VOTO",
                        fechaInicio: fechaInicio.toISOString().split('T')[0],
                        fechaFinal: fechaFinal.toISOString().split('T')[0]
                    };

                    this.http.guardarFechaSolicitud(body).subscribe(
                        (response) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Fechas guardadas correctamente'
                            });
                            this.ref.close();
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al guardar las fechas'
                            });
                            console.error('Error al actualizar las fechas:', error);
                        }
                    );
                }
            });
        } else {
            this.showWarning = true;
        }
    }

    cancelar() {
        this.ref.close();
    }
}