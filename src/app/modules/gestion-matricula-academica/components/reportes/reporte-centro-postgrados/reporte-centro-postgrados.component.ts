import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { gestion_matricula_financiera } from 'src/environments/environment';

interface PeriodoAcademico {
    id: number;
    tagPeriodo: number;
    anio: number;
    descripcion: string;
    estado: string;
}

interface ReporteRow {
    identificacion: string;
    nombreCompleto: string;
    valorMatriculaSMMLV: number;
    semestreFinanciero: number;
    aplicaDescuentoVoto: boolean;
    aplicaDescuentoEgresado: boolean;
    resolucionBeca: string;
    porcentajeBeca: number;
    semestreAcademico: number;
    materias: { codigoOid: string; materia: string }[];
    docenteEncargado: string;
    grupoClase: string;
}

// Layout de la plantilla "plantilla-centro-postgrados.xlsx" (columnas 1-indexadas, A=1).
// La columna I está oculta en la plantilla original: el encabezado "% Beca" y el valor
// de cada estudiante se combinan I:J para que el contenido sea visible pese a la columna oculta.
const TEMPLATE_URL = 'assets/reportes/plantilla-centro-postgrados.xlsx';
const NUM_COLS = 15; // A..O
const COLUMN_WIDTHS = [
    1.73, 14, 25, 12, 6.54, 6.45, 7.82, 8.54, 3, 8.18, 5.45, 11.54, 29, 17.73,
    11.45,
];
const HIDDEN_COLUMN = 9; // columna I

// Alto uniforme para todas las filas generadas (encabezados, estudiantes y notas).
const ALTO_FILA = 50;
const COL_IZQUIERDA = 2; // columna B: la A es un margen angosto sin contenido

const COL = {
    ID: 2,
    NOMBRE: 3,
    VALOR: 4,
    SEM_FIN: 5,
    DESC_VOTO: 6,
    DESC_EGR: 7,
    RES_BECA: 8,
    PCT_BECA: 9,
    PCT_BECA_FIN: 10,
    SEM_ACAD: 11,
    COD_OID: 12,
    MATERIA: 13,
    DOCENTE: 14,
    GRUPO: 15,
};

// Filas de la plantilla que forman cada bloque repetible por semestre.
const TPL_TITULO_INICIO = 4;
const TPL_CABECERA_FIN = 10;
const TPL_FILA_DATOS = 13; // fila con bordes completos, usada como estilo base de cada fila de estudiante
const TPL_NOTAS_INICIO = 15;
const TPL_NOTAS_FIN = 18;

const TITULO_MATRICULA =
    'Matrícula Financiera-       ESTUDIANTES NUEVOS  SI  __  NO _X_ ( marcar con una x) \n\nMatrícula Financiera-       ESTUDIANTES REGULARES SI  _X_  NO __ ( marcar con una x) \n';

function colLetraANumero(letras: string): number {
    let n = 0;
    for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n;
}

function parsearRango(rango: string): {
    c1: number;
    r1: number;
    c2: number;
    r2: number;
} {
    const [inicio, fin] = rango.split(':');
    const m1 = inicio.match(/^([A-Z]+)(\d+)$/)!;
    const m2 = fin.match(/^([A-Z]+)(\d+)$/)!;
    return {
        c1: colLetraANumero(m1[1]),
        r1: +m1[2],
        c2: colLetraANumero(m2[1]),
        r2: +m2[2],
    };
}

function clonarEstiloCeldas(origen: ExcelJS.Row, destino: ExcelJS.Row): void {
    destino.height = ALTO_FILA;
    for (let c = 1; c <= NUM_COLS; c++) {
        destino.getCell(c).style = JSON.parse(
            JSON.stringify(origen.getCell(c).style)
        );
    }
    asegurarBordeDerecho(destino);
}

