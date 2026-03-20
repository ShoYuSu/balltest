import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plo } from './plo';

describe('Plo', () => {
  let component: Plo;
  let fixture: ComponentFixture<Plo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plo],
    }).compileComponents();

    fixture = TestBed.createComponent(Plo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
