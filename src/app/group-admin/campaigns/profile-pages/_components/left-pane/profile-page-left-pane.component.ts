import {Component, Injector, OnInit} from '@angular/core';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';
import {FileService} from '@sharedModule/services/file.service';
import {AnimationOptions} from 'ngx-lottie';
import {takeUntil} from 'rxjs/operators';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Router} from '@angular/router';

@Component({
	selector: 'app-profile-page-left-pane',
	templateUrl: './profile-page-left-pane.component.html',
	styleUrls: ['./profile-page-left-pane.component.scss']
})
export class ProfilePageLeftPaneComponent extends BaseComponent implements OnInit {
	openShareModal = false;
	isOverview: boolean = false;
	isEdit: boolean = false;
	isPricing: boolean = false;
	isReviews: boolean = false;
	isSettings: boolean = false;
	welcomeTitle: string = 'See how this page looks like for everyone';
	welcomeContent: string = 'You can see a preview of this page anytime using this button';
	viewToolTip: boolean = false;
	isSaveInProgress = false;
	isProfileLoaded = false;
	profilePage;
	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json'
	};

	constructor(
		injector: Injector,
		readonly groupProfilePagesService: GroupProfilePagesService,
		readonly fileService: FileService,
		readonly router: Router
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePagesService.isProfilePageData$.pipe(takeUntil(this.destroy$)).subscribe(profilePage => {
			if (profilePage) {
				this.profilePage = profilePage;
				this.initPage();
			}
		});
	}

	initPage() {
		this.activeRoute(null);
		this.groupProfilePagesService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 5));
		this.isProfileLoaded = true;
		console.log(this.isProfileLoaded);
	}

	navigateBackToProfilesListPage() {
		this.router.navigateByUrl(`/group-admin/campaigns/${this.profilePage.groupId}/profile-pages`);
	}

	activeRoute(element) {
		if (element) {
			this.recordButtonClick(element, null, null, null, this.profilePage);
		}
		const url = this.appService.currentPageUrl.getValue().split('/');
		if (url[6] === 'overview') {
			this.isOverview = true;
			this.isEdit = false;
			this.isPricing = false;
			this.isReviews = false;
			this.isSettings = false;
		} else if (url[6] === 'edit') {
			this.isOverview = false;
			this.isEdit = true;
			this.isPricing = false;
			this.isReviews = false;
			this.isSettings = false;
		} else if (url[6] === 'pricing') {
			this.isOverview = false;
			this.isEdit = false;
			this.isPricing = true;
			this.isReviews = false;
			this.isSettings = false;
		} else if (url[6] === 'reviews') {
			this.isOverview = false;
			this.isEdit = false;
			this.isPricing = false;
			this.isReviews = true;
			this.isSettings = false;
		} else if (url[6] === 'settings') {
			this.isOverview = false;
			this.isEdit = false;
			this.isPricing = false;
			this.isReviews = false;
			this.isSettings = true;
		}
	}

	closePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
	}
}
