import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UnretrievedPostsComponent} from './unretrieved-posts.component';

describe('UnretrievedPostsComponent', () => {
	let component: UnretrievedPostsComponent;
	let fixture: ComponentFixture<UnretrievedPostsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UnretrievedPostsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UnretrievedPostsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
