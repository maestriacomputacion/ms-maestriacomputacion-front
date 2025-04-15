import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Mensaje, TipoRol } from 'src/app/core/enums/enums';
import { infoMessage, errorMessage } from 'src/app/core/utils/message-util';
import { ExpertoService } from '../../services/experto.service';


@Component({
  selector: 'app-cargar-expertos',
  templateUrl: './cargar-expertos.component.html',
  styleUrls: ['./cargar-expertos.component.scss']
})
export class CargarExpertosComponent implements OnInit {

  @Output() onCargaExitosa = new EventEmitter<void>();

  file: File;
  loading: boolean;
  labelFile: string = null;

  constructor(
    private messageService: MessageService,
    private expertoService: ExpertoService,
  ) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      this.file = selectedFile;
      this.labelFile = this.file.name + ' - ' + (this.file.size / 1024).toFixed(0) + ' KB';
    }
  }

  onCargar() {
    this.loading = true;
    this.expertoService.uploadExpertos(this.file).subscribe({
      next: () => {
        this.messageService.add(infoMessage(TipoRol.REGISTRO_EXPERTOS_EXITOSO))
        this.onCargaExitosa.emit();
        this.onReset();
      },
      error: () => {
        this.messageService.add(errorMessage(TipoRol.ERROR_CARGAR_EXPERTOS))
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
