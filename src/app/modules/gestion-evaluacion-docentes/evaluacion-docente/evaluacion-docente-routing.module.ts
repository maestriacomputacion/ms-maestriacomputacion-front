import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EvaluacionDocenteComponent } from "./components/evaluacion-docente/evaluacion-docente.component";


const routes: Routes = [
    {
        path: ':id',
        component: EvaluacionDocenteComponent
    }
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EvaluacionDocenteRoutingModule {}