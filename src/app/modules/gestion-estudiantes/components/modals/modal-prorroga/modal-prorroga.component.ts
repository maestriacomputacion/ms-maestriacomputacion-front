import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoProrrogaSupencion } from 'src/app/core/enums/domain-enum';
import { Mensaje } from 'src/app/core/enums/enums';
import { warnMessage } from 'src/app/core/utils/message-util';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { Prorroga } from '../../../models/prorroga';

@Component({
    selector: 'app-modal-prorroga',
    templateUrl: './modal-prorroga.component.html',
    styleUrls: ['./modal-prorroga.component.scss'],
})
export class ModalProrrogaComponent implements OnInit {

    form: FormGroup;

    tiposProrrogaSuspencion: SelectItem[] = enumToSelectItems(TipoProrrogaSupencion);
    loading: boolean;

    constructor(
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private messageService: MessageService,
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
        const prorroga = this.config.data?.prorroga;
        if (prorroga) {
            this.loadProrroga(prorroga);
        }
    }

    initForm(): void {
        this.form = this.fb.group({
            id: [null],
            linkDocumento: ['', Validators.required],
            resolucion: ['', Validators.required],
            tipoProrroga: [null, Validators.required],
            fecha: ['', Validators.required],
        });
    }

    getFormControl(formControlName: string): FormControl {
        return this.form.get(formControlName) as FormControl;
    }

    loadProrroga(prorroga: Prorroga) {
        this.form.patchValue({ ...prorroga });
    }

    onSave() {
        if(this.form.invalid) {
            this.form.markAllAsTouched();
            this.messageService.add(warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS));
            return;
        }
        this.ref.close(this.form.getRawValue());
    }

    onClose() {
        this.ref.close();
    }
}
