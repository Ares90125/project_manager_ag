import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BrandShareOfVoiceComponent} from './brand-share-of-voice.component';

describe('BrandShareOfVoiceComponent', () => {
	let component: BrandShareOfVoiceComponent;
	let fixture: ComponentFixture<BrandShareOfVoiceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BrandShareOfVoiceComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BrandShareOfVoiceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
