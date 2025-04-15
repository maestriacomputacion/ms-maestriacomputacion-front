import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { Aviso } from 'src/app/core/enums/enums';
import { errorMessage } from 'src/app/core/utils/message-util';
import { mapResponseException } from 'src/app/core/utils/exception-util';

@Component({
    selector: 'app-custom-file-upload',
    templateUrl: './custom-file-upload.component.html',
    styleUrls: ['./custom-file-upload.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomFileUploadComponent),
            multi: true,
        },
    ],
})
export class CustomFileUploadComponent implements ControlValueAccessor {
    @Input() arrayName: string;
    @Input() evaluacionId: number;
    @Input() filename: string;
    @Input() isRespuestaValid: boolean;
    @Input() selected: any;

    @Output() archivoSeleccionado: EventEmitter<any> = new EventEmitter<any>();
    @Output() archivoDeseleccionado: EventEmitter<any> =
        new EventEmitter<any>();

    @ViewChild('fileUpload') fileUpload!: FileUpload;

    value: File | any = null;
    onChange: any = () => {};
    onTouched: any = () => {};

    constructor(private messageService: MessageService) {}

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Implementar según sea necesario
    }

    convertFileToBase64(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                const base64 = base64String.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    onFileChange(event: any) {
        const selectedFiles: FileList = event.files;
        const maxFileSize = 20000000; // 20 MB
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            if (selectedFile.size > maxFileSize) {
                this.messageService.add(
                    errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
                );
                return null;
            }
            const fileType = selectedFile.type.split('/')[1];
            this.convertFileToBase64(selectedFile)
                .then((base64) => {
                    this.selected[`${this.arrayName}.${this.filename}`] =
                        selectedFile;
                    this.archivoSeleccionado.emit([
                        this.filename,
                        selectedFile,
                        this.arrayName,
                        `${this.filename.slice(0, -1)}.${fileType}-${base64}`,
                    ]);
                })
                .catch((error) => {
                    console.error(
                        'Error al convertir el archivo a base64:',
                        error
                    );
                });
            this.onChange(selectedFile);
            this.onTouched();
            return selectedFile;
        }

        return null;
    }

    clearFile(): void {
        this.selected[`${this.arrayName}.${this.filename}`] = null;
        this.archivoDeseleccionado.emit([this.filename, this.arrayName]);
        this.value = null;
        this.fileUpload.clear();
        this.onChange(null);
        this.onTouched();
    }

    handlerResponseException(response: any) {
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }
}
