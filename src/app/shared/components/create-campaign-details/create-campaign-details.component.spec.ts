import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateCampaignDetailsComponent} from './create-campaign-details.component';

describe('CreateCampaignDetailsComponent', () => {
	let component: CreateCampaignDetailsComponent;
	let fixture: ComponentFixture<CreateCampaignDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateCampaignDetailsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateCampaignDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
