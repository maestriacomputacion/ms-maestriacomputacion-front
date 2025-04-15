import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-avalpracticadocente',
    templateUrl: './avalpracticadocente.component.html',
    styleUrls: ['./avalpracticadocente.component.scss'],
})
export class AvalpracticadocenteComponent implements OnInit {
    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {}

    agregarActividad(event: any) {
        this.radicar.actividadesSeleccionadas.push(event.value);

        const actividadId = this.radicar.actividadesSeleccionadas.length - 1;
        /*
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }
*/
        if (event.value && event.value.peso == null) {
            this.radicar.horasAsignables[actividadId] = event.value.horasAsignadas;
        }
    }

    eliminarActividad(index: number) {
        if (this.radicar.actividadesSeleccionadas[index] && this.radicar.actividadesSeleccionadas[index].peso != null) {
            this.radicar.horasIngresadas.splice(index, 1);
        }
        this.radicar.actividadesSeleccionadas.splice(index, 1);
        //this.borrarYActualizarAdjuntos(index);

        this.radicar.horasAsignables.splice(index, 1);
        this.radicar.descripcionesActividades.splice(index, 1);

        // Comprobar si hay elementos en documentosAdjuntos
        if (this.radicar.documentosAdjuntos && this.radicar.documentosAdjuntos.length > 0) {
            // Marcar el archivo en la posición "index" como null
            if (this.radicar.documentosAdjuntos[index]) {
                this.radicar.documentosAdjuntos[index] = null; // O un objeto vacío si prefieres
            }

            // Reubicar y renombrar archivos después de "index"
            for (let i = index + 1; i < this.radicar.documentosAdjuntos.length; i++) {
                // Obtener el archivo que se está reubicando
                const archivoOriginal = this.radicar.documentosAdjuntos[i];

                if (archivoOriginal) {
                    // Renombrar el archivo
                    const nuevoNombre = archivoOriginal.name.replace(/Actividad \d+/, `Actividad ${i}`); // Cambia `i` por el nuevo índice
                    const renamedFile = new File([archivoOriginal], nuevoNombre, {
                        type: 'application/pdf',
                    });

                    // Actualizar el arreglo con el archivo renombrado en la posición anterior
                    this.radicar.documentosAdjuntos[i - 1] = renamedFile; // Mueve el archivo a la posición anterior
                } else {
                    this.radicar.documentosAdjuntos[i - 1] = null;
                }
            }

            // Establecer la última posición como null (o un objeto vacío) si es necesario
            this.radicar.documentosAdjuntos[this.radicar.documentosAdjuntos.length - 1] = null; // O un objeto vacío
        }

        console.log('ELIMINAR');
        console.log(this.radicar.documentosAdjuntos);
    }

    onValueChange(value: number, index: number, pesoActividad: number): void {
        this.radicar.horasIngresadas[index] = value;
        this.radicar.horasAsignables[index] = value * pesoActividad;
    }

    actualizarDescripcion(descripcion: string, indice: number) {
        this.radicar.descripcionesActividades[indice] = descripcion;
    }

    guardarContenidoCursoCorto(event, fubauto, nombre: string, indice: number) {
        for (let doc of event.files) {
            // Obtener el nuevo nombre del archivo
            const nuevoNombre = nombre;
            const nuevoNombreConExtension = `${nuevoNombre}.pdf`;

            const renamedFile = new File([doc], nuevoNombreConExtension, {
                type: 'application/pdf', // Establece el tipo MIME correcto para un PDF
            });
            // Actualizar la lista de documentos adjuntos
            this.radicar.documentosAdjuntos[indice] = renamedFile;
        }

        // Limpiar el componente de subida de archivos
        fubauto.clear();
        console.log('AGREGAR');
        console.log(this.radicar.documentosAdjuntos);
    }

    validarFormulario(): boolean {
        let formularioValido = true;

        if (this.radicar.actividadesSeleccionadas.length > 0) {
            this.radicar.actividadesSeleccionadas.forEach((actividad, indiceActividad) => {
                if (actividad.peso) {
                    if (this.radicar.horasIngresadas[indiceActividad] < 0) {
                        formularioValido = false;
                    }
                }
            });

            if (this.radicar.descripcionesActividades.length < this.radicar.actividadesSeleccionadas.length) {
                formularioValido = false;
            } else {
                // Verificar que no haya cadenas vacías en descripcionesActividades
                const descripcionesNoVacias = this.radicar.descripcionesActividades.filter(
                    (texto) => texto.trim() !== ''
                );
                if (descripcionesNoVacias.length !== this.radicar.descripcionesActividades.length) {
                    formularioValido = false;
                }
            }
        } else {
            formularioValido = false;
        }

        return formularioValido;
    }
}
