import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditReferenceConversationsComponent} from './edit-reference-conversations.component';

describe('EditReferenceConversationsComponent', () => {
	let component: EditReferenceConversationsComponent;
	let fixture: ComponentFixture<EditReferenceConversationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EditReferenceConversationsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EditReferenceConversationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
