import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertBookPage } from './insert-book.page';

describe('InsertBookPage', () => {
  let component: InsertBookPage;
  let fixture: ComponentFixture<InsertBookPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertBookPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertBookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
