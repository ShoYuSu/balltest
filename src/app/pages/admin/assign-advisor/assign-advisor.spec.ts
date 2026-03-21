import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAdvisor } from './assign-advisor.component';

describe('AssignAdvisor', () => {
  let component: AssignAdvisor;
  let fixture: ComponentFixture<AssignAdvisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAdvisor],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignAdvisor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
