import {Component, Injector, OnDestroy, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePage, GroupProfileReview} from '@sharedModule/models/graph-ql.model';
import {UserModel} from '@sharedModule/models/user.model';

@Component({
	selector: 'app-group-profile-reviews',
	templateUrl: './group-profile-reviews.component.html',
	styleUrls: ['./group-profile-reviews.component.scss']
})
export class GroupProfileReviewsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() reviews: GroupProfileReview[];
	@Input() currentUserReview: GroupProfileReview;
	@Input() averageRating: number;
	@Input() ratingCount: number;
	@Input() user: UserModel;
	@Input() groupProfilePage: GroupProfilePage;
	@Input() isCurrentUserAdmin: boolean;
	@Output() handleReviewsModal: EventEmitter<any> = new EventEmitter<any>();
	@Output() handleWriteReviewModal: EventEmitter<any> = new EventEmitter<any>();

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
