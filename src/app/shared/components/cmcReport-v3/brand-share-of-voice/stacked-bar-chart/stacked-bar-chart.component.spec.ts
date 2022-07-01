import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ShareofVoiceStackedBarChartComponent} from './stacked-bar-chart.component';

describe('ShareofVoiceStackedBarChartComponent', () => {
	let component: ShareofVoiceStackedBarChartComponent;
	let fixture: ComponentFixture<ShareofVoiceStackedBarChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ShareofVoiceStackedBarChartComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShareofVoiceStackedBarChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
