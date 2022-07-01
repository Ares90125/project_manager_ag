import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {Router} from '@angular/router';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {OwlOptions} from 'ngx-owl-carousel-o';

@Component({
	selector: 'app-no-groups',
	templateUrl: './no-groups.component.html',
	styleUrls: ['./no-groups.component.scss']
})
export class NoGroupsComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	isLoading = true;
	isGroupAdmin = true;
	isAddMoreButtonClicked = false;
	showHowItWork = false;
	isGroupPermissionGiven;
	isFBGroupAdmin;
	showSpinnerOnAddGroupBtn = false;

	constructor(
		injector: Injector,
		private readonly groupsService: GroupsService,
		private readonly userService: UserService,
		private readonly router: Router,
		private readonly fbService: FacebookService
	) {
		super(injector);
	}

	noGroupSliderOption: OwlOptions = {
		items: 1,
		navSpeed: 700,
		autoplay: true,
		navText: ['', '']
	};

	async ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Group Admin No Groups', 'Group Admin No Groups');
		this.headerService.hideNotificationIconFromHeader();

		this.groupsService.init();
		this.subscriptionsToDestroy.concat([
			this.userService.currentUser$.subscribe(usr => (this.user = usr)),
			this.groupsService.groups.subscribe(async groups => {
				if (groups === null) {
					return null;
				}

				if (groups.length > 0) {
					this.router.navigateByUrl('/group-admin/manage');
					return;
				}
				this.isGroupPermissionGiven = await this.fbService.checkIfPermissionIsGranted(
					FacebookPermissionEnum.GroupPermission
				);

				this.isFBGroupAdmin = null;
				this.isAddMoreButtonClicked = !!this.isGroupPermissionGiven;
				this.isLoading = false;
			})
		]);
	}

	isGroupAdminBtnClick(value, element) {
		this.recordButtonClick(element);
		this.isGroupAdmin = value;
	}

	isFBGroupAdminBtnClick(value, element) {
		this.recordButtonClick(element);
		this.isFBGroupAdmin = value;
		this.isGroupAdmin = value;
	}

	howItWorkBtnClick(element) {
		this.recordButtonClick(element);
		this.recordDialogBoxShow('How it works');
		this.showHowItWork = true;
	}

	convosightBlogClick(element) {
		this.recordButtonClick(element);
	}

	FBShareBtnClick(element) {
		this.recordButtonClick(element);
	}
	async addMoreButtonClicked(element) {
		this.showSpinnerOnAddGroupBtn = true;
		this.recordButtonClick(element);
		await this.fbService.revokeAccessPermission(FacebookPermissionEnum.GroupPermission);
		await this.fbService.reAskAccessPermission(
			FacebookPermissionEnum.GroupPermission,
			`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.GroupPermission})}`
		);
	}

	async closeHowAddToApp(event) {
		this.showHowItWork = false;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
