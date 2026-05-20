import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualRecord } from './individual-record';

describe('IndividualRecord', () => {
  let component: IndividualRecord;
  let fixture: ComponentFixture<IndividualRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
