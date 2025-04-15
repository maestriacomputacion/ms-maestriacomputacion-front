import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtrasolicitudComponent } from './otrasolicitud.component';

describe('OtrasolicitudComponent', () => {
    let component: OtrasolicitudComponent;
    let fixture: ComponentFixture<OtrasolicitudComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OtrasolicitudComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OtrasolicitudComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
