import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Discapacidad, Etnia, TipoIdentificacion, TipoPoblacion } from '../../../../../core/enums/domain-enum';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-informacion-personal',
    templateUrl: './informacion-personal.component.html',
    styleUrls: ['./informacion-personal.component.scss'],
})
export class InformacionPersonalComponent implements OnInit {

    @Output() formReady = new EventEmitter<FormGroup>();

    tiposIndentificacion: SelectItem[] = enumToSelectItems(TipoIdentificacion);
    tiposPoblacion: SelectItem[] = enumToSelectItems(TipoPoblacion);
    etnias: SelectItem[] = enumToSelectItems(Etnia);
    discapcidades: SelectItem[] = enumToSelectItems(Discapacidad);

    personalForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.personalForm = this.fb.group({
            "idPersona": [''],
            "codigo": ['', Validators.required],
            "tipoIdentificacion": ['', Validators.required],
            "identificacion": ['', Validators.required],
            "nombre": ['', Validators.required],
            "apellido": ['', Validators.required],
            "correoUniversidad": ['', [Validators.required, Validators.email]],
            "ciudadResidencia": [''],
            "tituloPregrado": [''],
            "telefono": [''],
            "genero": ['', Validators.required],
            "tipoPoblacion": [null],
            "etnia": [null],
            "discapacidad": [null],
        });

        this.formReady.emit(this.personalForm);
    }

    getFormControl(formControlName: string): FormControl {
        return this.personalForm.get(formControlName) as FormControl;
    }
}
