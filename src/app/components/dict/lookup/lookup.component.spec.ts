import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupPage } from './lookup.page';

describe('LookupPage', () => {
  let component: LookupPage;
  let fixture: ComponentFixture<LookupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LookupPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
