import {ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GroupModel} from '@sharedModule/models/group.model';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';
import {Router} from '@angular/router';
import {UserModel} from '@sharedModule/models/user.model';
import {ButtonState} from '@sharedModule/enums/button-state.enum';
import {UserService} from '@sharedModule/services/user.service';
import {PublishService} from 'src/app/group-admin/_services/publish.service';

@Component({
	selector: 'app-group-card',
	templateUrl: './group-card.component.html',
	styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Input() installingGrp: GroupModel;
	@Input() user: UserModel;
	@Input() isInstalledGroup: GroupModel;
	@Output() openMobileInstallationOverlay = new EventEmitter<boolean>();
	@Output() groupInstallationEventEmitter = new EventEmitter();
	public insightsSVG =
		'M19.5002 5C18.1196 5 17.0002 6.11937 17.0002 7.5C17.0002 8.07062 17.199 8.59063 17.5209 9.01125L13.6965 ' +
		'15.045C13.5509 15.0188 13.4027 15 13.2502 15C13.0959 15 12.9465 15.0188 12.7996 15.045L10.9077 12.0719C11.1996 11.6631 11.3752 ' +
		'11.1656 11.3752 10.625C11.3752 9.24437 10.2559 8.125 8.87524 8.125C7.49462 8.125 6.37524 9.24437 6.37524 10.625C6.37524 11.1656 ' +
		'6.55087 11.6631 6.84274 12.0719L4.95087 15.045C4.80399 15.0188 4.65462 15 4.50024 15C3.11962 15 2.00024 16.1194 2.00024 17.5C2.00024 ' +
		'18.8806 3.11962 20 4.50024 20C5.88087 20 7.00024 18.8806 7.00024 17.5C7.00024 16.9594 6.82462 16.4619 6.53274 16.0531L8.42462 ' +
		'13.08C8.57149 13.1063 8.72087 13.125 8.87524 13.125C9.02962 13.125 9.17899 13.1063 9.32587 13.08L11.2177 16.0531C10.9259 16.4619 ' +
		'10.7502 16.9594 10.7502 17.5C10.7502 18.8806 11.8696 20 13.2502 20C14.6309 20 15.7502 18.8806 15.7502 17.5C15.7502 16.9581 15.5734 ' +
		'16.4594 15.2796 16.05L19.1377 9.96375C19.2571 9.98125 19.3765 10 19.5002 10C20.8809 10 22.0002 8.88063 22.0002 7.5C22.0002 6.11937 ' +
		'20.8809 5 19.5002 5Z';

	public schedulePostsSVG =
		'M6.61952 13.2599V16.6879C6.61952 16.9273 6.77552 17.1395 7.00652 17.2148C7.06427 17.2333 7.12352 17.2422 7.18201 17.2422C7.35751 17.2422 7.52701 17.1609 7.63501 17.016L9.66975 14.2873L6.61952 13.2599Z ' +
		'M17.8204 0.344988C17.6479 0.224515 17.4214 0.208254 17.2339 0.305076L0.358923 8.9895C0.159424 9.09224 0.041674 9.30214 0.058174 9.52313C0.0754239 9.74486 0.224673 9.93407 0.436923 10.0058L5.12816 11.586L15.1189 3.16761L7.3879 12.3465L15.2501 14.9947C15.3086 15.0139 15.3701 15.0243 15.4316 15.0243C15.5336 15.0243 15.6349 14.9969 15.7241 14.9437C15.8666 14.858 15.9634 14.7138 15.9881 14.552L18.0506 0.878618C18.0814 0.67167 17.9929 0.4662 17.8204 0.344988Z';

	constructor(
		injector: Injector,
		private readonly groupsService: GroupsService,
		private readonly userService: UserService,
		private readonly router: Router,
		private readonly publishService: PublishService,
		private readonly cdRef: ChangeDetectorRef
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	changeButtonStateToRefresh(group, element) {
		this.recordButtonClick(element, group);
		this.group.buttonState = ButtonState.Refresh;
	}

	addAppToGroupPopup(group, element) {
		this.groupInstallationEventEmitter.emit({showInstallationStepsPopup: true, group: group});
	}

	async updateGroup(group, element) {
		this.recordButtonClick(element, group);
		this.group.buttonState = ButtonState.Resuming;
		await this.groupsService.markGroupAsNotDead(this.group);
	}

	async changeBtnStateToRefreshing(group, element) {
		this.recordButtonClick(element, group);

		this.group.buttonState = ButtonState.Refreshing;

		this.user = await this.userService.getUser();
		await this.groupsService.triggerGroupStateCheck(group.id, this.user.id);
		setTimeout(async () => {
			const isGroupInstalled = await this.groupsService.checkForCSAppInstallationState(group.id, group.state);
			if (!isGroupInstalled) {
				this.group.buttonState = ButtonState.AddApp;
			}
			this.cdRef.detectChanges();
		}, 5000);
	}

	async navigateToGroupProfile(element, group: GroupModel) {
		this.recordButtonClick(element, group);
		this.router.navigateByUrl(`/group-admin/campaigns/${group.id}/profile-pages`);
	}

	async navigateToGroupDetails(group: GroupModel, pageFragment: string, element) {
		this.publishService.setSelectedGroup(group);
		this.appService.setGroupPageUrl(pageFragment);
		this.recordButtonClick(element, group);
		if (this.user.userType === UserTypeEnum.GroupMember) {
			this.router.navigateByUrl('/group-admin/group/' + group.id + '/' + pageFragment);
		}
	}

	openMobileOverlay(group, element) {
		this.recordButtonClick(element, group);
		this.recordDialogBoxShow('Mobile installation overlay', group);
		this.openMobileInstallationOverlay.emit(true);
	}
}
