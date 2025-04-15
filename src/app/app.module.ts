import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './core/pages/app.component';
import { AppTopBarComponent } from './core/components/topbar/app.topbar.component';
import { AppFooterComponent } from './core/components/footer/app.footer.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

import { MenuService } from './core/services/app.menu.service';
import { ConfigService } from './core/services/app.config.service';
import { AppMainComponent } from './core/components/main/app.main.component';
import { AppMenuComponent } from './core/components/menu/app.menu.component';
import { AppMenuitemComponent } from './core/components/menu-item/app.menuitem.component';
import { AppConfigComponent } from './core/components/config/app.config.component';
import { PrimenNgModule } from './modules/primen-ng/primen-ng.module';
import { HomeComponent } from './core/components/home/home.component';
import { MessageService, SharedModule } from 'primeng/api';
import { GestionEstudiantesModule } from './modules/gestion-estudiantes/gestion-estudiantes.module';
import { AppBreadcrumbComponent } from './core/components/breadcrumb/app.breadcrumb.component';
import { BreadcrumbService } from './core/components/breadcrumb/app.breadcrumb.service';
import { BandejaDocentesComponent } from './modules/gestion-docentes/components/bandeja-docentes/bandeja-docentes.component';
import { CargarDocentesComponent } from './modules/gestion-docentes/components/cargar-docentes/cargar-docentes.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AuthInterceptor } from './shared/config/interceptor';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { GestionCuestionariosModule } from './modules/gestion-evaluacion-docentes/gestion-cuestionarios/gestion-cuestionarios.module';
import { GestionPreguntasModule } from './modules/gestion-evaluacion-docentes/gestion-preguntas/gestion-preguntas.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        PrimenNgModule,
        SharedModule,
        GestionEstudiantesModule,
        ReactiveFormsModule,
        PdfViewerModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        TableModule,
        ButtonModule,
        ToastModule,
        HttpClientModule,
        GestionCuestionariosModule,
        GestionPreguntasModule,
    ],
    declarations: [
        AppComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppConfigComponent,
        AppBreadcrumbComponent,
        HomeComponent,
        BandejaDocentesComponent,
        CargarDocentesComponent,

    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        MessageService,
        MenuService,
        ConfigService,
        BreadcrumbService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
