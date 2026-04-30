import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorRecord } from './advisor-record';

describe('AdvisorRecord', () => {
  let component: AdvisorRecord;
  let fixture: ComponentFixture<AdvisorRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
