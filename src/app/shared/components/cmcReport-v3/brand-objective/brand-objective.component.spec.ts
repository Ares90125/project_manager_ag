import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BrandObjectiveComponent} from './brand-objective.component';

describe('BrandObjectiveComponent', () => {
	let component: BrandObjectiveComponent;
	let fixture: ComponentFixture<BrandObjectiveComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BrandObjectiveComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BrandObjectiveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
