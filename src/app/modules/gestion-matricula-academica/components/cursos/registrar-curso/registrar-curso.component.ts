import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    finalize,
    takeUntil,
} from 'rxjs/operators';

import { MaterialApoyo } from '../../../models/material-apoyo';
import { MaterialApoyoService } from '../../../services/material-apoyo.service';
import { CursoService } from '../../../services/curso.service';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import {
    AsignaturaModel,
    DocenteModel,
    BackendCurso,
    CursoRegistroPayload,
} from '../../../models/curso.model';

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
    loadingDocentes = false;
    mostrarTodosDocentes = false;

    asignaturas: AsignaturaModel[] = [];
    loadingAsignaturas = false;
    displayAsignaturaDialog = false;
    modalSelectedAsignaturas: AsignaturaModel[] = [];

    materialesApoyo: MaterialApoyo[] = [];
    loadingMaterials = false;

    displayMaterialDialog = false;
    selectedMateriales: MaterialApoyo[] = [];
    tableSelection: MaterialApoyo[] = [];

    isEditMode = false;
    isViewMode = false;
    cursoId: number | null = null;
    cursoOriginal: BackendCurso | null = null;

    cursoExistsMessage: string | null = null;
    saving = false;
    loadingAsignaturasError = false;

    private readonly destroy$ = new Subject<void>();
    private readonly subs: Subscription[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly materialApoyoService: MaterialApoyoService,
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.detectarModoYCargarCurso();
        this.inicializarFormulario();
        this.setupGrupoControlListeners();
        this.cargarMaterialesApoyo();
        this.setupValidacionExistenciaCurso();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.subs.forEach((sub) => {
            if (sub && !sub.closed) sub.unsubscribe();
        });
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
        const value = this.observacionControl?.value;
        return value ? String(value).length : 0;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.construirPayload();
        this.saving = true;

        const serviceCall =
            this.isEditMode && this.cursoId
                ? this.cursoService.actualizarCurso(this.cursoId, payload)
                : this.cursoService.registrarCurso(payload);

        const submitSub = serviceCall.subscribe({
            next: (response) => {
                if (response.typeResponse === 'SUCCESS') {
                    this.mostrarExitoYNavegar(response.message);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message,
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

    openAsignaturaDialog(): void {
        this.modalSelectedAsignaturas = this.asignatura
            ? [this.asignatura]
            : [];
        this.displayAsignaturaDialog = true;

        if (!this.asignaturas || this.asignaturas.length === 0) {
            this.cargarAsignaturas();
        }
    }

    confirmAsignaturaSelection(): void {
        if (this.modalSelectedAsignaturas?.length) {
            const previousAsignaturaId = this.asignatura?.id ?? null;
            const selectedAsignatura = this.modalSelectedAsignaturas[0];
            if (this.modalSelectedAsignaturas.length > 1) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: `Se seleccionaron ${this.modalSelectedAsignaturas.length} asignaturas; se usará la primera seleccionada.`,
                });
            }
            this.asignatura = selectedAsignatura;
            if (previousAsignaturaId !== selectedAsignatura?.id) {
                this.marcarFormularioComoModificado();
            }
            this.cursoExistsMessage = null;
            this.clearGrupoExistsErrorIfAny();

            const currentGrupo = this.form.get('grupo')?.value;
            if (!this.isEditMode && currentGrupo?.length) {
                this.validarGrupoConAsignatura(currentGrupo);
            }
        }
        this.displayAsignaturaDialog = false;
    }

    cancelAsignaturaSelection(): void {
        this.modalSelectedAsignaturas = [];
        this.displayAsignaturaDialog = false;
    }

    selectAsignatura(asignatura: AsignaturaModel): void {
        const previousAsignaturaId = this.asignatura?.id ?? null;
        this.asignatura = asignatura;
        if (previousAsignaturaId !== asignatura?.id) {
            this.marcarFormularioComoModificado();
        }
        this.cursoExistsMessage = null;
        this.clearGrupoExistsErrorIfAny();
        this.displayAsignaturaDialog = false;

        const currentGrupo = this.form.get('grupo')?.value;
        if (!this.isEditMode && currentGrupo?.length) {
            this.validarGrupoConAsignatura(currentGrupo);
        }

        this.cargarDocentesSegunFiltro(true);
    }

    onCloseView(): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-cursos',
        ]);
    }

    onCancel(event: Event): void {
        if (this.saving) return;

        const hayCambios = this.form?.dirty;
        if (hayCambios) {
            const target = event.target ?? event.currentTarget;
            this.confirmationService.confirm({
                target: target ?? undefined,
                message:
                    'Existen cambios sin guardar. Si continúa, se perderán los cambios. ¿Desea continuar?',
                acceptLabel: 'Sí',
                rejectLabel: 'No',
                accept: () =>
                    this.router.navigate([
                        '/gestion-matricula-academica',
                        'gestion-cursos',
                    ]),
            });
            return;
        }

        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-cursos',
        ]);
    }

    openMaterialDialog(): void {
        this.tableSelection = [...this.selectedMateriales];
        this.displayMaterialDialog = true;
    }

    confirmMaterialSelection(): void {
        this.selectedMateriales = [...this.tableSelection];
        this.marcarFormularioComoModificado();
        this.displayMaterialDialog = false;
    }

    cancelMaterialSelection(): void {
        this.tableSelection = [];
        this.displayMaterialDialog = false;
    }

    removeSelectedMaterial(event: Event, material: MaterialApoyo): void {
        if (!material) return;

        const target = event.target ?? event.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Quitar el material seleccionado?',
            acceptLabel: 'Sí­',
            rejectLabel: 'No',
            accept: () => this.applyRemoveSelectedMaterial(material),
        });
    }

    private applyRemoveSelectedMaterial(material: MaterialApoyo): void {
        const id = material.id;
        if (typeof id === 'number') {
            this.selectedMateriales = this.selectedMateriales.filter(
                (m) => m.id !== id
            );
        } else {
            this.selectedMateriales = this.selectedMateriales.filter(
                (m) => m.nombre !== material.nombre
            );
        }
        this.marcarFormularioComoModificado();
    }

    private detectarModoYCargarCurso(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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
    }

    private inicializarFormulario(): void {
        this.form = this.fb.group({
            grupo: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z]$/)],
            ],
            horario: ['', [Validators.required, Validators.maxLength(100)]],
            salon: ['', [Validators.required, Validators.maxLength(50)]],
            observacion: ['', [Validators.maxLength(200)]],
        });

        if (this.isEditMode || this.isViewMode) {
            const grupoControl = this.form.get('grupo');
            grupoControl?.disable({ emitEvent: false });
        }
    }

    private setupGrupoControlListeners(): void {
        const grupoControl = this.form.get('grupo');
        if (grupoControl) {
            grupoControl.valueChanges
                .pipe(takeUntil(this.destroy$))
                .subscribe((value: string) => {
                    if (typeof value !== 'string') return;
                    const trimmed = value.trim().charAt(0) || '';
                    const upper = trimmed.toUpperCase();
                    if (upper !== value) {
                        grupoControl.setValue(upper, { emitEvent: false });
                    }
                });
        }
    }

    private cargarMaterialesApoyo(): void {
        this.loadingMaterials = true;
        this.materialApoyoService
            .listMaterialApoyo()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingMaterials = false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.materialesApoyo = response.data || [];
                    }
                },
                error: (err) =>
                    console.error('Error cargando materiales de apoyo', err),
            });
    }

    private setupValidacionExistenciaCurso(): void {
        const grupoControl = this.form.get('grupo');
        if (!grupoControl || this.isEditMode || this.isViewMode) {
            return;
        }

        const sub = grupoControl.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                filter((value: string) =>
                    this.debeVerificarCursoExistente(value)
                ),
                switchMap((value: string) =>
                    this.cursoService.verificarCursoExistente(
                        value,
                        this.obtenerIdAsignatura()
                    )
                )
            )
            .subscribe({
                next: (response) =>
                    this.manejarRespuestaCursoExistente(response, grupoControl),
                error: (err) => this.manejarErrorCursoExistente(err),
            });
        this.subs.push(sub);
    }

    private debeVerificarCursoExistente(value: string): boolean {
        return (
            !!value &&
            value.length > 0 &&
            !!this.asignatura &&
            !!this.asignatura.id
        );
    }

    private obtenerIdAsignatura(): number {
        return this.asignatura ? this.asignatura.id || 0 : 0;
    }

    private manejarRespuestaCursoExistente(
        response: { typeResponse?: string; data?: boolean; message?: string },
        grupoControl: AbstractControl
    ): void {
        if (response?.typeResponse === 'SUCCESS' && response?.data === true) {
            const detail = response.message || null;
            this.cursoExistsMessage = detail;
            grupoControl.setErrors({ exists: true });
            return;
        }

        this.cursoExistsMessage = null;
        const errors = grupoControl.errors || {};
        if (errors.exists) {
            delete errors.exists;
        }
        grupoControl.setErrors(
            Object.keys(errors).length === 0 ? null : errors
        );
    }

    private manejarErrorCursoExistente(err: {
        error?: { message?: string };
        message?: string;
    }): void {
        const detail = err?.error?.message || err?.message || null;
        this.cursoExistsMessage = detail;
        if (!detail) {
            return;
        }
        this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail,
        });
    }

    private cargarAsignaturas(): void {
        this.loadingAsignaturas = true;
        const sub = this.catalogoAcademicoService
            .listAsignaturas()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingAsignaturas = false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.asignaturas = response.data || [];
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Atención',
                            detail:
                                response?.message ||
                                'No se pudieron cargar asignaturas',
                        });
                    }
                },
                error: (err) => {
                    const detail =
                        err?.error?.message ??
                        err?.message ??
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

    onToggleMostrarDocentes(): void {
        this.cargarDocentesSegunFiltro(false);
    }

    onDocentesChanged(): void {
        this.marcarFormularioComoModificado();
    }

    private cargarDocentesSegunFiltro(resetTarget: boolean): void {
        if (this.mostrarTodosDocentes) {
            this.cargarTodosDocentes(resetTarget);
            return;
        }

        if (this.asignatura?.id) {
            this.cargarDocentesPorAsignatura(this.asignatura.id, resetTarget);
            return;
        }

        if (resetTarget) {
            this.targetDocentes = [];
        }
        this.sourceDocentes = [];
    }

    private cargarDocentesPorAsignatura(
        asignaturaId: number,
        resetTarget: boolean
    ): void {
        this.loadingDocentes = true;
        const sub = this.catalogoAcademicoService
            .listDocentesByAsignatura(asignaturaId)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingDocentes = false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.actualizarListasDocentes(
                            response.data || [],
                            resetTarget
                        );
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Atención',
                            detail:
                                response?.message ||
                                'No se encontraron docentes',
                        });
                    }
                },
                error: (err) => {
                    const detail =
                        err?.error?.message ??
                        err?.message ??
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

    private cargarTodosDocentes(resetTarget: boolean): void {
        this.loadingDocentes = true;
        const sub = this.catalogoAcademicoService
            .listDocentes()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingDocentes = false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.actualizarListasDocentes(
                            response.data || [],
                            resetTarget
                        );
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Atención',
                            detail:
                                response?.message ||
                                'No se encontraron docentes',
                        });
                    }
                },
                error: (err) => {
                    const detail =
                        err?.error?.message ??
                        err?.message ??
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

    private actualizarListasDocentes(
        docentes: DocenteModel[],
        resetTarget: boolean
    ): void {
        if (resetTarget) {
            this.targetDocentes = [];
        }

        const targetIds = new Set(
            this.targetDocentes.map((docente) => docente.id)
        );
        this.sourceDocentes = docentes.filter(
            (docente) => !targetIds.has(docente.id)
        );
    }

    private clearGrupoExistsErrorIfAny(): void {
        const grupoControl = this.form.get('grupo');
        if (!grupoControl) return;
        const errors = grupoControl.errors || {};
        if (errors.exists) delete errors.exists;
        if (Object.keys(errors).length === 0) grupoControl.setErrors(null);
        else grupoControl.setErrors(errors);
    }

    private validarGrupoConAsignatura(grupoValue: string): void {
        if (!this.debeValidarGrupoConAsignatura(grupoValue)) return;
        const grupoControl = this.form.get('grupo');
        if (!grupoControl) return;
        const sub = this.cursoService
            .verificarCursoExistente(grupoValue, this.obtenerIdAsignatura())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) =>
                    this.manejarRespuestaCursoExistente(response, grupoControl),
                error: (err) => this.manejarErrorCursoExistente(err),
            });
        this.subs.push(sub);
    }

    private debeValidarGrupoConAsignatura(grupoValue: string): boolean {
        return !!grupoValue && !!this.asignatura;
    }

    private loadCursoForEdit(id: number): void {
        const loadSub = this.cursoService
            .getCursoById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS' && response.data) {
                        this.cursoOriginal = response.data;
                        this.populateFormWithCursoData(response.data);
                        if (this.isViewMode) {
                            this.form.disable();
                        }
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                response?.message ||
                                'No se pudo cargar el curso',
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
                        err?.error?.message ??
                        err?.message ??
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

    private populateFormWithCursoData(curso: BackendCurso): void {
        this.form.patchValue({
            grupo: curso.grupo,
            horario: curso.horario || '',
            salon: curso.salon || '',
            observacion: curso.observacion || '',
        });

        if (this.isEditMode || this.isViewMode) {
            const grupoControl = this.form.get('grupo');
            grupoControl?.disable({ emitEvent: false });
        }

        if (curso.asignatura) {
            this.asignatura = curso.asignatura;
        }

        if (curso.asignatura?.id) {
            this.cargarDocentesYAsignarSeleccionados(curso);
        }

        if (curso.materiales && curso.materiales.length > 0) {
            this.selectedMateriales = curso.materiales.map((material) => ({
                id: material.id,
                nombre: material.nombre,
                descripcion: material.descripcion,
                enlace: material.enlace,
            }));
        }
    }

    private cargarDocentesYAsignarSeleccionados(curso: BackendCurso): void {
        if (!curso.asignatura?.id) return;

        this.loadingDocentes = true;
        const docentesSub = this.catalogoAcademicoService
            .listDocentesByAsignatura(curso.asignatura.id)
            .pipe(
                takeUntil(this.destroy$),
                switchMap((response) => {
                    if (response?.typeResponse !== 'SUCCESS') {
                        return of({
                            response,
                            docentesDisponibles: [] as DocenteModel[],
                            docentesTodos: null,
                        });
                    }

                    const docentesDisponibles = response.data || [];
                    if (
                        !this.hayDocentesFaltantes(
                            curso.docentes,
                            docentesDisponibles
                        )
                    ) {
                        return of({
                            response,
                            docentesDisponibles,
                            docentesTodos: null,
                        });
                    }

                    return this.catalogoAcademicoService.listDocentes().pipe(
                        map((docentesTodos) => ({
                            response,
                            docentesDisponibles,
                            docentesTodos,
                        }))
                    );
                }),
                finalize(() => (this.loadingDocentes = false))
            )
            .subscribe({
                next: ({ response, docentesDisponibles, docentesTodos }) => {
                    if (response?.typeResponse !== 'SUCCESS') return;

                    const docentesBase =
                        docentesTodos?.typeResponse === 'SUCCESS'
                            ? docentesTodos.data || []
                            : docentesDisponibles;
                    this.targetDocentes = this.obtenerDocentesSeleccionados(
                        docentesBase,
                        curso.docentes
                    );
                    this.actualizarListasDocentes(docentesBase, false);
                },
                error: (err) => {
                    console.error('Error cargando docentes para edición', err);
                },
            });
        this.subs.push(docentesSub);
    }

    private hayDocentesFaltantes(
        docentesCurso: DocenteModel[] | undefined,
        docentesDisponibles: DocenteModel[]
    ): boolean {
        if (!docentesCurso?.length) return false;
        const disponiblesIds = new Set(
            docentesDisponibles.map((docente) => docente.id)
        );
        return docentesCurso.some((docente) => !disponiblesIds.has(docente.id));
    }

    private obtenerDocentesSeleccionados(
        docentesDisponibles: DocenteModel[],
        docentesCurso?: DocenteModel[]
    ): DocenteModel[] {
        if (!docentesCurso?.length) return [];
        const docentesMap = new Map(
            docentesDisponibles.map((docente) => [docente.id, docente])
        );
        return docentesCurso.map(
            (docente) => docentesMap.get(docente.id) ?? docente
        );
    }

    private construirPayload(): CursoRegistroPayload {
        const rawValues = this.form.getRawValue();
        return {
            grupo: rawValues.grupo ?? this.cursoOriginal?.grupo ?? '',
            asignaturaId: this.asignatura?.id || 0,
            docentesIds: this.targetDocentes.map((d) =>
                d.id ? d.id : Number(d.codigo) || 0
            ),
            horario: rawValues.horario,
            salon: rawValues.salon,
            materialApoyoIds: this.selectedMateriales
                .map((m) => m.id)
                .filter((id): id is number => typeof id === 'number'),
            observacion: rawValues.observacion,
        };
    }

    private mostrarExitoYNavegar(mensaje: string): void {
        const toastLife = 2500;
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: mensaje,
            life: toastLife,
        });
        this.form.reset();
        this.selectedMateriales = [];

        const navigateDelay = 1000;
        setTimeout(() => {
            this.router.navigate([
                '/gestion-matricula-academica',
                'gestion-cursos',
            ]);
        }, navigateDelay);
    }

    private marcarFormularioComoModificado(): void {
        if (!this.form || this.isViewMode) return;
        this.form.markAsDirty();
    }
}
