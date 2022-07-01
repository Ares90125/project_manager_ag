import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateCampaignDetailsV3Component} from './create-campaign-details-v3.component';

describe('CreateCampaignDetailsV3Component', () => {
	let component: CreateCampaignDetailsV3Component;
	let fixture: ComponentFixture<CreateCampaignDetailsV3Component>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateCampaignDetailsV3Component]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateCampaignDetailsV3Component);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
