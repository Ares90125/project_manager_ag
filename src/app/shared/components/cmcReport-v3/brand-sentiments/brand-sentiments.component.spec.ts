import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BrandSentimentsComponent} from './brand-sentiments.component';

describe('BrandSentimentsComponent', () => {
	let component: BrandSentimentsComponent;
	let fixture: ComponentFixture<BrandSentimentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BrandSentimentsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BrandSentimentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
