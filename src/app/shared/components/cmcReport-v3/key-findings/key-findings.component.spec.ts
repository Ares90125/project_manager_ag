import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KeyFindingsComponent} from './key-findings.component';

describe('KeyFindingsComponent', () => {
	let component: KeyFindingsComponent;
	let fixture: ComponentFixture<KeyFindingsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [KeyFindingsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(KeyFindingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
