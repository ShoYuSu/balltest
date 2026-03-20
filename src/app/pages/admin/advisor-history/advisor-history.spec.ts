import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorHistory } from './advisor-history';

describe('AdvisorHistory', () => {
  let component: AdvisorHistory;
  let fixture: ComponentFixture<AdvisorHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
