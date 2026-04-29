import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorInformation } from './advisor-information';

describe('AdvisorInformation', () => {
  let component: AdvisorInformation;
  let fixture: ComponentFixture<AdvisorInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorInformation],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorInformation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
