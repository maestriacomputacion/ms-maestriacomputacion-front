import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
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

import {
    AsignaturaModel,
    DocenteModel,
    BackendCurso,
} from '../../models/curso.model';

@Component({
    selector: 'app-registrar-curso',
    templateUrl: './registrar-curso.component.html',
    styleUrls: ['./registrar-curso.component.scss'],
})
export class RegistrarCursoComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    asignatura: AsignaturaModel | null = null;

    sourceDocentes: DocenteModel[] = [];
    targetDocentes: DocenteModel[] = [];
    loadingDocentes: boolean = false;

    asignaturas: AsignaturaModel[] = [];
    loadingAsignaturas = false;
    displayAsignaturaDialog = false;
    modalSelectedAsignaturas: AsignaturaModel[] = [];

    materialesApoyo: MaterialApoyo[] = [];
    loadingMaterials: boolean = false;

    displayMaterialDialog: boolean = false;
    selectedMateriales: MaterialApoyo[] = [];
    tableSelection: MaterialApoyo[] = [];

    isEditMode: boolean = false;
    isViewMode: boolean = false;
    cursoId: number | null = null;
    cursoOriginal: BackendCurso | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly materialApoyoService: MaterialApoyoService,
        private readonly registrarCursoService: RegistrarCursoService,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    private readonly subs: Subscription[] = [];
    cursoExistsMessage: string | null = null;
    saving: boolean = false;
    loadingAsignaturasError = false;

    ngOnInit() {
        // Verificar si estamos en modo edición o vista
        this.route.params.subscribe((params) => {
            const path = this.route.snapshot.routeConfig?.path || '';
            if (path.startsWith('ver-curso')) {
                this.isViewMode = true;
                this.isEditMode = false;
                if (params['id']) {
                    this.cursoId = +params['id'];
                    this.loadCursoForEdit(this.cursoId);
                }
            } else if (params['id']) {
                this.isEditMode = true;
                this.isViewMode = false;
                this.cursoId = +params['id'];
                this.loadCursoForEdit(this.cursoId);
            }
        });

        this.form = this.fb.group({
            grupo: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z]$/)],
            ],
            horario: ['', [Validators.maxLength(100)]],
            salon: ['', [Validators.maxLength(50)]],
            observacion: ['', [Validators.maxLength(200)]],
        });

        // Si estamos en modo edición o vista, deshabilitar el control 'grupo'
        if (this.isEditMode || this.isViewMode) {
            const grupoCtrlAfter = this.form.get('grupo');
            grupoCtrlAfter?.disable({ emitEvent: false });
        }

        // Convertir grupo a una sola letra mayúscula
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

        // Cargar materiales desde el servicio
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

        // Validar existencia de curso cuando cambia el grupo (debounce)
        const grupoCtrl = this.form.get('grupo');
        // No subscribir a la validación de existencia si estamos en modo edición o vista
        if (grupoCtrl && !this.isEditMode && !this.isViewMode) {
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

        const serviceCall =
            this.isEditMode && this.cursoId
                ? this.registrarCursoService.actualizarCurso(
                      this.cursoId,
                      payload
                  )
                : this.registrarCursoService.registrarCurso(payload);

        const submitSub = serviceCall.subscribe({
            next: (r) => {
                if (r.typeResponse === 'SUCCESS') {
                    const toastLife = 2500; // ms
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: r.message,
                        life: toastLife,
                    });
                    console.log(
                        this.isEditMode
                            ? 'Curso actualizado'
                            : 'Curso registrado',
                        r.data
                    );
                    this.form.reset();
                    this.selectedMateriales = [];
                    // Esperar un momento para que el toast sea visible antes de navegar
                    const navigateDelay = 1000; // ms
                    setTimeout(() => {
                        this.router.navigate([
                            '/gestion-matricula-academica',
                            'gestion-cursos',
                        ]);
                    }, navigateDelay);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: r.message,
                    });
                }
                this.saving = false;
            },
            error: (err) => {
                console.error(
                    this.isEditMode
                        ? 'Error actualizando curso'
                        : 'Error registrando curso',
                    err
                );
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    (this.isEditMode
                        ? 'Error actualizando curso'
                        : 'Error registrando curso');
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
                this.saving = false;
            },
        });
        this.subs.push(submitSub);
    }

    ngOnDestroy(): void {
        for (const s of this.subs) {
            if (s && !s.closed) s.unsubscribe();
        }
    }

    openAsignaturaDialog() {
        this.modalSelectedAsignaturas = this.asignatura
            ? [this.asignatura]
            : [];
        this.displayAsignaturaDialog = true;
        // Cargar asignaturas si no están cargadas
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
            this.cursoExistsMessage = null;
            this.clearGrupoExistsErrorIfAny();
            // Validar existencia inmediatamente si ya hay un grupo escrito (solo fuera de modo edición)
            const currentGrupo = this.form.get('grupo')?.value;
            if (!this.isEditMode && currentGrupo && currentGrupo.length > 0)
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
        // Cargar docentes asociados a la asignatura seleccionada
        // Validar existencia inmediatamente si ya hay un grupo escrito (solo fuera de modo edición)
        const currentGrupo = this.form.get('grupo')?.value;
        if (!this.isEditMode && currentGrupo && currentGrupo.length > 0) {
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

    onCloseView() {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-cursos',
        ]);
    }

    /**
     * Maneja la acción de cancelar el registro/edición del curso.
     * Si el formulario tiene cambios, solicita confirmación al usuario.
     */
    onCancel(): void {
        // Evitar navegación si se está guardando
        if (this.saving) return;

        // Si el formulario está modificado, confirmar la cancelación
        const hayCambios = this.form && this.form.dirty;
        if (hayCambios) {
            const confirmar = confirm(
                'Existen cambios sin guardar. Si continúa, se perderán los cambios. ¿Desea continuar?'
            );
            if (!confirmar) return;
        }

        // Navegar de regreso al listado de cursos
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-cursos',
        ]);
    }

    openMaterialDialog() {
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
        if (!material) {
            return;
        }

        const confirmed = confirm('¿Quitar el material seleccionado?');
        if (!confirmed) {
            return;
        }

        const id = (material as any).id;
        if (typeof id === 'number') {
            this.selectedMateriales = this.selectedMateriales.filter(
                (m) => m.id !== id
            );
            return;
        }

        this.selectedMateriales = this.selectedMateriales.filter(
            (m) => m.nombre !== material.nombre
        );
    }

    /**
     * Carga los datos del curso para edición
     */
    private loadCursoForEdit(id: number): void {
        const loadSub = this.registrarCursoService.getCursoById(id).subscribe({
            next: (resp) => {
                if (resp && resp.typeResponse === 'SUCCESS' && resp.data) {
                    this.cursoOriginal = resp.data;
                    this.populateFormWithCursoData(resp.data);
                    // Si estamos en modo solo lectura, deshabilitar el formulario
                    if (this.isViewMode) {
                        this.form.disable();
                    }
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: resp?.message || 'No se pudo cargar el curso',
                    });
                    this.router.navigate([
                        '/gestion-matricula-academica',
                        'gestion-cursos',
                    ]);
                }
            },
            error: (err) => {
                console.error('Error cargando curso para edición', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error cargando curso';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
                this.router.navigate([
                    '/gestion-matricula-academica',
                    'gestion-cursos',
                ]);
            },
        });
        this.subs.push(loadSub);
    }

    /**
     * Pobla el formulario con los datos del curso
     */
    private populateFormWithCursoData(curso: BackendCurso): void {
        // Llenar formulario básico
        this.form.patchValue({
            grupo: curso.grupo,
            horario: curso.horario || '',
            salon: curso.salon || '',
            observacion: curso.observacion || '',
        });

        // Asegurar que 'grupo' permanezca inhabilitado en modo edición/vista
        if (this.isEditMode || this.isViewMode) {
            const grupoCtrl = this.form.get('grupo');
            grupoCtrl?.disable({ emitEvent: false });
        }

        // Establecer asignatura
        if (curso.asignatura) {
            this.asignatura = curso.asignatura;
        }

        // Cargar docentes asociados a la asignatura
        if (curso.asignatura?.id) {
            this.loadingDocentes = true;
            const docentesSub = this.registrarCursoService
                .listDocentesByAsignatura(curso.asignatura.id)
                .pipe(finalize(() => (this.loadingDocentes = false)))
                .subscribe({
                    next: (resp) => {
                        if (resp && resp.typeResponse === 'SUCCESS') {
                            this.sourceDocentes = resp.data || [];

                            // Mapear docentes seleccionados del curso
                            if (curso.docentes && curso.docentes.length > 0) {
                                // Buscar los docentes completos en la lista de disponibles usando los IDs del curso
                                this.targetDocentes = curso.docentes
                                    .map((cursoDocente) =>
                                        this.sourceDocentes.find(
                                            (disponibleDocente) =>
                                                disponibleDocente.id ===
                                                cursoDocente.id
                                        )
                                    )
                                    .filter(
                                        (docente) => docente !== undefined
                                    ) as DocenteModel[];

                                // Remover docentes seleccionados de la lista de disponibles
                                this.sourceDocentes =
                                    this.sourceDocentes.filter(
                                        (docente) =>
                                            !curso.docentes?.some(
                                                (d) => d.id === docente.id
                                            )
                                    );
                            } else {
                                this.targetDocentes = [];
                            }
                        }
                    },
                    error: (err) => {
                        console.error(
                            'Error cargando docentes para edición',
                            err
                        );
                    },
                });
            this.subs.push(docentesSub);
        }

        // Establecer materiales seleccionados
        if (curso.materiales && curso.materiales.length > 0) {
            this.selectedMateriales = curso.materiales.map((material) => ({
                id: material.id,
                nombre: material.nombre,
                descripcion: material.descripcion,
                enlace: material.enlace,
            }));
        }
    }
}
