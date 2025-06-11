import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteStatusChartComponent } from './quote-status-chart.component';

describe('QuoteStatusChartComponent', () => {
  let component: QuoteStatusChartComponent;
  let fixture: ComponentFixture<QuoteStatusChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuoteStatusChartComponent]
    });
    fixture = TestBed.createComponent(QuoteStatusChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
