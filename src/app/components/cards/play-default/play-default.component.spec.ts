import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayDefaultPage } from './play-default.page';

describe('PlayDefaultPage', () => {
  let component: PlayDefaultPage;
  let fixture: ComponentFixture<PlayDefaultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayDefaultPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayDefaultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
