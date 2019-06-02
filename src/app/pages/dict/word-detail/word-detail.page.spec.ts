import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordDetailPage } from './word-detail.page';

describe('WordDetailPage', () => {
  let component: WordDetailPage;
  let fixture: ComponentFixture<WordDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
