import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TopPerformingPostComponent} from './top-performing-post.component';

describe('TopPerformingPostComponent', () => {
	let component: TopPerformingPostComponent;
	let fixture: ComponentFixture<TopPerformingPostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TopPerformingPostComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TopPerformingPostComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
