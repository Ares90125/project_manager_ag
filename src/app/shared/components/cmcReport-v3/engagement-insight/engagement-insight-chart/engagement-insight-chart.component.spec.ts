import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EngagementInsightChartComponent} from './engagement-insight-chart.component';

describe('EngagementInsightChartComponent', () => {
	let component: EngagementInsightChartComponent;
	let fixture: ComponentFixture<EngagementInsightChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EngagementInsightChartComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EngagementInsightChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
