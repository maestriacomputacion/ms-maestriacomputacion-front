import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { confirmMessage, errorMessage, infoMessage, warnMessage } from 'src/app/core/utils/message-util';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { DocenteService } from '../../services/docente.service';
import { Docente } from '../../models/docente';
import { mapResponseException } from 'src/app/core/utils/exception-util';

@Component({
  selector: 'app-crear-editar-docente',
  templateUrl: './crear-editar-docente.component.html',
  styleUrls: ['./crear-editar-docente.component.scss']
})
export class CrearEditarDocenteComponent implements OnInit {

    loading: boolean;
    editMode: boolean;
    form: FormGroup;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private docenteService: DocenteService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router:Router,
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.initForm();
        if (this.router.url.includes('editar')) {
            this.enableEditMode();
        }
        this.setBreadcrumb();
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Docentes' , routerLink:'docentes' },
            { label: this.editMode ? 'Editar' : 'Registrar' },
        ]);
    }

    enableEditMode() {
        this.editMode = true;
        this.loadDocente();
    }

    loadDocente() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.docenteService.getDocente(id).subscribe({
            next: (response) => this.setValuesForm(response),
        });
    }

    setValuesForm(docente: Docente) {
        this.personalForm.patchValue({
            ...docente.persona
        });
        this.tituloForm.patchValue({
            ...docente.titulos[0]
        })
        this.universidadForm.patchValue({
            ...docente
        })
    }

    onCancel() {
        if(this.form.pristine) {
            this.redirectToDocentes();
            return;
        }
        this.confirmationService.confirm({
            ...confirmMessage(Mensaje.CONFIRMAR_SALIR_SIN_GUARDAR),
            accept: () => this.redirectToDocentes(),
        });
    }

    onSave() {
        if(this.form.invalid) {
            this.personalForm.markAllAsTouched();
            this.tituloForm.markAllAsTouched();
            this.universidadForm.markAllAsTouched();
            this.messageService.clear();
            this.messageService.add(warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS));
            return;
        }
        this.editMode ? this.updateDocente() : this.createDocente();
    }

    redirectToDocentes() {
        this.router.navigate(['docentes'])
    }

    createDocente() {
        const request = this.mapRequest();
        this.loading = true;
        this.docenteService.createDocente(request).subscribe({
            next: () =>  this.messageService.add(infoMessage(Mensaje.GUARDADO_EXITOSO)),
            error: (e) => this.handlerResponseException(e),
            complete: () => this.redirectToDocentes()
        }).add(() => this.loading = false);
    }

    updateDocente() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const request = this.mapRequest();
        this.loading = true;
        this.docenteService.updateDocente(id, request).subscribe({
            next: () => this.messageService.add(infoMessage(Mensaje.ACTUALIZACION_EXITOSA)),
            error: (e) => this.handlerResponseException(e),
            complete: () => this.redirectToDocentes()
        }).add(() => this.loading = false);
    }

    handlerResponseException(response: any) {
        if (response.status != 501) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value))
        });
    }

    initForm(): void {
        this.form = this.fb.group({
            personal: this.fb.group({}),
            titulo: this.fb.group({}),
            universidad: this.fb.group({}),
        });
    }

    addForm(name: string, group: FormGroup) {
        this.form.setControl(name, group);
    }

    mapRequest(): Docente {
        const personalValue = this.personalForm.getRawValue();
        const tituloValue = this.tituloForm.getRawValue();
        const universidadValue = this.universidadForm.getRawValue();

        return {
            persona: { ...personalValue },
            titulos: [{ ...tituloValue }],
            ...universidadValue,
        };
      }

    get personalForm(): FormGroup {
        return this.form.get('personal') as FormGroup;
    }

    get tituloForm(): FormGroup {
        return this.form.get('titulo') as FormGroup;
    }

    get universidadForm(): FormGroup {
        return this.form.get('universidad') as FormGroup;
    }

}
