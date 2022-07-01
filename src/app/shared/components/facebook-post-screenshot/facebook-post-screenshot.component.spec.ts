import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookPostScreenshotComponent } from './facebook-post-screenshot.component';

describe('FacebookPostScreenshotComponent', () => {
  let component: FacebookPostScreenshotComponent;
  let fixture: ComponentFixture<FacebookPostScreenshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacebookPostScreenshotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacebookPostScreenshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
