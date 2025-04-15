import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { AbreviaturaTitulo, CategoriaMinCiencia, EscalafonDocente, TipoVinculacion } from 'src/app/core/enums/domain-enum';
import { enumToSelectItems, getRandomNumber } from 'src/app/core/utils/util';

@Component({
  selector: 'app-informacion-universidad',
  templateUrl: './informacion-universidad.component.html',
  styleUrls: ['./informacion-universidad.component.scss']
})
export class InformacionUniversidadComponent implements OnInit {

    @Output() formReady = new EventEmitter<FormGroup>();

    escalafonesDocente: SelectItem[] = enumToSelectItems(EscalafonDocente);
    tiposVinculacion: SelectItem[] = enumToSelectItems(TipoVinculacion);

    universidadForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.universidadForm = this.fb.group({
            codigo: [getRandomNumber().toString()],
            facultad: [''],
            departamento: [''],
            tipoVinculacion: [null],
            escalafon: [null],
            observacion: [''],
            idsLineasInvestigacion: [''],
        });

        this.formReady.emit(this.universidadForm);
    }

    getFormControl(formControlName: string): FormControl {
        return this.universidadForm.get(formControlName) as FormControl;
    }

}
