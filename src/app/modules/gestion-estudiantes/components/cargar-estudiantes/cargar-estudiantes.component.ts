import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import { errorMessage, infoMessage } from 'src/app/core/utils/message-util';
import { EstudianteService } from '../../services/estudiante.service';

@Component({
    selector: 'app-cargar-estudiantes',
    templateUrl: './cargar-estudiantes.component.html',
    styleUrls: ['./cargar-estudiantes.component.scss'],
})
export class CargarEstudiantesComponent implements OnInit {

    @Output() onCargaExitosa = new EventEmitter<void> ();

    file: File;
    loading: boolean;
    labelFile: string = null;

    constructor(
        private messageService: MessageService,
        private estudianteService: EstudianteService,
    ) {}

    ngOnInit(): void {}

    onFileSelected(event: any) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            this.file = selectedFile;
            this.labelFile = this.file.name + ' - ' + (this.file.size / 1024).toFixed(0) + ' KB';
        }
    }

    onCargar() {
        this.loading = true;
        this.estudianteService.uploadEstudiantes(this.file).subscribe({
            next: () => {
                this.messageService.add(infoMessage(Mensaje.REGISTRO_ESTUDIANTES_EXITOSO))
                this.onCargaExitosa.emit();
                this.onReset();
            },
            error: () => {
                this.messageService.add(errorMessage(Mensaje.ERROR_CARGAR_ESTUDIANTES))
                this.onReset();
            }
        });
    }

    onReset() {
        this.file = null
        this.labelFile = null;
        this.loading = false;
    }
}
