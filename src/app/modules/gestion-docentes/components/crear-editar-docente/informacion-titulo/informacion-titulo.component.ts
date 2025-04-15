import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { CategoriaMinCiencia, TipoIdentificacion } from 'src/app/core/enums/domain-enum';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { AbreviaturaTitulo } from '../../../../../core/enums/domain-enum';

@Component({
  selector: 'app-informacion-titulo',
  templateUrl: './informacion-titulo.component.html',
  styleUrls: ['./informacion-titulo.component.scss']
})
export class InformacionTituloComponent implements OnInit {

    @Output() formReady = new EventEmitter<FormGroup>();

    abreviaturasTitulo: SelectItem[] = enumToSelectItems(AbreviaturaTitulo);
    categoriasMinCiencia: SelectItem[] = enumToSelectItems(CategoriaMinCiencia);
    tituloForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.tituloForm = this.fb.group({
            "id": [''],
            "titulo": [''],
            "abreviatura": [''],
            "universidad": ['', Validators.required],
            "categoriaMinCiencia": [''],
            "linkCvLac": [''],
        });

        this.formReady.emit(this.tituloForm);
    }

    getFormControl(formControlName: string): FormControl {
        return this.tituloForm.get(formControlName) as FormControl;
    }

}
