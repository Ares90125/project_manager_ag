import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PhaseIdeaComponent} from './phase-idea.component';

describe('PhaseIdeaComponent', () => {
	let component: PhaseIdeaComponent;
	let fixture: ComponentFixture<PhaseIdeaComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PhaseIdeaComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PhaseIdeaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
