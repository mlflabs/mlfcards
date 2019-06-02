import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayModalPage } from './play-modal.page';

describe('PlayModalPage', () => {
  let component: PlayModalPage;
  let fixture: ComponentFixture<PlayModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
