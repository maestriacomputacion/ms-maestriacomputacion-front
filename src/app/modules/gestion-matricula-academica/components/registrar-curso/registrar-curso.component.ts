import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Asignatura {
    codigo: string;
    nombre: string;
}

interface Docente {
    codigo: string;
    nombre: string;
}

interface MaterialApoyo {
    id: number;
    nombre: string;
}

@Component({
    selector: 'app-registrar-curso',
    templateUrl: './registrar-curso.component.html',
    styleUrls: ['./registrar-curso.component.scss'],
})
export class RegistrarCursoComponent implements OnInit {
    form!: FormGroup;
    periodoNumero: number = 1;
    periodoAnio: number | null = null;
    anios: SelectItem[] = Array.from({ length: 6 }, (_, i) => ({
        label: `${2023 + i}`,
        value: 2023 + i,
    }));
    asignatura: Asignatura | null = {
        codigo: '28955',
        nombre: 'Fundamentos de diseño de software',
    };

    sourceDocentes: Docente[] = [
        { codigo: '1061', nombre: 'Erwin Meza' },
        { codigo: '1062', nombre: 'Carlos Alberto Ardila' },
        { codigo: '1063', nombre: 'Julio Hurtado' },
    ];
    targetDocentes: Docente[] = [
        { codigo: '1065', nombre: 'Martha Mendoza' },
        { codigo: '1067', nombre: 'Carolina Gonzales' },
    ];

    materialesApoyo: MaterialApoyo[] = [
        { id: 1, nombre: 'Lecturas sobre Metaheuristicas' },
        { id: 2, nombre: 'Fundamentos de Aprendizaje Profundo' },
        { id: 3, nombre: 'Manual de Metodología de Investigación' },
        { id: 4, nombre: 'Presentación Ingeniería de Software' },
        { id: 5, nombre: 'Presentación Ingeniería de Software' },
    ];

    observacion: string = '';

    constructor(private readonly fb: FormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            grupo: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z]$/)],
            ],
            periodoNumero: [this.periodoNumero],
            periodoAnio: [this.periodoAnio],
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
        // Aquí puedes construir el payload y llamar al servicio de registro
        const value = this.form.value;
        console.log('Formulario válido. Payload:', value);
    }
}
