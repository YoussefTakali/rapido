import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsOverviewComponent } from './clients-overview.component';

describe('ClientsOverviewComponent', () => {
  let component: ClientsOverviewComponent;
  let fixture: ComponentFixture<ClientsOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientsOverviewComponent]
    });
    fixture = TestBed.createComponent(ClientsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
