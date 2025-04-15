import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { UtilidadesService } from 'src/app/modules/gestion-solicitudes/services/utilidades.service';

@Component({
    selector: 'app-apyeconomicoestancia',
    templateUrl: './apyeconomicoestancia.component.html',
    styleUrls: ['./apyeconomicoestancia.component.scss'],
})
export class ApyeconomicoestanciaComponent implements OnInit {
    formApoyoEconEstancia: FormGroup;
    tiposCuentaBancaria: string[];
    listaGruposInvestigacion: string[];

    constructor(
        public radicar: RadicarService,
        private fb: FormBuilder,
        private servicioUtilidades: UtilidadesService
    ) {
        this.tiposCuentaBancaria = ['Ahorros', 'Corriente'];

        this.listaGruposInvestigacion = [
            'Grupo de Investigación y Desarrollo en Ingeniería de Software - IDIS',
            'Grupo de Investigación en Tecnologías de la Información - GTI',
            'Grupo de Investigación en Inteligencia Computacional - GICO',
        ];

        this.formApoyoEconEstancia = this.fb.group({
            universidad: ['', Validators.required],
            lugar: ['', Validators.required],
            fechas: ['', Validators.required],
            grupoInvestExt: ['', Validators.required],
            docenteExterno: ['', Validators.required],
            grupoInvestigacion: ['', this.customValidator],
            valorApoyo: ['', Validators.required],
            nombreBanco: ['', Validators.required],
            tipoCuenta: ['', this.customValidator()],
            numeroCuenta: ['', Validators.required],
            direccionRecidencia: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.servicioUtilidades.configurarIdiomaCalendario();

        if (this.radicar.fechasEstancia.length > 0) {
            this.formApoyoEconEstancia.patchValue({
                fechas: this.radicar.fechasEstancia,
            });
        }
        if (this.radicar.lugarEstancia.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                lugar: this.radicar.lugarEstancia,
            });
        }
        if (this.radicar.UniversidadExternaPasantia.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                universidad: this.radicar.UniversidadExternaPasantia,
            });
        }
        if (this.radicar.grupoInvestigacion.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                grupoInvestigacion: this.radicar.grupoInvestigacion,
            });
        }
        if (this.radicar.docenteExternoPas.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                docenteExterno: this.radicar.docenteExternoPas,
            });
        }
        if (this.radicar.grupoInvestigacionExternoPanatia.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                grupoInvestExt: this.radicar.grupoInvestigacionExternoPanatia,
            });
        }

        if (this.radicar.valorApoyoEcon !== null) {
            this.formApoyoEconEstancia.patchValue({
                valorApoyo: this.radicar.valorApoyoEcon,
            });
        }
        if (this.radicar.banco.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                nombreBanco: this.radicar.banco,
            });
        }
        if (this.radicar.tipoCuenta.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                tipoCuenta: this.radicar.tipoCuenta,
            });
        }
        if (this.radicar.numeroCuenta.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                numeroCuenta: this.radicar.numeroCuenta,
            });
        }
        if (this.radicar.direccion.trim() !== '') {
            this.formApoyoEconEstancia.patchValue({
                direccionRecidencia: this.radicar.direccion,
            });
        }

        this.formApoyoEconEstancia.valueChanges.subscribe((value) => {
            // Verificar si value.fechas es una cadena de texto
            if (typeof value.fechas === 'string') {
                // Dividir el string de fechas en fechaInicio y fechaFin
                const fechas = value.fechas.split(' - ').map((dateString) => new Date(dateString.trim()));
                this.radicar.fechasEstancia = fechas;
            } else if (Array.isArray(value.fechas)) {
                // Verificar si value.fechas es un arreglo de objetos Date
                // Asignar el valor directamente
                this.radicar.fechasEstancia = value.fechas;
            }
            this.radicar.lugarEstancia = value.lugar;
            this.radicar.grupoInvestigacion = value.grupoInvestigacion;
            this.radicar.valorApoyoEcon = value.valorApoyo;
            this.radicar.banco = value.nombreBanco;
            this.radicar.UniversidadExternaPasantia = value.universidad;
            this.radicar.grupoInvestigacionExternoPanatia = value.grupoInvestExt;
            this.radicar.docenteExternoPas = value.docenteExterno;
            this.radicar.tipoCuenta = value.tipoCuenta;
            this.radicar.numeroCuenta = value.numeroCuenta;
            this.radicar.direccion = value.direccionRecidencia;
        });
    }

    validarFechas(): boolean {
        // Verificar si fechasEstancia contiene exactamente 2 fechas y si ambas son distintas de null
        return (
            this.radicar.fechasEstancia.length === 2 &&
            !!this.radicar.fechasEstancia[0] &&
            !!this.radicar.fechasEstancia[1]
        );
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tipoSeleccionado: string = control.value;
            if (!tipoSeleccionado || tipoSeleccionado === '') {
                return { invalidTipo: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formApoyoEconEstancia.valid;
    }
}
