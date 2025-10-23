import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialApoyo } from '../../models/material-apoyo';
import { MaterialApoyoService } from '../../services/material-apoyo.service';
import { RegistrarCursoService } from '../../services/registrar-curso.service';
import { Subscription } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    switchMap,
    finalize,
} from 'rxjs/operators';

import { AsignaturaModel, DocenteModel } from '../../models/curso.model';

@Component({
    selector: 'app-registrar-curso',
    templateUrl: './registrar-curso.component.html',
    styleUrls: ['./registrar-curso.component.scss'],
})
export class RegistrarCursoComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    // asignatura seleccionada (se rellenará desde el modal)
    asignatura: AsignaturaModel | null = null;

    sourceDocentes: DocenteModel[] = [];
    targetDocentes: DocenteModel[] = [];
    loadingDocentes: boolean = false;

    // asignaturas modal
    asignaturas: AsignaturaModel[] = [];
    loadingAsignaturas = false;
    displayAsignaturaDialog = false;
    // asignatura seleccionada (temporal en el modal)
    modalSelectedAsignaturas: AsignaturaModel[] = [];

    materialesApoyo: MaterialApoyo[] = [];
    loadingMaterials: boolean = false;

    // Observación se guarda en el FormControl 'observacion'
    // Material dialog + selection
    displayMaterialDialog: boolean = false;
    // materiales seleccionados en el formulario
    selectedMateriales: MaterialApoyo[] = [];
    // selección temporal dentro del diálogo
    tableSelection: MaterialApoyo[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly materialApoyoService: MaterialApoyoService,
        private readonly registrarCursoService: RegistrarCursoService,
        private readonly messageService: MessageService
    ) {}

    private readonly subs: Subscription[] = [];
    cursoExistsMessage: string | null = null;
    saving: boolean = false;
    loadingAsignaturasError = false;

    ngOnInit() {
        this.form = this.fb.group({
            grupo: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z]$/)],
            ],
            horario: [''],
            salon: ['', [Validators.maxLength(100)]],
            observacion: ['', [Validators.maxLength(200)]],
        });

        // convertir grupo a una sola letra mayúscula usando valueChanges (Angular way)
        const grupoControl = this.form.get('grupo');
        if (grupoControl) {
            grupoControl.valueChanges.subscribe((val: string) => {
                if (typeof val !== 'string') return;
                const trimmed = val.trim().charAt(0) || '';
                const upper = trimmed.toUpperCase();
                if (upper !== val) {
                    grupoControl.setValue(upper, { emitEvent: false });
                }
            });
        }

        // cargar materiales desde el servicio (mostrar estado de carga)
        this.loadingMaterials = true;
        this.materialApoyoService
            .listMaterialApoyo()
            .pipe(finalize(() => (this.loadingMaterials = false)))
            .subscribe({
                next: (resp) => {
                    if (resp && resp.typeResponse === 'SUCCESS') {
                        this.materialesApoyo = resp.data || [];
                    }
                },
                error: (err) =>
                    console.error('Error cargando materiales de apoyo', err),
            });

        // validar existencia de curso cuando cambia el grupo (debounce)
        const grupoCtrl = this.form.get('grupo');
        if (grupoCtrl) {
            const s = (grupoCtrl.valueChanges as any)
                .pipe(
                    debounceTime(400),
                    distinctUntilChanged(),
                    // Validar existencia tan pronto haya valor y exista una asignatura asociada
                    filter(
                        (v: string) =>
                            !!v &&
                            v.length > 0 &&
                            !!this.asignatura &&
                            !!this.asignatura.id
                    ),
                    switchMap((val: string) => {
                        const asignaturaId = this.asignatura
                            ? this.asignatura.id || 0
                            : 0;
                        return this.registrarCursoService.exists(
                            val,
                            asignaturaId
                        );
                    })
                )
                .subscribe({
                    next: (resp) => {
                        if (
                            resp &&
                            resp.typeResponse === 'SUCCESS' &&
                            resp.data === true
                        ) {
                            const detail = resp.message || null;
                            this.cursoExistsMessage = detail;
                            grupoCtrl.setErrors({ exists: true });
                        } else {
                            this.cursoExistsMessage = null;
                            const errors = grupoCtrl.errors || {};
                            if (errors.exists) delete errors.exists;
                            if (Object.keys(errors).length === 0) {
                                grupoCtrl.setErrors(null);
                            } else {
                                grupoCtrl.setErrors(errors);
                            }
                        }
                    },
                    error: (err) => {
                        const detail =
                            err?.error?.message || err?.message || null;
                        this.cursoExistsMessage = detail;
                        if (detail) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Atención',
                                detail,
                            });
                        }
                    },
                });
            this.subs.push(s as Subscription);
        }
    }

    get grupo() {
        return this.form.get('grupo');
    }

    get salonControl() {
        return this.form.get('salon');
    }

    get observacionControl() {
        return this.form.get('observacion');
    }

    get observacionLength(): number {
        const v = this.observacionControl?.value;
        return v ? String(v).length : 0;
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        // Verificar existencia una última vez antes de enviar solo si hay docentes seleccionados
        const grupo = this.form.value.grupo;
        const asignaturaId = this.asignatura ? this.asignatura.id || 0 : 0;

        const doSubmit = () => {
            const payload = {
                grupo: this.form.value.grupo,
                asignaturaId: this.asignatura?.id || 0,
                docentesIds: this.targetDocentes.map((d) =>
                    d.id ? d.id : Number(d.codigo) || 0
                ),
                horario: this.form.value.horario,
                salon: this.form.value.salon,
                materialApoyoIds: this.selectedMateriales
                    .map((m) => (m as any).id)
                    .filter((id) => !!id),
                observacion: this.form.value.observacion,
            };

            this.saving = true;
            const regSub = this.registrarCursoService
                .registrarCurso(payload)
                .subscribe({
                    next: (r) => {
                        if (r.typeResponse === 'SUCCESS') {
                            // mostrar toast con el message del ApiResponse
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: r.message,
                            });
                            console.log('Curso registrado', r.data);
                            this.form.reset();
                            this.selectedMateriales = [];
                        } else {
                            // mostrar mensaje de error devuelto por la API
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: r.message,
                            });
                        }
                        this.saving = false;
                    },
                    error: (err) => {
                        console.error('Error registrando curso', err);
                        const detail =
                            err?.error?.message ||
                            err?.message ||
                            'Error registrando curso';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail,
                        });
                        this.saving = false;
                    },
                });
            this.subs.push(regSub);
        };

        if (!this.targetDocentes || this.targetDocentes.length === 0) {
            // no hay docentes seleccionados: omitir la verificación de existencia y enviar
            doSubmit();
            return;
        }

        const existsSub = this.registrarCursoService
            .exists(grupo, asignaturaId)
            .subscribe({
                next: (resp) => {
                    if (
                        resp &&
                        resp.typeResponse === 'SUCCESS' &&
                        resp.data === true
                    ) {
                        this.cursoExistsMessage = resp.message;
                        this.form.get('grupo')?.setErrors({ exists: true });
                        return;
                    }

                    // construir payload y enviar
                    doSubmit();
                },
                error: (err) =>
                    console.error('Error validando existencia', err),
            });
        this.subs.push(existsSub);
    }

    ngOnDestroy(): void {
        for (const s of this.subs) {
            if (s && !s.closed) s.unsubscribe();
        }
    }

    // Asignaturas modal handlers
    openAsignaturaDialog() {
        this.modalSelectedAsignaturas = this.asignatura
            ? [this.asignatura]
            : [];
        this.displayAsignaturaDialog = true;
        // cargar asignaturas si no están cargadas
        if (!this.asignaturas || this.asignaturas.length === 0) {
            this.loadingAsignaturas = true;
            const sub = this.registrarCursoService
                .listAsignaturas()
                .pipe(finalize(() => (this.loadingAsignaturas = false)))
                .subscribe({
                    next: (resp) => {
                        if (resp && resp.typeResponse === 'SUCCESS') {
                            this.asignaturas = resp.data || [];
                        } else {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Atención',
                                detail:
                                    resp?.message ||
                                    'No se pudieron cargar asignaturas',
                            });
                        }
                    },
                    error: (err) => {
                        const detail =
                            err?.error?.message ||
                            err?.message ||
                            'Error cargando asignaturas';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail,
                        });
                        this.loadingAsignaturasError = true;
                    },
                });
            this.subs.push(sub);
        }
    }

    confirmAsignaturaSelection() {
        if (
            this.modalSelectedAsignaturas &&
            this.modalSelectedAsignaturas.length > 0
        ) {
            if (this.modalSelectedAsignaturas.length > 1) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: `Se seleccionaron ${this.modalSelectedAsignaturas.length} asignaturas; se usará la primera seleccionada.`,
                });
            }
            this.asignatura = this.modalSelectedAsignaturas[0];
            // reset existing cursoExistsMessage when asignatura cambia
            this.cursoExistsMessage = null;
            this.clearGrupoExistsErrorIfAny();
            // Validar existencia inmediatamente si ya hay un grupo escrito
            const currentGrupo = this.form.get('grupo')?.value;
            if (currentGrupo && currentGrupo.length > 0)
                this.validateGroupWithAsignatura(currentGrupo);
        }
        this.displayAsignaturaDialog = false;
    }

    cancelAsignaturaSelection() {
        this.modalSelectedAsignaturas = [];
        this.displayAsignaturaDialog = false;
    }

    selectAsignatura(asign: AsignaturaModel) {
        this.asignatura = asign;
        // limpiar estado de existencia de curso al cambiar asignatura
        this.cursoExistsMessage = null;
        this.clearGrupoExistsErrorIfAny();
        this.displayAsignaturaDialog = false;
        // cargar docentes asociados a la asignatura seleccionada
        // Validar existencia inmediatamente si ya hay un grupo escrito
        const currentGrupo = this.form.get('grupo')?.value;
        if (currentGrupo && currentGrupo.length > 0) {
            this.validateGroupWithAsignatura(currentGrupo);
        }
        if (asign?.id) {
            this.loadingDocentes = true;
            const sub = this.registrarCursoService
                .listDocentesByAsignatura(asign.id)
                .pipe(finalize(() => (this.loadingDocentes = false)))
                .subscribe({
                    next: (resp) => {
                        if (resp && resp.typeResponse === 'SUCCESS') {
                            // colocar todos en source y limpiar target
                            this.sourceDocentes = resp.data || [];
                            this.targetDocentes = [];
                        } else {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Atención',
                                detail:
                                    resp?.message ||
                                    'No se encontraron docentes',
                            });
                        }
                    },
                    error: (err) => {
                        const detail =
                            err?.error?.message ||
                            err?.message ||
                            'Error cargando docentes';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail,
                        });
                    },
                });
            this.subs.push(sub);
        }
    }

    private clearGrupoExistsErrorIfAny() {
        const grupoCtrl = this.form.get('grupo');
        if (!grupoCtrl) return;
        const errors = grupoCtrl.errors || {};
        if (errors.exists) delete errors.exists;
        if (Object.keys(errors).length === 0) grupoCtrl.setErrors(null);
        else grupoCtrl.setErrors(errors);
    }

    /**
     * Valida existencia del curso para la combinación grupo + asignatura.
     * Actualiza `cursoExistsMessage` y los errores del control `grupo`.
     */
    private validateGroupWithAsignatura(grupoValue: string) {
        if (!grupoValue || !this.asignatura) return;
        const asignaturaId = this.asignatura?.id || 0;
        const grupoCtrl = this.form.get('grupo');
        const sub = this.registrarCursoService
            .exists(grupoValue, asignaturaId)
            .subscribe({
                next: (resp) => {
                    if (
                        resp &&
                        resp.typeResponse === 'SUCCESS' &&
                        resp.data === true
                    ) {
                        const detail = resp.message || null;
                        this.cursoExistsMessage = detail;
                        grupoCtrl?.setErrors({ exists: true });
                    } else {
                        this.cursoExistsMessage = null;
                        if (grupoCtrl) {
                            const errors = grupoCtrl.errors || {};
                            if (errors.exists) delete errors.exists;
                            if (Object.keys(errors).length === 0)
                                grupoCtrl.setErrors(null);
                            else grupoCtrl.setErrors(errors);
                        }
                    }
                },
                error: (err) => {
                    const detail = err?.error?.message || err?.message || null;
                    this.cursoExistsMessage = detail;
                    if (detail) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Atención',
                            detail,
                        });
                    }
                },
            });
        this.subs.push(sub);
    }

    openMaterialDialog() {
        // Abrir diálogo y precargar selección con los ya seleccionados
        this.tableSelection = [...this.selectedMateriales];
        this.displayMaterialDialog = true;
    }

    confirmMaterialSelection() {
        this.selectedMateriales = [...this.tableSelection];
        this.displayMaterialDialog = false;
    }

    cancelMaterialSelection() {
        this.tableSelection = [];
        this.displayMaterialDialog = false;
    }

    removeSelectedMaterial(material: MaterialApoyo) {
        if (!material) return;
        // confirmación para evitar eliminación accidental (heurística: user control & freedom)
        if (!confirm('¿Quitar el material seleccionado?')) return;
        const id = (material as any).id;
        if (typeof id === 'number') {
            this.selectedMateriales = this.selectedMateriales.filter(
                (m) => m.id !== id
            );
        } else {
            this.selectedMateriales = this.selectedMateriales.filter(
                (m) => m.nombre !== material.nombre
            );
        }
    }
}
