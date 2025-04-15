import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { UtilidadesService } from 'src/app/modules/gestion-solicitudes/services/utilidades.service';

@Component({
    selector: 'app-apyinscripcion',
    templateUrl: './apyinscripcion.component.html',
    styleUrls: ['./apyinscripcion.component.scss'],
})
export class ApyinscripcionComponent implements OnInit {
    formApoyoPagoPublic: FormGroup;
    tiposCuentaBancaria: string[];
    tiposCongreso: string[];
    listaGruposInvestigacion: string[];

    constructor(
        public radicar: RadicarService,
        private fb: FormBuilder,
        private servicioUtilidades: UtilidadesService
    ) {
        this.tiposCuentaBancaria = ['Ahorros', 'Corriente'];
        this.tiposCongreso = [
            'Articulo en revista indexada categoría A1 o A2 de Publindex',
            'Articulo en revista indexada categoría B de Publindex',
            'Articulo en revista indexada categoría C de Publindex',
            'Articulo en revista no indexada de Publindex',
            'Articulo en memoria de evento arbitrario internacional con ISBN',
            'Articulo en memoria de evento arbitrario nacional con ISBN',
        ];

        this.listaGruposInvestigacion = [
            'Grupo de Investigación y Desarrollo en Ingeniería de Software - IDIS',
            'Grupo de Investigación en Tecnologías de la Información - GTI',
            'Grupo de Investigación en Inteligencia Computacional - GICO',
        ];

        this.formApoyoPagoPublic = this.fb.group({
            nombreCongreso: ['', Validators.required],
            lugarEvento: ['', Validators.required],
            fechas: ['', Validators.required],
            grupoInvestigacion: ['', this.customValidator],
            valorApoyo: ['', Validators.required],
            nombreBanco: ['', Validators.required],
            tipoCuenta: ['', this.customValidator()],
            numeroCuenta: ['', Validators.required],
            direccionRecidencia: ['', Validators.required],
            infoDePago: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.servicioUtilidades.configurarIdiomaCalendario();

        if (this.radicar.fechasEstancia.length > 0) {
            this.formApoyoPagoPublic.patchValue({
                fechas: this.radicar.fechasEstancia,
            });
        }
        if (this.radicar.lugarEstancia.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                lugarEvento: this.radicar.lugarEstancia,
            });
        }
        if (this.radicar.nombreCongreso.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                nombreCongreso: this.radicar.nombreCongreso,
            });
        }
        if (this.radicar.grupoInvestigacion.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                grupoInvestigacion: this.radicar.grupoInvestigacion,
            });
        }

        if (this.radicar.valorApoyoEcon !== null) {
            this.formApoyoPagoPublic.patchValue({
                valorApoyo: this.radicar.valorApoyoEcon,
            });
        }
        if (this.radicar.banco.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                nombreBanco: this.radicar.banco,
            });
        }
        if (this.radicar.tipoCuenta.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                tipoCuenta: this.radicar.tipoCuenta,
            });
        }
        if (this.radicar.numeroCuenta.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                numeroCuenta: this.radicar.numeroCuenta,
            });
        }
        if (this.radicar.direccion.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                direccionRecidencia: this.radicar.direccion,
            });
        }
        if (this.radicar.InfoDePago.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                infoDePago: this.radicar.InfoDePago,
            });
        }

        this.formApoyoPagoPublic.valueChanges.subscribe((value) => {
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

            this.radicar.nombreCongreso = value.nombreCongreso;
            this.radicar.grupoInvestigacion = value.grupoInvestigacion;
            this.radicar.valorApoyoEcon = value.valorApoyo;
            this.radicar.banco = value.nombreBanco;
            this.radicar.tipoCuenta = value.tipoCuenta;
            this.radicar.numeroCuenta = value.numeroCuenta;
            this.radicar.direccion = value.direccionRecidencia;
            this.radicar.lugarEstancia = value.lugarEvento;
            this.radicar.InfoDePago = value.infoDePago;
        });
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
        return (
            this.radicar.fechasEstancia.length === 2 &&
            !!this.radicar.fechasEstancia[0] &&
            !!this.radicar.fechasEstancia[1]
        );
    }

    obtenerEstadoFormulario(): boolean {
        return this.formApoyoPagoPublic.valid;
    }
}