// La columna O (última, 15) queda sin borde derecho en algunas filas de la plantilla
// (encabezados de Matrícula Académica/Financiera). Se fuerza aquí para que el marco
// de la tabla quede completo sin depender de que la plantilla lo tenga bien definido.
function asegurarBordeDerecho(fila: ExcelJS.Row): void {
    agregarBorde(fila.getCell(NUM_COLS), { right: { style: 'thin' } });
}

function agregarBorde(
    celda: ExcelJS.Cell,
    lados: Partial<ExcelJS.Borders>
): void {
    celda.border = { ...(celda.border || {}), ...lados };
}

// Dibuja el marco completo (arriba, abajo, izquierda, derecha) alrededor del bloque
// de filas/columnas indicado. La plantilla original no trae bordes consistentes en
// todo el perímetro, así que se fuerza aquí para que la tabla quede cerrada.
function dibujarBordePerimetro(
    ws: ExcelJS.Worksheet,
    filaInicio: number,
    filaFin: number,
    colInicio: number,
    colFin: number
): void {
    for (let c = colInicio; c <= colFin; c++) {
        agregarBorde(ws.getCell(filaInicio, c), { top: { style: 'thin' } });
        agregarBorde(ws.getCell(filaFin, c), { bottom: { style: 'thin' } });
    }
    for (let r = filaInicio; r <= filaFin; r++) {
        agregarBorde(ws.getCell(r, colInicio), { left: { style: 'thin' } });
        agregarBorde(ws.getCell(r, colFin), { right: { style: 'thin' } });
    }
}

// Copia un bloque de filas (valores, estilos, alturas y merges) de la plantilla al destino,
// desplazando todo por (destinoInicio - origenInicio) filas.
function clonarBloque(
    origenWs: ExcelJS.Worksheet,
    destinoWs: ExcelJS.Worksheet,
    origenInicio: number,
    origenFin: number,
    destinoInicio: number
): void {
    const offset = destinoInicio - origenInicio;
    for (let r = origenInicio; r <= origenFin; r++) {
        const filaOrigen = origenWs.getRow(r);
        const filaDestino = destinoWs.getRow(r + offset);
        filaDestino.height = ALTO_FILA;
        for (let c = 1; c <= NUM_COLS; c++) {
            const celdaOrigen = filaOrigen.getCell(c);
            const celdaDestino = filaDestino.getCell(c);
            celdaDestino.value = celdaOrigen.value;
            celdaDestino.style = JSON.parse(JSON.stringify(celdaOrigen.style));
        }
        asegurarBordeDerecho(filaDestino);
    }
    const merges: string[] =
        (origenWs as unknown as { model: { merges: string[] } }).model.merges ||
        [];
    merges.forEach((rango) => {
        const { c1, r1, c2, r2 } = parsearRango(rango);
        if (r1 >= origenInicio && r2 <= origenFin) {
            destinoWs.mergeCells(r1 + offset, c1, r2 + offset, c2);
        }
    });
}

@Component({
    selector: 'app-reporte-centro-postgrados',
    templateUrl: './reporte-centro-postgrados.component.html',
    styleUrls: ['./reporte-centro-postgrados.component.scss'],
    providers: [MessageService],
})
export class ReporteCentroPostgradosComponent implements OnInit {
    periodos: PeriodoAcademico[] = [];
    periodoSeleccionado: PeriodoAcademico | null = null;
    cargando = false;
    descargando = false;

    private readonly financieraApi = gestion_matricula_financiera.api_url;

    constructor(
        private http: HttpClient,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarPeriodos();
    }

