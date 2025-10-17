import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialApoyo } from '../../models/material-apoyo';
import { MaterialApoyoService } from '../../services/material-apoyo.service';

interface Asignatura {
    codigo: string;
    nombre: string;
}

interface Docente {
    codigo: string;
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

    materialesApoyo: MaterialApoyo[] = [];

    observacion: string = '';
    // Material dialog + selection
    displayMaterialDialog: boolean = false;
    // materiales seleccionados en el formulario
    selectedMateriales: MaterialApoyo[] = [];
    // selección temporal dentro del diálogo
    tableSelection: MaterialApoyo[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly materialApoyoService: MaterialApoyoService
    ) {}

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
        // Remove by id if available, otherwise by name
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
