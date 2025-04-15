import { Component, OnInit } from '@angular/core';
import { CertificadoVotacionService, CertificadoVotacion, AcademicPeriod } from '../../services/certificado-votacion.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tramite-certificado',
  templateUrl: './tramitecertificado.component.html',
  styleUrls: ['./tramitecertificado.component.scss'],
  providers: [MessageService],
})

export class TramiteCertificadoComponent implements OnInit {
  certificates: CertificadoVotacion[] = [];
  filteredCertificates: CertificadoVotacion[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  downloading: boolean;
  isUpdating: boolean = false;

  constructor(
    private certificadoService: CertificadoVotacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  hasApprovedCertificates(): boolean {
    return this.certificates.some(cert => cert.estado === 'Aprobada');
  }

  ngOnInit(): void {
    this.loadCertificates();
  }   
  
  loadCertificates(callback?: () => void): void {
    this.loading = true;
    this.certificadoService.obtenerCertificado().subscribe({
      next: (response) => {
        this.certificates = response || [];
        this.filteredCertificates = [...this.certificates];
        this.loading = false;
  
        // Llamar al callback si existe
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los certificados',
        });
        this.certificates = [];
        this.loading = false;
      },
    });
  }  
  
  filterCertificates(event?: KeyboardEvent): void {
    if (event && event.key !== 'Enter') return;
  
    const search = this.searchTerm.trim();
    if (!search) {
      this.filteredCertificates = [...this.certificates]; // Restablece la lista original si el campo está vacío
      return;
    }
  
    this.filteredCertificates = this.certificates.filter(cert =>
      cert.id_Estudiante.toString().includes(search)
    );
  
    if (this.filteredCertificates.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin resultados',
        detail: 'No se encontraron certificados con el código digitado'
      });
    }
  }
  
  descargarcertificados(){      
    const certificadosAprobados = this.filteredCertificates.filter(cert => cert.estado === 'Aprobada');
    const estudiantesActivos = this.filteredCertificates.filter(cert => cert.estadoEstudiante === 'ACTIVO');

    if (!certificadosAprobados.length || estudiantesActivos.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `No hay certificados aprobados y/o estudiantes activos`,
      });
      return;
    }
  
    this.downloading = true;
    this.loading = true;
  
    this.certificadoService.downloadCertificado({
      estado_solicitud: 'Aprobada', 
      estado_estudiante: 'ACTIVO'
    }).subscribe({
      next: (blob: Blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `certificados_aprobados_${fecha}.zip`;
  
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
  
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Certificados descargados correctamente',
        });
      },
      error: (error) => {
        console.error('Error al descargar los certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar los certificados: ' + error.message,
        });
      },
      complete: () => {
        this.loading = false;
        this.downloading = false;
      },
    });
  }
    
  expireCertificates(): void {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.loading = true;

    if (this.filteredCertificates.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No hay certificados para vencer.' });
      this.isUpdating = false;
      this.loading = false;
      return;
    }
  
    // Solo necesitamos hacer una llamada ya que vencemos todos los certificados
    const body = { codigo: '32', estado: 'vencido' };
  
    this.certificadoService.actualizarEstadoSolicitud(body).subscribe({
      next: (response) => {
        // Actualizar la lista después de la operación exitosa
        this.loadCertificates(() => {        
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Todos los certificados han sido vencidos correctamente' 
          });
        });  
      },
      error: (error) => {
        console.error('Error al vencer los certificados:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error al vencer los certificados: ' + error.message 
        });
        this.loading = false;
        this.isUpdating = false;
      }
    });
  }

  confirmExpireCertificates(): void {
    this.confirmationService.confirm({
      message: '<div style="white-space: pre-line">¿Estás seguro de que deseas vencer TODOS los certificados?<br><br>Esta acción no se puede revertir y los estudiantes con los certificados aprobados tendrán que enviar nuevamente la solicitud</div>',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      accept: () => {
        this.expireCertificates();
      },
    });
  }  
}
