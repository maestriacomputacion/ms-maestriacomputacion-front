/**
 * CAPA: Presentación — Presentation Model (View Model)
 * Encapsula los cálculos financieros del Reporte Final.
 * SRP: el componente solo renderiza; este modelo calcula.
 * Los cálculos se mueven aquí desde ReporteFinalComponent.
 */

import { ConfiguracionReporteFinanciero, ProyeccionEstudiante } from './domain-models';

export interface ReporteFinalVM extends ProyeccionEstudiante {
  readonly nombreEstudiante: string;
  readonly matricula: number;
  readonly valorBeca: number;
  readonly valorEgresado: number;
  readonly recursosComputacionales: number;
  readonly biblioteca: number;
  readonly grupoDescuentos: number;
  readonly totalNeto: number;
}

/**
 * Factory pura: transforma un ProyeccionEstudiante + configuración en un ReporteFinalVM.
 * Sin efectos secundarios. Fácil de testear unitariamente.
 */
export function mapToReporteFinalVM(
  e: ProyeccionEstudiante,
  cfg: ConfiguracionReporteFinanciero,
): ReporteFinalVM {
  // Usamos estrictamente los valores calculados que vienen del backend
  const matricula = e.valorMatricula || 0;
  const recursosComputacionales = cfg.recursosComputacionales || 0;
  const biblioteca = cfg.biblioteca || 0;
  
  const valorVotacion  = e.valorDescuentoVoto || 0;
  const valorBeca      = e.valorDescuentoBeca || 0;
  const valorEgresado  = e.valorDescuentoEgresado || 0;
    
  const grupoDescuentos = e.totalDescuentos || 0;
  
  // El totalNeto ya viene calculado del backend incluyendo Biblioteca y Recursos
  const totalNeto = e.totalNetoConDerechos || 0;

  return {
    ...e,
    nombreEstudiante: `${e.nombre || ''} ${e.apellido || ''}`.trim(),
    matricula,
    valorBeca,
    valorEgresado,
    recursosComputacionales,
    biblioteca,
    grupoDescuentos,
    totalNeto,
  };
}



