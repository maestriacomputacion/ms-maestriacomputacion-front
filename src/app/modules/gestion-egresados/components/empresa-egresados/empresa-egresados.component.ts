import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService, SelectItem } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { EmpresaService } from '../../services/empresas.service';
import { Mensaje } from 'src/app/core/enums/enums';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import { Empresa } from '../../models/empresa';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { EstadoEmpresa } from 'src/app/core/enums/enums';

@Component({
    selector: 'empresa-egresados',
    templateUrl: 'empresa-egresados.component.html',
    styleUrls: ['empresa-egresados.component.scss'],
})
export class EmpresaEgresadoComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    empresaForm: FormGroup;
    empresaId: number;
    editMode: boolean;
    loading = false;
    estados: SelectItem[] = enumToSelectItems(EstadoEmpresa);

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private empresaService: EmpresaService
    ) {}

    ngOnInit() {
        this.initForm();
        if (this.config.data?.empresaId) {
            this.extractEmpresaIdFromData();
        }
    }

    extractEmpresaIdFromData(): void {
        this.editMode = true;
        this.empresaId = Number(this.config.data.empresaId);
        this.loadDataForEdit(this.empresaId);
    }

    initForm(): void {
        this.empresaForm = this.fb.group({
            idEstudiante: [this.config.data?.estudianteId, Validators.required],
            nombre: [null, Validators.required],
            ubicacion: [null, Validators.required],
            cargo: [null, Validators.required],
            jefeDirecto: [null, Validators.required],
            telefono: [null, Validators.required],
            correo: [null, [Validators.required, Validators.email]],
            estado: [null, Validators.required],
        });

        this.formReady.emit(this.empresaForm);
    }

    setValuesForm(empresa: Empresa) {
        this.empresaForm.patchValue({
            ...empresa,
        });
    }

    getFormControl(formControlName: string): FormControl {
        return this.empresaForm.get(formControlName) as FormControl;
    }

    async addEmpresa() {
        this.loading = true;
        try {
            await firstValueFrom(
                this.empresaService.addEmpresa(this.empresaForm.value)
            );
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
        } catch (e) {
            this.handleErrorResponse(e);
        } finally {
            this.loading = false;
            this.closeDialog();
        }
    }

    async loadDataForEdit(id: number): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.empresaService.getEmpresa(id)
            );
            this.setValuesForm(response);
            this.empresaForm
                .get('idEstudiante')
                ?.setValue(this.config.data?.estudianteId);
        } catch (e) {
            this.handleErrorResponse(e);
        }
    }

    async updateEmpresa(): Promise<void> {
        this.loading = true;
        try {
            await firstValueFrom(
                this.empresaService.updateEmpresa(
                    this.empresaId,
                    this.empresaForm.value
                )
            );
            this.handleSuccessMessage(Mensaje.ACTUALIZACION_EXITOSA);
        } catch (e) {
            this.handleErrorResponse(e);
        } finally {
            this.loading = false;
            this.closeDialog();
        }
    }

    onCancel(): void {
        this.closeDialog();
    }

    onSave() {
        if (this.empresaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        this.editMode ? this.updateEmpresa() : this.addEmpresa();
    }

    handlerResponseException(response: any) {
        if (response.status !== 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    handleSuccessMessage(message: string) {
        this.messageService.add(infoMessage(message));
    }

    handleWarningMessage(message: string) {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }

    handleErrorResponse(error: any) {
        this.handlerResponseException(error);
        this.loading = false;
    }

    closeDialog() {
        this.ref.close();
    }
}
