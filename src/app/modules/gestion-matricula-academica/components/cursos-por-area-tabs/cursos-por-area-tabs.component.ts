import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-cursos-por-area-tabs',
    templateUrl: './cursos-por-area-tabs.component.html',
    styleUrls: ['./cursos-por-area-tabs.component.scss'],
})
export class CursosPorAreaTabsComponent {
    @Input() areas: { label: string; value: string }[] = [];
    @Input() cursosPorArea: Record<string, any[]> = {};
    @Input() loadingCursosPorArea: Record<string, boolean> = {};
    @Input() cursosPorAreaAgrupados: Record<
        string,
        { asignatura: string; cursos: any[] }[]
    > = {};

    @Output() tabChanged = new EventEmitter<any>();
    @Output() cursoSeleccionado = new EventEmitter<{
        event: Event;
        item: any;
        area: { label: string; value: string };
    }>();

    onTabChange(event: any): void {
        this.tabChanged.emit(event);
    }

    onSeleccionarCurso(
        event: Event,
        item: any,
        area: { label: string; value: string }
    ): void {
        this.cursoSeleccionado.emit({ event, item, area });
    }
}
