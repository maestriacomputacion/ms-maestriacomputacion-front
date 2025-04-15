import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { UtilidadesService } from 'src/app/modules/gestion-solicitudes/services/utilidades.service';

interface AdjuntosActividad {
    archivos: File[];
    enlaces: string[];
}
interface AdjuntosDeActividades {
    [actividadId: number]: AdjuntosActividad;
}
@Component({
    selector: 'app-creditos',
    templateUrl: './creditos.component.html',
    styleUrls: ['./creditos.component.scss'],
})
export class CreditosComponent implements OnInit {
    constructor(public radicar: RadicarService, public utilidades: UtilidadesService) {}

    ngOnInit(): void {}

    agregarActividad(event: any) {
        this.radicar.actividadesSeleccionadas.push(event.value);

        const actividadId = this.radicar.actividadesSeleccionadas.length - 1;
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        if (event.value.peso == null) {
            this.radicar.horasAsignables[actividadId] = event.value.horasAsignadas;
        }
    }

    eliminarActividad(index: number) {
        if (this.radicar.actividadesSeleccionadas[index].peso != null) {
            this.radicar.horasIngresadas.splice(index, 1);
        }
        this.radicar.actividadesSeleccionadas.splice(index, 1);
        this.borrarYActualizarAdjuntos(index);

        this.radicar.horasAsignables.splice(index, 1);
    }

    borrarYActualizarAdjuntos(actividadId: number): void {
        const actividades = this.radicar.adjuntosDeActividades;
        const newActividades: AdjuntosDeActividades = {};

        // Borrar el registro y copiar los restantes
        for (const key in actividades) {
            const keyNum = parseInt(key);
            if (keyNum < actividadId) {
                newActividades[keyNum] = actividades[keyNum];
            } else if (keyNum > actividadId) {
                newActividades[keyNum - 1] = actividades[keyNum];
            }
        }

        this.radicar.adjuntosDeActividades = newActividades;
    }

    onValueChange(
        value: number,
        index: number,
        pesoActividad: number,
        codigoActividad: string,
        tipoCampo: string
    ): void {
        if (
            tipoCampo === 'semanas' &&
            (codigoActividad == 'DOC_CUR_PREG' || codigoActividad == 'DOC_CUR_POSG') &&
            this.radicar.horasIngresadas[index]
        ) {
            this.radicar.numSemanasIngresado[index] = value;
            this.radicar.horasAsignables[index] = this.radicar.horasIngresadas[index] * pesoActividad * value;
        } else if (
            tipoCampo === 'horas' &&
            (codigoActividad == 'DOC_CUR_PREG' || codigoActividad == 'DOC_CUR_POSG') &&
            this.radicar.numSemanasIngresado[index]
        ) {
            this.radicar.horasIngresadas[index] = value;
            this.radicar.horasAsignables[index] = this.radicar.numSemanasIngresado[index] * pesoActividad * value;
        } else {
            this.radicar.horasIngresadas[index] = value;
            this.radicar.horasAsignables[index] = value * pesoActividad;
        }
    }

    onUpload(event: any, fileUpload: any, actividadId: number, docIndex: number) {
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        this.radicar.adjuntosDeActividades[actividadId].archivos.splice(docIndex, 0, event.files[0]);
        fileUpload.clear();
    }

    agregarEnlace(actividadId: number, enlace: string, posicion: number) {
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        this.radicar.adjuntosDeActividades[actividadId].enlaces.splice(posicion, 0, enlace);
    }

    validarFormulario(): boolean {
        let formularioValido = true;

        if (this.radicar.actividadesSeleccionadas.length > 0) {
            this.radicar.actividadesSeleccionadas.forEach((actividad, indiceActividad) => {
                if (actividad.peso) {
                    if (this.radicar.horasIngresadas[indiceActividad] < 0) {
                        formularioValido = false;
                    }

                    if (
                        (actividad.codigo == 'DOC_CUR_POSG' || actividad.codigo == 'DOC_CUR_PREG') &&
                        this.radicar.numSemanasIngresado[indiceActividad] === undefined
                    ) {
                        formularioValido = false;
                    }
                }

                if (actividad.documentos.length > 0) {
                    actividad.documentos.forEach((documento, indiceDoc) => {
                        const documentoOpcional = /(\(si aplica\))|(\(opcional\))/i.test(documento);

                        if (
                            !documentoOpcional &&
                            !this.radicar.adjuntosDeActividades[indiceActividad].archivos[indiceDoc]
                        ) {
                            formularioValido = false;
                        }
                    });
                }

                if (actividad.enlaces.length > 0) {
                    actividad.enlaces.forEach((enlace, indiceEnlace) => {
                        const enlaceOpcional = /(\(si aplica\))|(\(opcional\))/i.test(enlace);

                        console.log('Enlace Opcional: ' + enlaceOpcional);
                        if (
                            !enlaceOpcional &&
                            !this.radicar.adjuntosDeActividades[indiceActividad].enlaces[indiceEnlace]
                        ) {
                            formularioValido = false;
                        }

                        if (
                            this.radicar.adjuntosDeActividades[indiceActividad].enlaces[indiceEnlace] &&
                            !this.utilidades.validarUrlSegura(
                                this.radicar.adjuntosDeActividades[indiceActividad].enlaces[indiceEnlace]
                            )
                        ) {
                            formularioValido = false;
                        }
                    });
                }
            });
        } else {
            formularioValido = false;
        }

        return formularioValido;
    }
}
