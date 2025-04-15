import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { ExpertoService } from '../../services/experto.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Experto } from '../../models/experto';
import {
    confirmMessage,
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';

@Component({
    selector: 'app-crear-editar-experto',
    templateUrl: './crear-editar-experto.component.html',
    styleUrls: ['./crear-editar-experto.component.scss'],
})
export class CrearEditarExpertoComponent implements OnInit {
    loading: boolean = false;
    editMode: boolean = false;
    form: FormGroup;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private expertoService: ExpertoService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
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
            { label: 'Expertos', routerLink: 'expertos' },
            { label: this.editMode ? 'Editar' : 'Registrar' },
        ]);
    }

    enableEditMode() {
        this.editMode = true;
        this.loadExperto();
    }

    loadExperto() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.expertoService.getExperto(id).subscribe({
            next: (response) => this.setValuesForm(response),
        });
    }

    setValuesForm(experto: Experto) {
        this.personalForm.patchValue({
            ...experto.persona,
        });
        this.tituloForm.patchValue({
            ...experto,
        });
        this.vinculacionForm.patchValue({
            ...experto,
        });
    }

    onCancel() {
        if (this.form.pristine) {
            this.redirectToExpertos();
            return;
        }
        this.confirmationService.confirm({
            ...confirmMessage(Mensaje.CONFIRMAR_SALIR_SIN_GUARDAR),
            accept: () => this.redirectToExpertos(),
        });
    }

    onSave() {
        if (this.form.invalid) {
            this.markAllFormsAsTouched();
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.editMode ? this.updateExperto() : this.createExperto();
    }

    redirectToExpertos() {
        this.router.navigate(['expertos']);
    }

    createExperto() {
        const request = this.mapExpertoRequest();
        this.loading = true;
        this.expertoService
            .createExperto(request)
            .subscribe({
                next: () =>
                    this.messageService.add(
                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                    ),
                error: (e) => this.handleResponseException(e),
                complete: () => this.redirectToExpertos(),
            })
            .add(() => (this.loading = false));
    }

    updateExperto() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const request = this.mapExpertoRequest();
        this.loading = true;
        this.expertoService
            .updateExperto(id, request)
            .subscribe({
                next: () =>
                    this.messageService.add(
                        infoMessage(Mensaje.ACTUALIZACION_EXITOSA)
                    ),
                error: (e) => this.handleResponseException(e),
                complete: () => this.redirectToExpertos(),
            })
            .add(() => (this.loading = false));
    }

    handleResponseException(response: any) {
        if (response.status !== 501) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    initForm(): void {
        this.form = this.fb.group({
            personal: this.fb.group({}),
            titulo: this.fb.group({}),
            vinculacion: this.fb.group({}),
        });
    }

    addForm(name: string, group: FormGroup) {
        this.form.setControl(name, group);
    }

    mapExpertoRequest(): Experto {
        const personalValues = this.personalForm.getRawValue();
        const tituloValues = this.tituloForm.getRawValue();
        const vinculacionValues = this.vinculacionForm.getRawValue();

        return {
            persona: { ...personalValues },
            ...tituloValues,
            ...vinculacionValues,
        };
    }

    markAllFormsAsTouched() {
        this.markFormAsTouched(this.personalForm);
        this.markFormAsTouched(this.tituloForm);
        this.markFormAsTouched(this.vinculacionForm);
    }

    private markFormAsTouched(form: FormGroup) {
        form.markAllAsTouched();
    }

    get personalForm() {
        return this.form.get('personal') as FormGroup;
    }

    get tituloForm() {
        return this.form.get('titulo') as FormGroup;
    }

    get vinculacionForm() {
        return this.form.get('vinculacion') as FormGroup;
    }
}
