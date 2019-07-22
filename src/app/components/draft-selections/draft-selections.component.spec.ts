import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftSelectionsComponent } from './draft-selections.component';

describe('DraftSelectionsComponent', () => {
  let component: DraftSelectionsComponent;
  let fixture: ComponentFixture<DraftSelectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftSelectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftSelectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
