import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { UtilidadesService } from 'src/app/modules/gestion-solicitudes/services/utilidades.service';

@Component({
    selector: 'app-apyasistenciaevento',
    templateUrl: './apyasistenciaevento.component.html',
    styleUrls: ['./apyasistenciaevento.component.scss'],
})
export class ApyasistenciaeventoComponent implements OnInit {
    formApoyoAsistEvento: FormGroup;
    tiposCuentaBancaria: string[];
    tiposCongreso: string[];
    listaGruposInvestigacion: string[];

    constructor(
        public radicar: RadicarService,
        private fb: FormBuilder,
        private servicioUtilidades: UtilidadesService
    ) {
        this.tiposCuentaBancaria = ['Ahorros', 'Corriente'];
        this.tiposCongreso = ['Nacional', 'Internacional'];
        this.listaGruposInvestigacion = [
            'Grupo de Investigación y Desarrollo en Ingeniería de Software - IDIS',
            'Grupo de Investigación en Tecnologías de la Información - GTI',
            'Grupo de Investigación en Inteligencia Computacional - GICO',
        ];
    }

    ngOnInit(): void {
        this.servicioUtilidades.configurarIdiomaCalendario();

        this.formApoyoAsistEvento = this.fb.group({
            nombreCongreso: ['', Validators.required],
            lugarEvento: ['', Validators.required],
            tipoCongreso: ['', this.customValidator()],
            tituloPublicacion: ['', Validators.required],
            grupoInvestigacion: ['', Validators.required],
            fechas: ['', Validators.required],
            valorApoyo: ['', Validators.required],
            entidadBancaria: ['', Validators.required],
            tipoCuenta: ['', this.customValidator()],
            numeroCuenta: ['', Validators.required],
            direccionResidencia: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formApoyoAsistEvento.value;
        const hasData = Object.values(formData).some((value) => value !== null && value !== '');

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formApoyoAsistEvento.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formApoyoAsistEvento = this.formApoyoAsistEvento;
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tipoSeleccionado: string = control.value;
            if (!tipoSeleccionado || tipoSeleccionado === '') {
                return { tipoInvalido: true };
            }
            return null;
        };
    }

    validarFechas(): boolean {
        const fechas = this.formApoyoAsistEvento.get('fechas')?.value;

        // Verificar que fechas tenga exactamente 2 elementos y que ambos no sean null
        return (
            Array.isArray(fechas) &&
            fechas.length === 2 &&
            !!fechas[0] && // Verifica que la primera fecha no sea null
            !!fechas[1] // Verifica que la segunda fecha no sea null
        );
    }

    obtenerEstadoFormulario(): boolean {
        return this.formApoyoAsistEvento.valid;
    }
}
