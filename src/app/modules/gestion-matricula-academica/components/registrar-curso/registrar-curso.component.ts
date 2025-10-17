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
} from 'rxjs/operators';

import { AsignaturaModel, DocenteModel } from '../../models/curso.model';

@Component({
    selector: 'app-registrar-curso',
    templateUrl: './registrar-curso.component.html',
    styleUrls: ['./registrar-curso.component.scss'],
})
export class RegistrarCursoComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    // valores por defecto para el formulario (incrustados en el FormGroup)
    asignatura: AsignaturaModel | null = {
        id: 6,
        nombre: 'Fundamentos de diseño de software',
        codigo: '28955',
    };

    sourceDocentes: DocenteModel[] = [
        { id: 1061, nombre: 'Erwin Meza', codigo: '1061' },
        { id: 1062, nombre: 'Carlos Alberto Ardila', codigo: '1062' },
        { id: 1063, nombre: 'Julio Hurtado', codigo: '1063' },
    ];
    targetDocentes: DocenteModel[] = [
        { id: 1065, nombre: 'Martha Mendoza', codigo: '1065' },
    ];

    materialesApoyo: MaterialApoyo[] = [];

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

    ngOnInit() {
        this.form = this.fb.group({
            grupo: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z]$/)],
            ],
            horario: [''],
            salon: ['', [Validators.maxLength(100)]],
            observacion: [''],
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

        // cargar materiales desde el servicio
        this.materialApoyoService.listMaterialApoyo().subscribe({
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
                    filter((v: string) => !!v && v.length > 0),
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
                            this.cursoExistsMessage = resp.message;
                            grupoCtrl.setErrors({ exists: true });
                        } else {
                            this.cursoExistsMessage = null;
                            const errors = grupoCtrl.errors || {};
                            if (errors.exists) {
                                delete errors.exists;
                            }
                            if (Object.keys(errors).length === 0) {
                                grupoCtrl.setErrors(null);
                            } else {
                                grupoCtrl.setErrors(errors);
                            }
                        }
                    },
                    error: () => {
                        this.cursoExistsMessage = null;
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

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        // Verificar existencia una última vez antes de enviar
        const grupo = this.form.value.grupo;
        const asignaturaId = this.asignatura ? this.asignatura.id || 0 : 0;
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
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Error registrando curso',
                                });
                                this.saving = false;
                            },
                        });
                    this.subs.push(regSub);
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
