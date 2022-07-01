import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReferenceConversationComponent} from './reference-conversation.component';

describe('ReferenceConversationComponent', () => {
	let component: ReferenceConversationComponent;
	let fixture: ComponentFixture<ReferenceConversationComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ReferenceConversationComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ReferenceConversationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
