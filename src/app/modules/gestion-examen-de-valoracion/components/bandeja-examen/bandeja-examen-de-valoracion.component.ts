import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Aviso, EstadoProceso } from 'src/app/core/enums/enums';
import { infoMessage, warnMessage } from 'src/app/core/utils/message-util';
import { LocalStorageService } from 'src/app/shared/services/localstorage.service';
import { EstudianteService } from 'src/app/shared/services/estudiante.service';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';
import { ResolucionService } from '../../services/resolucion.service';
import { SustentacionService } from '../../services/sustentacion.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';

@Component({
    selector: 'app-bandeja-examen-de-valoracion',
    templateUrl: './bandeja-examen-de-valoracion.component.html',
    styleUrls: ['./bandeja-examen-de-valoracion.component.scss'],
})
export class BandejaExamenDeValoracionComponent implements OnInit {
    estudiante: Estudiante;
    estudianteSeleccionado: Estudiante;

    loading: boolean;

    estadosPermitidos: string[] = [
        EstadoProceso.EXAMEN_DE_VALORACION_CANCELADO,
        EstadoProceso.CANCELADO_TRABAJO_GRADO,
        EstadoProceso.SUSTENTACION_NO_APROBADA,
    ];
    estados: any[] = Object.keys(EstadoProceso).map((value, index) => ({
        index,
        text: value
            .split('_')
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' '),
    }));
    selectedEstados: number[] = this.estados.map((estado) => estado.index);
    solicitudesPorEstado: Solicitud[] | any[] = [];
    solicitudesPorEstudiante: Solicitud[] | any[] = [];
    role: string[];

    constructor(
        private autenticacion: AutenticacionService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService,
        private estudianteService: EstudianteService,
        private localStorageService: LocalStorageService,
        private messageService: MessageService,
        private resolucionService: ResolucionService,
        private router: Router,
        private solicitudService: SolicitudService,
        private sustentacionService: SustentacionService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        const isCoordinadorOrCommite =
            this.role.includes('ROLE_COORDINADOR') ||
            this.role.includes('ROLE_COMITE');
        const isDocenteOrEstudiante =
            this.role.includes('ROLE_DOCENTE') ||
            this.role.includes('ROLE_ESTUDIANTE');

        if (isCoordinadorOrCommite) {
            await this.listTrabajosDeGradoPorEstados(this.selectedEstados);
            this.selectedEstados = [...this.estados];
            this.cdr.detectChanges();
        }

        if (isDocenteOrEstudiante) {
            const estudiante = this.localStorageService.getLocalStorage('est');
            if (estudiante) {
                this.trabajoDeGradoService.setEstudianteSeleccionado(
                    estudiante
                );
                this.estudianteSeleccionado = estudiante;
                await this.listTrabajosDeGradoPorEstudiante(
                    this.estudianteSeleccionado.id
                );
            }
        }
    }

    onStateChange(event: any): void {
        const selectedIndices = event.value.map((estado: any) => estado.index);
        this.listTrabajosDeGradoPorEstados(selectedIndices);
    }

    async listTrabajosDeGradoPorEstudiante(
        estudianteId: number
    ): Promise<void> {
        this.loading = true;
        try {
            const response = await firstValueFrom(
                this.trabajoDeGradoService.listTrabajosDeGradoPorEstudiante(
                    estudianteId
                )
            );
            if (response) {
                this.solicitudesPorEstudiante = response.trabajoGrado.sort(
                    (a: any, b: any) => b.id - a.id
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    }

    async listTrabajosDeGradoPorEstados(estados: number[]): Promise<void> {
        this.loading = true;
        try {
            const response = await firstValueFrom(
                this.trabajoDeGradoService.listTrabajosDeGradoPorEstado(
                    estados.length ? estados : [0]
                )
            );
            if (response) {
                this.solicitudesPorEstado = response.sort(
                    (a: any, b: any) => b.id - a.id
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    }

    async onEditar(id: number, estudianteId: number, titulo: string) {
        this.resetState();

        if (this.role.includes('ROLE_DOCENTE')) {
            try {
                const response = await firstValueFrom(
                    this.trabajoDeGradoService
                        .verificarDocente(id)
                        .pipe(catchError(() => of(null)))
                );

                if (response !== 'true') {
                    this.messageService.add(
                        warnMessage('No puedes editar este trabajo de grado.')
                    );
                    return;
                }
            } catch (error) {
                console.error('Error al verificar docente:', error);
                return;
            }
        }

        if (estudianteId) {
            try {
                const estudianteResponse = await firstValueFrom(
                    this.estudianteService
                        .getEstudiante(estudianteId)
                        .pipe(catchError(() => of(null)))
                );

                if (estudianteResponse) {
                    this.estudiante =
                        this.mapEstudianteLabel(estudianteResponse);
                    this.trabajoDeGradoService.setEstudianteSeleccionado(
                        this.estudiante
                    );
                }
            } catch (error) {
                // Manejar error si es necesario
                console.error('Error al obtener estudiante:', error);
            }
        }

        try {
            const trabajoDeGradoResponse = await firstValueFrom(
                this.trabajoDeGradoService
                    .getTrabajoDeGrado(id)
                    .pipe(catchError(() => of(null)))
            );

            if (trabajoDeGradoResponse) {
                this.trabajoDeGradoService.setTrabajoSeleccionado(
                    trabajoDeGradoResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
            console.error('Error al obtener trabajo de grado:', error);
        }

        try {
            const solicitudResponse = await firstValueFrom(
                this.solicitudService
                    .getSolicitudDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (solicitudResponse) {
                this.trabajoDeGradoService.setSolicitudSeleccionada(
                    solicitudResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
            console.error('Error al obtener solicitud:', error);
        }

        try {
            const resolucionResponse = await firstValueFrom(
                this.resolucionService
                    .getResolucionDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (resolucionResponse) {
                this.trabajoDeGradoService.setResolucionSeleccionada(
                    resolucionResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
            console.error('Error al obtener resolución:', error);
        }

        try {
            const sustentacionResponse = await firstValueFrom(
                this.sustentacionService
                    .getSustentacionDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (sustentacionResponse) {
                this.trabajoDeGradoService.setSustentacionSeleccionada(
                    sustentacionResponse
                );
                this.trabajoDeGradoService.setTituloSeleccionadoSubject(titulo);

                if (this.role.includes('ROLE_ESTUDIANTE')) {
                    this.router.navigate([
                        'examen-de-valoracion/sustentacion/editar',
                        id,
                    ]);
                    return;
                }
            }
        } catch (error) {
            // Manejar error si es necesario
            console.error('Error al obtener sustentación:', error);
        }

        if (!this.role.includes('ROLE_ESTUDIANTE')) {
            this.router.navigate(['examen-de-valoracion/solicitud/editar', id]);
        }
    }

    resetState() {
        this.trabajoDeGradoService.setSolicitudSeleccionada(null);
        this.trabajoDeGradoService.setResolucionSeleccionada(null);
        this.trabajoDeGradoService.setSustentacionSeleccionada(null);
    }

    isCrearExamenDisabled(): boolean {
        if (this.solicitudesPorEstudiante.length == 0) {
            return false;
        }
        const ultimoTrabajoDeGrado = this.solicitudesPorEstudiante[0];
        return !this.estadosPermitidos.includes(ultimoTrabajoDeGrado.estado);
    }

    onProcesoExamen() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    mapEstudianteLabel(estudiante: any) {
        return {
            id: estudiante.id,
            nombre: estudiante.nombre,
            codigo: estudiante.codigo,
            apellido: estudiante.apellido,
            identificacion: estudiante.identificacion,
            tipoIdentificacion: estudiante.tipoIdentificacion,
        };
    }

    showBuscadorEstudiantes() {
        return this.dialogService.open(BuscadorEstudiantesComponent, {
            header: 'Buscar estudiante',
            width: '60%',
            styleClass: 'custom-estudiante-dialog',
        });
    }

    limpiarEstudiante() {
        this.estudianteSeleccionado = null;
        this.localStorageService.clearLocalStorage('est');
        this.solicitudesPorEstudiante = [];
    }

    async onSeleccionarEstudiante(): Promise<void> {
        const ref = this.showBuscadorEstudiantes();
        try {
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                this.estudianteSeleccionado = this.mapEstudianteLabel(response);
                this.trabajoDeGradoService.setEstudianteSeleccionado(
                    this.estudianteSeleccionado
                );
                this.localStorageService.saveLocalStorage(
                    this.estudianteSeleccionado,
                    'est'
                );
                await this.listTrabajosDeGradoPorEstudiante(
                    this.estudianteSeleccionado.id
                );
            }
        } catch (error) {
            console.error('Error al seleccionar estudiante:', error);
        }
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target,
            message: Aviso.CONFIRMAR_CANCELAR_SOLICITUD,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'No',
            accept: () => this.cancelarTrabajoDeGrado(id),
        });
    }

    async cancelarTrabajoDeGrado(id: number): Promise<void> {
        try {
            await firstValueFrom(
                this.trabajoDeGradoService.cancelTrabajoDeGrado(id)
            );
            this.messageService.add(
                infoMessage(Aviso.SOLICITUD_CANCELADA_CORRECTAMENTE)
            );
            const keys = Object.keys(EstadoProceso);
            const indexes = keys.map((_, index) => index);
            await this.listTrabajosDeGradoPorEstados(indexes);
        } catch (error) {
            console.error('Error en cancelarTrabajoDeGrado:', error);
        }
    }
}
