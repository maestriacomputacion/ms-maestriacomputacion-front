import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { RadicarService } from '../../../services/radicar.service';
import { MessageService } from 'primeng/api';
import { UtilidadesService } from '../../../services/utilidades.service';

@Component({
    selector: 'app-docsadjuntos',
    templateUrl: './docsadjuntos.component.html',
    styleUrls: ['./docsadjuntos.component.scss'],
    providers: [MessageService],
})
export class DocsAdjuntosComponent implements OnInit {
    @Output() cambioDePaso = new EventEmitter<number>();

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }

    constructor(
        public radicar: RadicarService,
        public utilidades: UtilidadesService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        console.log('HOLA');
        try {
            this.radicar.requisitosSolicitudEscogida.documentosRequeridos;
            console.log(this.radicar.requisitosSolicitudEscogida);
        } catch (error) {
            console.error('Se produjo un error:', error);

            // Verificar si el error es del tipo TypeError y si contiene la cadena 'documentosRequeridos'
            if (error instanceof TypeError && error.message.includes('documentosRequeridos')) {
                // Redirigir al usuario a una ruta específica
                //this.router.navigate(['/gestionsolicitudes/portafolio/radicar/selector']);
            } else {
                // Manejar otros errores de manera apropiada
                console.error('Error no esperado:', error);
            }
        }
    }

    onUpload(event, fubauto, indice) {
        /*
        console.log(indice);
        console.log(
            '' +
                this.radicar.requisitosSolicitudEscogida.documentosRequeridos[
                    indice
                ].nombre
        );
        for (let doc of event.files) {
            this.radicar.documentosAdjuntos[indice] = doc;
        }

        fubauto.clear();
        */
        for (let doc of event.files) {
            // Obtener el nombre del archivo original y la extensión
            const originalName = doc.name;
            const fileExtension = originalName.split('.').pop();

            // Obtener el nuevo nombre del archivo
            const nuevoNombre = this.radicar.requisitosSolicitudEscogida.documentosRequeridos[indice].nombreAcortado;
            const nuevoNombreConExtension = `${nuevoNombre}.${fileExtension}`;

            const renamedFile = new File([doc], nuevoNombreConExtension, {
                type: 'application/pdf', // Establece el tipo MIME correcto para un PDF
            });
            // Actualizar la lista de documentos adjuntos
            this.radicar.documentosAdjuntos[indice] = renamedFile;
        }

        // Limpiar el componente de subida de archivos
        fubauto.clear();
    }

    eliminarDocumento(indice) {
        this.radicar.documentosAdjuntos[indice] = undefined;
    }

    validarDocsYEnlcesCompletos(): boolean {
        let estadoValidacion = true;

        // Verificar que los requisitos no sean undefined
        if (
            !this.radicar.requisitosSolicitudEscogida ||
            !this.radicar.requisitosSolicitudEscogida.documentosRequeridos ||
            !this.radicar.requisitosSolicitudEscogida.enlacesRequeridos
        ) {
            return false;
        }

        for (let index = 0; index < this.radicar.requisitosSolicitudEscogida.documentosRequeridos.length; index++) {
            const requisito = this.radicar.requisitosSolicitudEscogida.documentosRequeridos[index];
            if (
                requisito.adjuntarDocumento &&
                !requisito.nombre.includes('(si aplica)') &&
                !requisito.nombre.includes('(opcional)')
            ) {
                const nombreAcortado = requisito.nombreAcortado;
                const archivoEncontrado = this.radicar.documentosAdjuntos.some(
                    (doc) => doc && doc.name === `${nombreAcortado}.pdf`
                );

                if (!archivoEncontrado) {
                    return false;
                }
            }
        }

        for (let index = 0; index < this.radicar.requisitosSolicitudEscogida.enlacesRequeridos.length; index++) {
            if (
                !this.radicar.requisitosSolicitudEscogida.enlacesRequeridos[index].includes('(si aplica)') &&
                !this.radicar.requisitosSolicitudEscogida.enlacesRequeridos[index].includes('(opcional)')
            ) {
                if (
                    this.radicar.enlacesAdjuntos[index] == null ||
                    !this.utilidades.validarUrlSegura(this.radicar.enlacesAdjuntos[index])
                ) {
                    return false;
                }
            }
        }

        return estadoValidacion;
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Documentación Incompleta',
            detail: 'Cargue todos los documentos requeridos',
        });
    }

    navigateToNext() {
        if (this.validarDocsYEnlcesCompletos()) {
            this.cambioDePaso.emit(1); // Avanzar al siguiente paso
        } else {
            this.showWarn();
        }
    }

    navigateToBack() {
        this.cambioDePaso.emit(-1); // Retroceder al paso anterior
    }
}
