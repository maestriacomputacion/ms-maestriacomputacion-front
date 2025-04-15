import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl,
    FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { getRandomNumber } from 'src/app/core/utils/util';
import { ExpertoService } from 'src/app/modules/gestion-expertos/services/experto.service';

@Component({
    selector: 'app-informacion-vinculacion',
    templateUrl: './informacion-vinculacion.component.html',
    styleUrls: ['./informacion-vinculacion.component.scss'],
})
export class InformacionVinculacionComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    vinculacionForm: FormGroup;
    idsLineasInvestigacionExperto: number[] = [];

    lineas: { categoria: string; lineas: any[] }[] = [];

    constructor(
        private fb: FormBuilder,
        private expertoService: ExpertoService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.obtenerLineasInvestigacion();

        const expertoId = Number(this.route.snapshot.paramMap.get('id'));

        if (expertoId !== 0) {
            this.expertoService.getExperto(expertoId).subscribe({
                next: (experto: any) => {
                    // Recupera los IDs de las líneas seleccionadas
                    this.idsLineasInvestigacionExperto =
                        experto.lineasInvestigacion.map((linea) => linea.id);

                    // Llena el FormArray con los IDs recuperados
                    this.setFormArrayValues(this.idsLineasInvestigacionExperto);

                    // Actualiza el estado de las líneas después de obtenerlas
                    this.updateLineasSeleccionadas();
                },
                error: (error) => {
                    console.error('Error al obtener el experto:', error);
                },
            });
        }
    }

    initForm(): void {
        this.vinculacionForm = this.fb.group({
            codigo: [getRandomNumber().toString()],
            universidadexp: ['',Validators.required],
            facultadexp: ['',Validators.required],
            observacionexp: [''],
            grupoinvexp: [''],
            idsLineaInvestigacion: this.fb.array([]),
        });
        this.formReady.emit(this.vinculacionForm);
    }

    setFormArrayValues(ids: number[]): void {
        const formArray: FormArray = this.vinculacionForm.get(
            'idsLineaInvestigacion'
        ) as FormArray;
        formArray.clear(); // Limpia el FormArray antes de agregar
        ids.forEach((id) => formArray.push(new FormControl(id)));
    }

    // obtenerLineasInvestigacion(): void {
    //     this.expertoService.obtenerLineasInvestigacion().subscribe({
    //         next: (lineas: any[]) => {
    //             // Añade la propiedad `seleccionado` localmente sin cambiar el modelo original
    //             lineas.forEach((linea) => (linea.seleccionado = false));

    //             // Agrupa las líneas por categorías
    //             this.lineas = this.agruparPorCategoria(lineas);

    //             // Actualiza el estado de las líneas después de obtenerlas
    //             this.updateLineasSeleccionadas();
    //         },
    //         error: (error) => {
    //             console.error('Error al obtener líneas:', error);
    //         },
    //     });
    // }

    obtenerLineasInvestigacion(): void {
        this.expertoService.obtenerLineasInvestigacion().subscribe({
            next: (categorias: any[]) => {
                // Estructura las líneas de investigación según la categoría
                this.lineas = categorias.map(categoria => ({
                    categoria: categoria.nombre,
                    lineas: categoria.lineasInvestigacion.map(linea => ({
                        id: linea.id,
                        titulo: linea.titulo,
                        seleccionado: false
                    }))
                }));
    
                // Actualiza el estado de las líneas después de obtenerlas
                this.updateLineasSeleccionadas();
            },
            error: (error) => {
                console.error('Error al obtener líneas:', error);
            },
        });
    }
    

    // Método para actualizar el estado `seleccionado` según los IDs seleccionados
    updateLineasSeleccionadas(): void {
        const selectedIds = (
            this.vinculacionForm.get('idsLineaInvestigacion') as FormArray
        ).value as number[];

        // Marca cada línea como seleccionada si su ID está en `selectedIds`
        this.lineas.forEach((grupo) => {
            grupo.lineas.forEach((linea) => {
                // Actualiza el estado `seleccionado`
                linea.seleccionado = selectedIds.includes(linea.id);
            });
        });
    }

    // // Método para agrupar las líneas por categorías
    // agruparPorCategoria(lineas: any[]): { categoria: string; lineas: any[] }[] {
    //     const gruposMap: Map<string, any[]> = lineas.reduce((map, linea) => {
    //         const lineasExistentes = map.get(linea.categoria) || [];
    //         lineasExistentes.push(linea);
    //         map.set(linea.categoria, lineasExistentes);
    //         return map;
    //     }, new Map<string, any[]>());

    //     return Array.from(gruposMap, ([categoria, lineas]) => ({
    //         categoria,
    //         lineas,
    //     }));
    // }

    onCheckChange(event: any, id: number): void {
        const formArray: FormArray = this.vinculacionForm.get(
            'idsLineaInvestigacion'
        ) as FormArray;

        if (event.checked) {
            // Añadir ID solo si no está ya presente
            const exists = formArray.controls.some(
                (control) => control.value === id
            );
            if (!exists) {
                formArray.push(new FormControl(id));
            }
        } else {
            // Eliminar ID si el checkbox está desmarcado
            const index = formArray.controls.findIndex(
                (control) => control.value === id
            );
            if (index >= 0) {
                formArray.removeAt(index);
            }
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.vinculacionForm.get(formControlName) as FormControl;
    }
}
