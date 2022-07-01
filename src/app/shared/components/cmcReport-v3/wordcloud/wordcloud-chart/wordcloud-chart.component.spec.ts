import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WordcloudChartComponent} from './wordcloud-chart.component';

describe('WordcloudChartComponent', () => {
	let component: WordcloudChartComponent;
	let fixture: ComponentFixture<WordcloudChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [WordcloudChartComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(WordcloudChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
