import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryStudentRecord } from './history-student-record';

describe('HistoryStudentRecord', () => {
  let component: HistoryStudentRecord;
  let fixture: ComponentFixture<HistoryStudentRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryStudentRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryStudentRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
