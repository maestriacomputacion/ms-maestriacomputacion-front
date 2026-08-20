import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// Importamos desde la ubicación original de los modelos por ahora
import { Estudiante, Materia } from '../../../modules/gestion-matricula-financiera/models/domain-models';

@Component({
    selector: 'app-tabla-matricula-estudiante',
    templateUrl: './tabla-matricula-estudiante.component.html',
    styleUrls: ['./tabla-matricula-estudiante.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaMatriculaEstudianteComponent implements OnChanges {

    @Input() estudiante: Estudiante | null = null;

    becaResolucion: string = '-';
    becaPorcentaje: string = '';
    becaTipo: string = '—';
    becaEstado: string = '—';
    becaAvalado: string | null = null;
    descuentoVoto: string = 'NO';
    descuentoEgresado: string = 'NO';
    esNuevo: boolean = false;
    tieneBeca: boolean = false;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['estudiante'] && this.estudiante) {
            this.procesarDatosFinancieros();
        }
    }

    private procesarDatosFinancieros(): void {
        if (!this.estudiante) return;

        this.becaResolucion = '-';
        this.becaPorcentaje = '';
        this.becaTipo = '—';
        this.becaEstado = '—';
        this.becaAvalado = null;
        
        // Usar los campos booleanos unificados del backend
        this.descuentoVoto = this.estudiante.aplicaVotacion ? 'SI' : 'NO';
        this.descuentoEgresado = this.estudiante.esEgresadoUnicauca ? 'SI' : 'NO';
        this.esNuevo = this.estudiante.semestreFinanciero === 1;

        // Buscamos becas en el campo becasDescuentos (que es el que usa el backend unificado)
        // o en becas (por compatibilidad)
        const listaBecas = (this.estudiante.becasDescuentos?.length) 
            ? this.estudiante.becasDescuentos 
            : this.estudiante.becas;

        if (listaBecas?.length) {
            this.tieneBeca = true;
            const beca = listaBecas[0];
            this.becaResolucion = beca.resolucion || '-';
            this.becaPorcentaje = beca.porcentaje ? `${beca.porcentaje}%` : '';
            this.becaTipo = beca.tipo || '';
            this.becaEstado = beca.estado || '—';
            this.becaAvalado = beca.avaladoConcejo || null;
        } else {
            this.tieneBeca = false;
            this.becaResolucion = '-';
            this.becaPorcentaje = '';
            this.becaTipo = '—';
            this.becaEstado = '—';
            this.becaAvalado = null;
        }
        
        this.cdr.markForCheck();
    }

    getNombreCompleto(): string {
        return this.estudiante ? `${this.estudiante.nombre} ${this.estudiante.apellido}` : '';
    }

    trackByMateria(_index: number, materia: Materia): string {
        return materia.codigo_oid;
    }

    getBecaEstadoSeverity(estado: string): string {
        const e = (estado || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (e === 'resuelta' || e === 'aprobada' || e === 'avalada') return 'success';
        if (e === 'en comite' || e === 'en concejo' || e === 'radicada') return 'warning';
        if (e === 'rechazada' || e === 'no aprobada' || e === 'no avalada') return 'danger';
        return 'info';
    }
}
