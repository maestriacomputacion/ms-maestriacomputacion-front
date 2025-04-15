import { Component, Input, OnInit } from '@angular/core';
import { RadicarService } from '../../../../../services/radicar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-asignaturaexterna',
    templateUrl: './asignaturaexterna.component.html',
    styleUrls: ['./asignaturaexterna.component.scss'],
})
export class AsignaturaexternaComponent implements OnInit {
    @Input() indice: number;

    formAsigExterna: FormGroup;

    nombre: string = '';
    institucion: string = '';
    programa: string = '';
    creditos: number = null;
    intensidad: number = null;
    codigo: string = '';
    grupo: string = '';
    docente: string = '';
    tituloDocente: string = '';
    contenidos: File = null;
    cartaAceptacion: File = null;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formAsigExterna = this.fb.group({
            nombreAsignatura: ['', Validators.required],
            institucion: ['', Validators.required],
            programa: ['', Validators.required],
            numCreditos: ['', Validators.required],
            intensidadHoraria: ['', Validators.required],
            codigoAsignatura: ['', Validators.required],
            grupoAsignatura: ['', Validators.required],
            nombreDocente: ['', Validators.required],
            tituloDocente: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.radicar.datosAsignaturasExternas[this.indice]) {
            this.formAsigExterna.patchValue({
                nombreAsignatura: this.radicar.datosAsignaturasExternas[this.indice].nombre,
                programa: this.radicar.datosAsignaturasExternas[this.indice].programa,
                institucion: this.radicar.datosAsignaturasExternas[this.indice].institucion,
                numCreditos: this.radicar.datosAsignaturasExternas[this.indice].creditos,
                intensidadHoraria: this.radicar.datosAsignaturasExternas[this.indice].intensidad,
                codigoAsignatura: this.radicar.datosAsignaturasExternas[this.indice].codigo,
                grupoAsignatura: this.radicar.datosAsignaturasExternas[this.indice].grupo,
                nombreDocente: this.radicar.datosAsignaturasExternas[this.indice].docente,
                tituloDocente: this.radicar.datosAsignaturasExternas[this.indice].tituloDocente,
            });

            this.contenidos = this.radicar.datosAsignaturasExternas[this.indice].contenidos;
            this.cartaAceptacion = this.radicar.datosAsignaturasExternas[this.indice].cartaAceptacion;
        }
    }

    actualizarDatos() {
        const datos: {
            nombre: string;
            institucion: string;
            programa: string;
            creditos: number;
            intensidad: number;
            codigo: string;
            grupo: string;
            docente: string;
            tituloDocente: string;
            contenidos: File;
            cartaAceptacion: File;
        } = {
            nombre: this.formAsigExterna.value.nombreAsignatura,
            institucion: this.formAsigExterna.value.institucion,
            programa: this.formAsigExterna.value.programa,
            creditos: this.formAsigExterna.value.numCreditos,
            intensidad: this.formAsigExterna.value.intensidadHoraria,
            codigo: this.formAsigExterna.value.codigoAsignatura,
            grupo: this.formAsigExterna.value.grupoAsignatura,
            docente: this.formAsigExterna.value.nombreDocente,
            tituloDocente: this.formAsigExterna.value.tituloDocente,
            contenidos: this.contenidos,
            cartaAceptacion: this.cartaAceptacion,
        };

        this.radicar.datosAsignaturasExternas[this.indice] = datos;
    }

    onUploadConten(event, fubautocont, indiceDoc) {
        for (let contenido of event.files) {
            const nuevoNombre = 'Contenido programático Asignatura ' + indiceDoc + '.pdf';
            const nuevoArchivo = new File([contenido], nuevoNombre, { type: 'application/pdf' });
            this.contenidos = nuevoArchivo;
        }

        this.actualizarDatos();
        fubautocont.clear();
    }

    onUploadCarta(event, fubautocarta, indiceDoc) {
        for (let carta of event.files) {
            const nuevoNombre = 'Carta de aceptación Asignatura ' + indiceDoc + '.pdf';
            const nuevoArchivo = new File([carta], nuevoNombre, { type: 'application/pdf' });
            this.cartaAceptacion = nuevoArchivo;
        }

        this.actualizarDatos();
        fubautocarta.clear();
    }

    obtenerEstadoFormulario(): boolean {
        return this.formAsigExterna.valid;
    }
    validarDocumentosCargados(): boolean {
        return this.contenidos !== null && this.cartaAceptacion !== null;
    }
}
