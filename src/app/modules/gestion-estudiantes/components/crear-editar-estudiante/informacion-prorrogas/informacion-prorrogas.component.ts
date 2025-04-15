import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Prorroga } from '../../../models/prorroga';
import { ModalProrrogaComponent } from '../../modals/modal-prorroga/modal-prorroga.component';
import { ModalReingresoComponent } from '../../modals/modal-reingreso/modal-reingreso.component';

@Component({
  selector: 'app-informacion-prorrogas',
  templateUrl: './informacion-prorrogas.component.html',
  styleUrls: ['./informacion-prorrogas.component.scss']
})
export class InformacionProrrogasComponent implements OnInit {

    prorrogas: Prorroga[] = [];

    constructor(
        private dialogService: DialogService,
    ) {}

    ngOnInit(): void {}

    showModalProrroga(prorroga?: Prorroga) {
        return this.dialogService.open(ModalProrrogaComponent, {
            header: 'Información prórroga o suspención de términos',
            width: '60%',
            data: { prorroga: prorroga },
        });
    }

    onAgregarProrroga() {
        const ref = this.showModalProrroga();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    this.prorrogas.push(response);
                }
            },
        });
    }

    onEditarProrroga(prorroga: Prorroga) {
        const ref = this.showModalProrroga(prorroga);
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    this.replaceProrroga(prorroga, response);
                }
            },
        });
    }

    replaceProrroga(base: Prorroga, replace: Prorroga) {
        let index = this.prorrogas.indexOf(base);
        this.prorrogas[index] = replace;
    }

    onDeleteProrroga(prorroga: Prorroga) {
        this.prorrogas = this.prorrogas.filter((p) => p != prorroga);
    }
}
