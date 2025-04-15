import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage, errorMessage } from 'src/app/core/utils/message-util';
import { DocenteService } from '../../services/docente.service';

@Component({
  selector: 'app-cargar-docentes',
  templateUrl: './cargar-docentes.component.html',
  styleUrls: ['./cargar-docentes.component.scss']
})
export class CargarDocentesComponent implements OnInit {

    @Output() onCargaExitosa = new EventEmitter<void> ();

    file: File;
    loading: boolean;
    labelFile: string = null;

    constructor(
        private messageService: MessageService,
        private docenteService: DocenteService,
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
        this.docenteService.uploadDocentes(this.file).subscribe({
            next: () => {
                this.messageService.add(infoMessage(Mensaje.REGISTRO_DOCENTES_EXITOSO))
                this.onCargaExitosa.emit();
                this.onReset();
            },
            error: () => {
                this.messageService.add(errorMessage(Mensaje.ERROR_CARGAR_DOCENTESS))
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
