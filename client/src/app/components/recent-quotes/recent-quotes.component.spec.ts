import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentQuotesComponent } from './recent-quotes.component';

describe('RecentQuotesComponent', () => {
  let component: RecentQuotesComponent;
  let fixture: ComponentFixture<RecentQuotesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecentQuotesComponent]
    });
    fixture = TestBed.createComponent(RecentQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
