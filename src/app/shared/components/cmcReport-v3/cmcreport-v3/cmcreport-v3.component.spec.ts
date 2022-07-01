import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CMCReportV3Component} from './cmcreport-v3.component';

describe('CMCReportV3Component', () => {
	let component: CMCReportV3Component;
	let fixture: ComponentFixture<CMCReportV3Component>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CMCReportV3Component]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CMCReportV3Component);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
