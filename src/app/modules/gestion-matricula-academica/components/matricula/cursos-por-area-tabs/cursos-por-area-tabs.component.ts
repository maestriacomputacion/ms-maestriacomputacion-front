import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CursoUI } from '../../../models/curso.model';
import {
    CatalogoOption,
    TabChangeEvent,
    CursoAgrupado,
} from '../../../models/catalogo.model';

@Component({
    selector: 'app-cursos-por-area-tabs',
    templateUrl: './cursos-por-area-tabs.component.html',
    styleUrls: ['./cursos-por-area-tabs.component.scss'],
})
export class CursosPorAreaTabsComponent {
    @Input() areas: CatalogoOption[] = [];
    @Input() cursosPorArea: Record<string, CursoUI[]> = {};
    @Input() loadingCursosPorArea: Record<string, boolean> = {};
    @Input() cursosPorAreaAgrupados: Record<string, CursoAgrupado[]> = {};

    @Output() tabChanged = new EventEmitter<TabChangeEvent>();
    @Output() cursoSeleccionado = new EventEmitter<{
        event: Event;
        item: CursoUI;
        area: CatalogoOption;
    }>();

    onTabChange(event: TabChangeEvent): void {
        this.tabChanged.emit(event);
    }

    onSeleccionarCurso(
        event: Event,
        item: CursoUI,
        area: CatalogoOption
    ): void {
        this.cursoSeleccionado.emit({ event, item, area });
    }
}