    cargarPeriodos(): void {
        this.cargando = true;
        this.http
            .get<PeriodoAcademico[]>(`${this.financieraApi}periodos`)
            .subscribe({
                next: (data) => {
                    this.periodos = (data || [])
                        .filter(
                            (p) =>
                                p.estado === 'ACTIVO' ||
                                p.estado === 'FINALIZADO' ||
                                p.estado === 'CERRADO'
                        )
                        .sort(
                            (a, b) =>
                                b.anio - a.anio || b.tagPeriodo - a.tagPeriodo
                        );
                    this.cargando = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los periodos',
                    });
                    this.cargando = false;
                },
            });
    }

    descargarReporte(): void {
        if (!this.periodoSeleccionado) return;
        this.descargando = true;
        const periodoId = this.periodoSeleccionado.id;
        const periodoLabel = `${this.periodoSeleccionado.anio}-${this.periodoSeleccionado.tagPeriodo}`;

        this.http
            .get<ReporteRow[]>(
                `${this.financieraApi}reporte-centro-postgrados/${periodoId}`
            )
            .subscribe({
                next: async (data) => {
                    try {
                        await this.generarExcel(data, periodoLabel);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Reporte generado',
                            detail: 'Descarga iniciada',
                        });
                    } catch (e) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo generar el Excel',
                        });
                    }
                    this.descargando = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron obtener los datos',
                    });
                    this.descargando = false;
                },
            });
    }

    private async generarExcel(
        data: ReporteRow[],
        periodoLabel: string
    ): Promise<void> {
        const buffer = await firstValueFrom(
            this.http.get(TEMPLATE_URL, { responseType: 'arraybuffer' })
        );
        const plantillaWb = new ExcelJS.Workbook();
        await plantillaWb.xlsx.load(buffer);
        const plantillaWs = plantillaWb.worksheets[0];

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet(`Matriculas ${periodoLabel}`);

        COLUMN_WIDTHS.forEach((w, i) => (ws.getColumn(i + 1).width = w));
        ws.getColumn(HIDDEN_COLUMN).hidden = true;
        ws.pageSetup = { ...plantillaWs.pageSetup };

        const grupos = new Map<number, ReporteRow[]>();
        for (const r of data) {
            const sem = r.semestreFinanciero ?? 0;
            if (!grupos.has(sem)) grupos.set(sem, []);
            grupos.get(sem)!.push(r);
        }
        const semestres = Array.from(grupos.keys()).sort((a, b) => b - a);

        let cursor = 3; // deja 2 filas de margen superior, igual que en la plantilla original

        for (const semestre of semestres) {
            const estudiantes = [...grupos.get(semestre)!].sort((a, b) =>
                a.nombreCompleto.localeCompare(b.nombreCompleto)
            );
            const gruposClase = [
                ...new Set(
                    estudiantes.map((e) => e.grupoClase).filter(Boolean)
                ),
            ]
                .sort()
                .join('-');

            // Título + cabecera (filas 4 a 10 de la plantilla)
            const blockStart = cursor;
            clonarBloque(
                plantillaWs,
                ws,
                TPL_TITULO_INICIO,
                TPL_CABECERA_FIN,
                blockStart
            );
            ws.getCell(blockStart, COL.ID).value = TITULO_MATRICULA;
            // El semestre académico reportado en el título nunca supera 4 (duración
            // oficial del programa), aunque el valor real del estudiante en BD sea mayor
            // (p. ej. por matrículas repetidas). Se limita aquí para el rótulo del bloque.
            const semestreAcadDelGrupo = Math.min(
                estudiantes[0]?.semestreAcademico ?? semestre,
                4
            );
            ws.getCell(blockStart + 1, COL.SEM_ACAD).value =
                `Semestre: ____${semestreAcadDelGrupo}____`;
            ws.getCell(blockStart + 4, COL.GRUPO).value = gruposClase;
            // La fila 10 de la plantilla (Código-OID/Materia + nota "Pendiente...")
            // queda demasiado baja para su contenido real.
            ws.getRow(blockStart + 6).height = ALTO_FILA;
            cursor += TPL_CABECERA_FIN - TPL_TITULO_INICIO + 1;

            // Filas de estudiantes
            for (const est of estudiantes) {
                const materias = est.materias?.length
                    ? est.materias
                    : [{ codigoOid: '', materia: '' }];
                const rowStart = cursor;

                materias.forEach((m, i) => {
                    const fila = ws.getRow(cursor);
                    clonarEstiloCeldas(
                        plantillaWs.getRow(TPL_FILA_DATOS),
                        fila
                    );
                    fila.height = ALTO_FILA;
                    if (i === 0) {
                        fila.getCell(COL.ID).value = est.identificacion;
                        fila.getCell(COL.NOMBRE).value = est.nombreCompleto;
                        fila.getCell(COL.VALOR).value =
                            est.valorMatriculaSMMLV ?? '';
                        fila.getCell(COL.SEM_FIN).value =
                            est.semestreFinanciero ?? '';
                        fila.getCell(COL.DESC_VOTO).value =
                            est.aplicaDescuentoVoto ? 'SI' : 'NO';
                        fila.getCell(COL.DESC_EGR).value =
                            est.aplicaDescuentoEgresado ? 'SI' : 'NO';
                        fila.getCell(COL.RES_BECA).value =
                            est.resolucionBeca ||
                            (est.porcentajeBeca != null ? '' : 'NO');
                        fila.getCell(COL.PCT_BECA).value =
                            est.porcentajeBeca != null && est.porcentajeBeca > 0
                                ? `${est.porcentajeBeca}%`
                                : '';
                        fila.getCell(COL.SEM_ACAD).value =
                            est.semestreAcademico ?? '';
                        fila.getCell(COL.DOCENTE).value =
                            est.docenteEncargado || '';
                        fila.getCell(COL.GRUPO).value = est.grupoClase || '';
                    }
                    fila.getCell(COL.COD_OID).value = m.codigoOid || '';
                    fila.getCell(COL.MATERIA).value = m.materia || '';
                    cursor++;
                });

                const rowEnd = cursor - 1;
                ws.mergeCells(rowStart, COL.PCT_BECA, rowEnd, COL.PCT_BECA_FIN);
                if (rowEnd > rowStart) {
                    [
                        COL.ID,
                        COL.NOMBRE,
                        COL.VALOR,
                        COL.SEM_FIN,
                        COL.DESC_VOTO,
                        COL.DESC_EGR,
                        COL.RES_BECA,
                        COL.SEM_ACAD,
                        COL.DOCENTE,
                        COL.GRUPO,
                    ].forEach((c) => ws.mergeCells(rowStart, c, rowEnd, c));
                }
            }

            // Notas + leyendas (filas 15 a 18 de la plantilla). Las primeras 2 filas son
            // las notas con asterisco (van dentro del recuadro); las últimas 2 son la
            // leyenda SEM FINAN/SEM ACAD, fuera del recuadro (sin bordes, como en la plantilla).
            const notasInicio = cursor;
            clonarBloque(
                plantillaWs,
                ws,
                TPL_NOTAS_INICIO,
                TPL_NOTAS_FIN,
                cursor
            );
            cursor += TPL_NOTAS_FIN - TPL_NOTAS_INICIO + 1;

            const finRecuadro = notasInicio + 1;
            dibujarBordePerimetro(
                ws,
                blockStart,
                finRecuadro,
                COL_IZQUIERDA,
                NUM_COLS
            );

            // Leyenda SEM FINAN / SEM ACAD (últimas 2 filas del bloque de notas): también
            // lleva su propio recuadro completo, con una línea separando ambas filas.
            const leyendaInicio = notasInicio + 2;
            const leyendaFin = notasInicio + 3;
            dibujarBordePerimetro(
                ws,
                leyendaInicio,
                leyendaFin,
                COL_IZQUIERDA,
                NUM_COLS
            );
            for (let c = COL_IZQUIERDA; c <= NUM_COLS; c++) {
                agregarBorde(ws.getCell(leyendaInicio, c), {
                    bottom: { style: 'thin' },
                });
            }

            cursor += 3; // espacio entre tablas de semestre
        }

        const outBuffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([outBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `Matriculas_${periodoLabel}.xlsx`);
    }
}
