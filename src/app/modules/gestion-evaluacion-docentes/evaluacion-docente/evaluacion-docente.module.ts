import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "primeng/api";
import { PrimenNgModule } from "../../primen-ng/primen-ng.module";
import { ReactiveFormsModule } from "@angular/forms";
import { EvaluacionDocenteRoutingModule } from "./evaluacion-docente-routing.module";
import { PrincipalEvaluacionDocenteComponent } from "./pages/principal-evaluacion-docente/principal-evaluacion-docente.component";
import { EvaluacionDocenteComponent } from "./components/evaluacion-docente/evaluacion-docente.component";


@NgModule({
    declarations : [
        PrincipalEvaluacionDocenteComponent,
        EvaluacionDocenteComponent
    ],
    imports : [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        ReactiveFormsModule,
        EvaluacionDocenteRoutingModule,
    ]
})
export class EvaluacionDocenteModule {}