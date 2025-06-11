import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisMailComponent } from './devis-mail.component';

describe('DevisMailComponent', () => {
  let component: DevisMailComponent;
  let fixture: ComponentFixture<DevisMailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisMailComponent]
    });
    fixture = TestBed.createComponent(DevisMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
