import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {GroupProfileReview} from '@sharedModule/models/graph-ql.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-profile-page-reviews',
	templateUrl: './profile-page-reviews.component.html',
	styleUrls: ['./profile-page-reviews.component.scss']
})
export class ProfilePageReviewsComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
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
	sortByModal: boolean = false;
	isProfileLoaded = false;

	constructor(
		injector: Injector,
		readonly groupProfilePageService: GroupProfilePagesService,
		readonly groupsService: GroupsService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePagesService.isProfilePageData$.pipe(takeUntil(this.destroy$)).subscribe(profilePage => {
			if (profilePage) {
				this.profilePage = profilePage;
				this.initProfilePage();
			}
		});
	}

	initProfilePage() {
		super.setPageTitle('GA - Group Profile Reviews', 'GA - Group Profile Reviews', {
			profile_id: this.profilePage.id,
			group_name: this.profilePage.groupName,
			profile_group_id: this.profilePage.groupId,
			profile_group_name: this.profilePage.name
		});
		this.getReviews(this.profilePage.id);
	}

	async getReviews(groupProfileId: string) {
		const response = await this.groupProfilePageService.getGroupProfileReviews(groupProfileId);
		this.reviews = response.reviews;
		this.averageRating = response.averageRating;
		this.ratingCount = response.ratingCount;
		this.totalRating = response.totalRating;

		this.isProfileLoaded = true;
	}

	async getRating(groupProfileId: string) {
		const response = await this.groupProfilePageService.getGroupProfileReviews(groupProfileId);
		this.averageRating = response.averageRating;
		this.ratingCount = response.ratingCount;
		this.totalRating = response.totalRating;
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

		if (this.renderedOn === 'Mobile') {
			this.sortByModal = false;
			this.enableScrolling();
		}
	}

	async handleIsVisible(review: GroupProfileReview) {
		const response = await this.groupsService.putGroupProfileReview({
			groupProfileId: review.groupProfileId,
			isDisabled: !review.isDisabled,
			rating: review.rating,
			reviewText: review.reviewText,
			reviewUserId: review.userId
		});
		const index = this.reviews.findIndex(review => review.userId === response.userId);
		this.reviews[index] = response;
		this.getRating(this.profilePage.id);
	}

	handleSortByModal() {
		if (this.renderedOn === 'Mobile') {
			if (this.sortByModal) {
				this.sortByModal = false;
				this.enableScrolling();
			} else {
				this.sortByModal = true;
				this.disableScrolling();
			}
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
