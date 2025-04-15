import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadicadorComponent } from './radicador.component';

describe('RadicadorComponent', () => {
  let component: RadicadorComponent;
  let fixture: ComponentFixture<RadicadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadicadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadicadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
