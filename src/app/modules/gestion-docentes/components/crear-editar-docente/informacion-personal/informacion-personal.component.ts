import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { TipoIdentificacion } from 'src/app/core/enums/domain-enum';
import { enumToSelectItems } from 'src/app/core/utils/util';

@Component({
  selector: 'app-informacion-personal',
  templateUrl: './informacion-personal.component.html',
  styleUrls: ['./informacion-personal.component.scss']
})
export class InformacionPersonalComponent implements OnInit {

    @Output() formReady = new EventEmitter<FormGroup>();

    tiposIndentificacion: SelectItem[] = enumToSelectItems(TipoIdentificacion);
    personalForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.personalForm = this.fb.group({
            "id": [''],
            "identificacion": ['', Validators.required],
            "nombre": ['', Validators.required],
            "apellido": ['', Validators.required],
            "telefono": [''],
            "correoElectronico": ['', [Validators.required, Validators.email]],
            "genero": ['', Validators.required],
            "tipoIdentificacion": [null, Validators.required],
        });

        this.formReady.emit(this.personalForm);
    }

    getFormControl(formControlName: string): FormControl {
        return this.personalForm.get(formControlName) as FormControl;
    }
}
