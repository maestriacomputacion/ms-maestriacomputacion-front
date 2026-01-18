import { Component, Input } from '@angular/core';

import { BackendCurso } from '../../../../../models/curso.model';

@Component({
    selector: 'app-curso-info-card',
    templateUrl: './curso-info-card.component.html',
    styleUrls: ['./curso-info-card.component.scss'],
})
export class CursoInfoCardComponent {
    @Input() curso: BackendCurso | null = null;

    getDocentesFormateados(): string {
        if (!this.curso?.docentes?.length) return '-';
        return this.curso.docentes
            .map((docente) => {
                const nombreCompleto = docente.persona
                    ? `${docente.persona.nombre ?? ''} ${
                          docente.persona.apellido ?? ''
                      }`.trim()
                    : '';
                return nombreCompleto || docente.codigo || '-';
            })
            .join(', ');
    }

    getTagPeriodo(): string {
        return this.curso?.periodo?.tagPeriodo?.toString() ?? '-';
    }

    getFechasPeriodo(): string {
        if (!this.curso?.periodo) return '-';
        const fechaInicio = this.formatDate(this.curso.periodo.fechaInicio);
        const fechaFin = this.formatDate(this.curso.periodo.fechaFin);
        return `${fechaInicio} - ${fechaFin}`;
    }

    private formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '-';
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
}
