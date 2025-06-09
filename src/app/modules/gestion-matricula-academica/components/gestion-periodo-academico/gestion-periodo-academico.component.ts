import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiResponse } from '../../models/api-response.model';
import {
  PeriodoAcademico,
  PeriodoAcademicoService,
} from '../../services/periodo-academico.service';

@Component({
    selector: 'app-gestion-periodo-academico',
    templateUrl: './gestion-periodo-academico.component.html',
    styleUrls: ['./gestion-periodo-academico.component.scss'],
})
export class GestionPeriodoAcademicoComponent implements OnInit {
    periodos: PeriodoAcademico[] = [];
    displayModal = false;
    editMode = false;
    editPeriodoId: string | null = null;
    form: FormGroup;

    constructor(
        private readonly periodoService: PeriodoAcademicoService,
        private readonly fb: FormBuilder,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {
        this.form = this.fb.group({
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            descripcion: [''],
        });
    }

    ngOnInit() {
        this.periodoService
            .getPeriodos()
            .subscribe((resp: ApiResponse<PeriodoAcademico[]>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.periodos = resp.data;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            resp.message ??
                            'No se pudo obtener la información de periodos.',
                    });
                }
            });
    }

    onAgregarPeriodo() {
        this.form.reset();
        this.editMode = false;
        this.editPeriodoId = null;
        this.displayModal = true;
    }

    onEditarPeriodo(id: string) {
        const periodo = this.periodos.find((p) => p.id === id);
        if (!periodo) return;
        this.form.patchValue({
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
            descripcion: periodo.descripcion,
        });
        this.editMode = true;
        this.editPeriodoId = id;
        this.displayModal = true;
    }

    registrarPeriodo() {
        if (!this.form.valid || !this.fechasValidas) {
            this.form.markAllAsTouched();
            if (!this.fechasValidas) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Fechas inválidas',
                    detail: 'La fecha de inicio debe ser menor a la fecha de fin.',
                });
            }
            return;
        }
        const value = this.form.value;
        const fechaInicio = this.formatDateToString(value.fechaInicio);
        const fechaFin = this.formatDateToString(value.fechaFin);
        if (this.editMode && this.editPeriodoId) {
            this.actualizarPeriodo(
                this.editPeriodoId,
                fechaInicio,
                fechaFin,
                value.descripcion
            );
            this.messageService.add({
                severity: 'success',
                summary: 'Periodo actualizado',
                detail: 'El periodo académico fue actualizado correctamente.',
            });
        } else {
            this.agregarPeriodo(fechaInicio, fechaFin, value.descripcion);
            this.messageService.add({
                severity: 'success',
                summary: 'Periodo registrado',
                detail: 'El periodo académico fue registrado correctamente.',
            });
        }
        this.displayModal = false;
    }

    agregarPeriodo(fechaInicio: string, fechaFin: string, descripcion: string) {
        const nuevoId = this.generarIdPeriodo(fechaInicio, fechaFin);
        this.periodos.push({
            id: nuevoId,
            fechaInicio,
            fechaFin,
            descripcion,
        });
    }

    actualizarPeriodo(
        id: string,
        fechaInicio: string,
        fechaFin: string,
        descripcion: string
    ) {
        const idx = this.periodos.findIndex((p) => p.id === id);
        if (idx > -1) {
            this.periodos[idx] = {
                ...this.periodos[idx],
                fechaInicio,
                fechaFin,
                descripcion,
            };
        }
    }

    formatDateToString(date: any): string {
        if (!date) return '';
        if (typeof date === 'string') return date;
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    }

    generarIdPeriodo(fechaInicio: string, fechaFin: string): string {
        const anio = new Date(fechaInicio).getFullYear();
        const mes = new Date(fechaInicio).getMonth() < 6 ? '1' : '2';
        return `${anio}-${mes}`;
    }

    cancelarModal() {
        this.displayModal = false;
    }

    onEliminarPeriodo(event: Event, id: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Está seguro que desea eliminar este periodo académico?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.periodos = this.periodos.filter((p) => p.id !== id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Periodo eliminado',
                    detail: 'El periodo académico fue eliminado correctamente.',
                });
            },
        });
    }

    get fechasValidas(): boolean {
        const fechaInicio = this.formatDateToString(
            this.form.get('fechaInicio')?.value
        );
        const fechaFin = this.formatDateToString(
            this.form.get('fechaFin')?.value
        );
        if (!fechaInicio || !fechaFin) return false;
        return fechaInicio < fechaFin;
    }
}
