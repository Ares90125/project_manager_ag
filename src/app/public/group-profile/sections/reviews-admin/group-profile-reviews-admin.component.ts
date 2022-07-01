import {
	Component,
	Injector,
	OnDestroy,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ViewChildren,
	QueryList,
	AfterViewInit
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePage, GroupProfileReview} from '@sharedModule/models/graph-ql.model';
import {MatExpansionPanel} from '@angular/material/expansion';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';

@Component({
	selector: 'app-group-profile-reviews-admin',
	templateUrl: './group-profile-reviews-admin.component.html',
	styleUrls: ['./group-profile-reviews-admin.component.scss']
})
export class GroupProfileReviewsAdminComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() isEditAvailable: boolean = true;
	@Input() reviews: GroupProfileReview[];
	@Input() averageRating: number;
	@Input() ratingCount: number;
	@Input() showReviews: boolean;
	@Input() groupProfilePage: GroupProfilePage;
	@Input() groupId: string;
	openReviewsModal: boolean = false;
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	// @Output() processReviewsModal: EventEmitter<any> = new EventEmitter<any>();
	// @Output() closeReviewsPopup: EventEmitter<any> = new EventEmitter<any>();
	@Output() handleAdminEditClick: EventEmitter<any> = new EventEmitter<any>();
	isExpanded: boolean = false;
	showNoFilledBorder: boolean = false;
	showReviewsVideo: boolean = false;

	constructor(injector: Injector, private readonly groupProfilePagesService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	processReviewsModal() {
		this.openReviewsModal = true;
	}

	closeReviewsPopup() {
		this.openReviewsModal = false;
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	openReviewHelpVideo() {
		this.showReviewsVideo = true;
	}

	closeVideoPlayer() {
		this.showReviewsVideo = false;
	}

	ngAfterViewInit() {
		this.pannels.forEach(async (x, index) => {
			const response = await this.groupProfilePagesService.getGroupReviews(this.groupProfilePage.groupId);
			this.isExpanded = true;
			x.hideToggle = true;
			x.expanded = true;
			if (response.reviews?.length === 0) {
				this.showNoFilledBorder = true;
			}
			x.expandedChange.subscribe(data => {
				if (data) {
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			});
		});
	}
}

