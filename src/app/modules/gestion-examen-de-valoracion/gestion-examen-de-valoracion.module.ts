import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/shared/shared.module';

import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ExamenDeValoracionRoutingModule } from './gestion-examen-de-valoracion-routing.module';

import { PrincipalExamenDeValoracionComponent } from './pages/principal-examen-de-valoracion/principal-examen-de-valoracion.component';
import { BandejaExamenDeValoracionComponent } from './components/bandeja-examen/bandeja-examen-de-valoracion.component';
import { SolicitudExamenComponent } from './components/solicitud-examen/solicitud-examen.component';
import { RespuestaExamenComponent } from './components/respuesta-examen/respuesta-examen.component';
import { CustomFileUploadComponent } from './components/custom-file-upload/custom-file-upload.component';
import { ResolucionExamenComponent } from './components/resolucion-examen/resolucion-examen.component';
import { SustentacionExamenComponent } from './components/sustentacion-examen/sustentacion-examen.component';
import { DocumentoFormatoAComponent } from './components/documentos/documento-formatoA/documento-formatoA.component';
import { FileUploadValueAccessorDirective } from './components/respuesta-examen/utils/fileupload-accessor-directive';

import { SolicitudService } from './services/solicitud.service';
import { TrabajoDeGradoService } from './services/trabajoDeGrado.service';
import { RespuestaService } from './services/respuesta.service';
import { ResolucionService } from './services/resolucion.service';
import { SustentacionService } from './services/sustentacion.service';
import { DocumentoFormatoBService } from './services/docs/documentoFormatoB.service';
import { DocumentoFormatoCService } from './services/docs/documentoFormatoC.service';
import { DocumentoFormatoFComponent } from './components/documentos/documento-formatoF/documento-formatoF.component';
import { DocumentoformatoEvaluadoresComponent } from './components/documentos/documento-formatoEvaluadores/documento-formatoEvaluadores.component';
import { DocumentoFormatoGComponent } from './components/documentos/documento-formatoG/documento-formatoG.component';
import { DocumentoFormatoHvaGradoComponent } from './components/documentos/documento-formatoHvaGrado/documento-formatoHvaGrado.component';
import { DocumentoFormatoHvaComponent } from './components/documentos/documento-formatoHva/documento-formatoHva.component';
import { DocumentoFormatoResolucionConsejoComponent } from './components/documentos/documento-formatoResolucionConsejo/documento-formatoResolucionConsejo.component';
import { DocumentoFormatoResolucionComiteComponent } from './components/documentos/documento-formatoResolucionComite/documento-formatoResolucionComite.component';

@NgModule({
    declarations: [
        PrincipalExamenDeValoracionComponent,
        BandejaExamenDeValoracionComponent,
        DocumentoFormatoAComponent,
        DocumentoFormatoFComponent,
        DocumentoFormatoGComponent,
        DocumentoformatoEvaluadoresComponent,
        DocumentoFormatoHvaGradoComponent,
        DocumentoFormatoHvaComponent,
        DocumentoFormatoResolucionConsejoComponent,
        DocumentoFormatoResolucionComiteComponent,
        SolicitudExamenComponent,
        CustomFileUploadComponent,
        RespuestaExamenComponent,
        ResolucionExamenComponent,
        SustentacionExamenComponent,
        FileUploadValueAccessorDirective,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        ExamenDeValoracionRoutingModule,
        ReactiveFormsModule,
        PdfViewerModule,
    ],
    exports: [FileUploadValueAccessorDirective],
    providers: [
        TrabajoDeGradoService,
        SolicitudService,
        RespuestaService,
        ResolucionService,
        SustentacionService,
        DocumentoFormatoBService,
        DocumentoFormatoCService,
    ],
})
export class ExamenDeValoracionModule {}
