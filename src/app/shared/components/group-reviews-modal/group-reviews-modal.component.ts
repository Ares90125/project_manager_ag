import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {getGroupProfileReviewsResponse, GroupProfileReview} from '@sharedModule/models/graph-ql.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {AnimationOptions} from 'ngx-lottie';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-group-reviews-modal',
	templateUrl: './group-reviews-modal.component.html',
	styleUrls: ['./group-reviews-modal.component.scss']
})
export class GroupReviewsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePopup = new EventEmitter<boolean>();
	@Input() groupId: string = '';
	@Input() externalReviews: getGroupProfileReviewsResponse | null = null;
	selectedSortBy: string = 'Recently reviewed';
	sortByOptions = {
		'Recently reviewed': 'timestamp',
		'Highest rated': 'rating',
		'Lowest rated': 'rating',
		'Visible reviews first': 'isDisabled',
		'Hidden reviews first': 'isDisabled'
	};
	isVisible: boolean = true;
	reviews: GroupProfileReview[];
	averageRating: number | null;
	ratingCount: number | null;
	totalRating: number | null;
	isPageLoading: boolean = true;
	loaderCount = [0, 1, 2];
	noReviews: boolean = false;
	// profilePage
	title: string = '';

	noContentAnimationOption: AnimationOptions = {
		path: './assets/json/star-green.json'
	};

	constructor(
		injector: Injector,
		readonly groupProfilePageService: GroupProfilePagesService,
		readonly groupsService: GroupsService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.getReviews(this.groupId);
	}

	async getReviews(groupProfileId: string) {
		let response;
		if (this.externalReviews) {
			response = this.externalReviews;
		} else {
			response = await this.groupProfilePageService.getGroupReviews(groupProfileId);
		}
		this.reviews = response.reviews;
		this.averageRating = response.averageRating;
		this.ratingCount = response.ratingCount;
		this.totalRating = response.totalRating;
		if (!response.reviews.length) {
			this.noReviews = true;
		}
		this.isPageLoading = false;
	}

	async sortReviews(option: string) {
		this.selectedSortBy = option;
		const key = this.sortByOptions[option];
		this.reviews = this.reviews.sort((a: GroupProfileReview, b: GroupProfileReview) => {
			const valueA = a[key];
			const valueB = b[key];

			if (option === 'Lowest rated' || option === 'Visible reviews first') {
				return valueA - valueB;
			}

			if (option === 'Highest rated' || option === 'Hidden reviews first') {
				return valueB - valueA;
			}

			if (valueA < valueB) {
				return 1;
			}
			if (valueA > valueB) {
				return -1;
			}

			return 0;
		});
	}

	async handleIsVisible(review: GroupProfileReview) {
		const response = await this.groupsService.putGroupReview({
			// toDo: added groupsReviews
			groupId: this.groupId,
			isDisabled: !review.isDisabled,
			rating: review.rating,
			reviewText: review.reviewText,
			reviewUserId: review.userId
		});
		const index = this.reviews.findIndex(review => review.userId === response.userId);
		this.reviews[index] = response;
	}

	closeReviewsModal() {
		this.closePopup.next(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
