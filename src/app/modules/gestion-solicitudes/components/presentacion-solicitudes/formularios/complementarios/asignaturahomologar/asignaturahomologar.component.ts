import { Component, Input, OnInit } from '@angular/core';
import { RadicarService } from '../../../../../services/radicar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-asignaturahomologar',
    templateUrl: './asignaturahomologar.component.html',
    styleUrls: ['./asignaturahomologar.component.scss'],
})
export class AsignaturahomologarComponent implements OnInit {
    @Input() indice: number;
    formAsigHomologar: FormGroup;
    asignatura: string = '';
    creditos: number = null;
    intensidad: number = null;
    calificacion: number = null;
    contenidos: File = null;
    deshabilitarCargaArchivo: boolean = false;

    binding: any;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formAsigHomologar = this.fb.group({
            nombreAsignatura: ['', Validators.required],
            numeroCreditos: ['', Validators.required],
            intensidadHoraria: ['', Validators.required],
            calificacion: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (
            this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'HO_ASIG_ESP'
        ) {
            this.deshabilitarCargaArchivo = true;
        }

        if (this.radicar.datosAsignaturasAHomologar[this.indice]) {
            this.formAsigHomologar.patchValue({
                nombreAsignatura:
                    this.radicar.datosAsignaturasAHomologar[this.indice]
                        .asignatura,
                numeroCreditos:
                    this.radicar.datosAsignaturasAHomologar[this.indice]
                        .creditos,
                intensidadHoraria:
                    this.radicar.datosAsignaturasAHomologar[this.indice]
                        .intensidad,
                calificacion:
                    this.radicar.datosAsignaturasAHomologar[this.indice]
                        .calificacion,
            });

            this.contenidos =
                this.radicar.datosAsignaturasAHomologar[this.indice].contenidos;
        }
    }

    actualizarDatos() {
        const datos: {
            asignatura: string;
            creditos: number;
            intensidad: number;
            calificacion: number;
            contenidos: File;
        } = {
            asignatura: this.formAsigHomologar.value.nombreAsignatura,
            creditos: this.formAsigHomologar.value.numeroCreditos,
            intensidad: this.formAsigHomologar.value.intensidadHoraria,
            calificacion: this.formAsigHomologar.value.calificacion,
            contenidos: this.contenidos,
        };

        this.radicar.datosAsignaturasAHomologar[this.indice] = datos;
    }

    onUpload(event, fubauto) {
        for (let contenido of event.files) {
            this.contenidos = contenido;
        }

        this.actualizarDatos();
        fubauto.clear();
    }

    obtenerEstadoFormulario(): boolean {
        return this.formAsigHomologar.valid;
    }

    validarDocumentoCargado(): boolean {
        return !!this.contenidos;
    }
}
