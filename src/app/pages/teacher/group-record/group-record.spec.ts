import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRecord } from './group-record';

describe('GroupRecord', () => {
  let component: GroupRecord;
  let fixture: ComponentFixture<GroupRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
