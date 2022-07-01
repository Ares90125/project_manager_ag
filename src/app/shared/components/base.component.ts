import {Injector} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {Subject, Subscription} from 'rxjs';
import {AlertService} from 'src/app/shared/services/alert.service';
import {LoggerService} from 'src/app/shared/services/logger.service';
import {v4 as uuid} from 'uuid';
import {DeviceFormFactor} from '../enums/device-form-factor.enum';
import {AppService} from '../services/app.service';
import {HeaderService} from '@sharedModule/services/header.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';

declare var window: any;

export class BaseComponent {
	public renderedOn: string;
	public isOnIOS = false;
	public pluralWordMapping: {};
	public titleService: Title;
	public appService: AppService;
	protected logger: LoggerService;
	protected alert: AlertService;
	public headerService: HeaderService;
	public metaService: Meta;
	protected subscriptionsToDestroy: Subscription[] = [];
	protected container: any;
	public destroy$ = new Subject<void>();

	constructor(private _injector: Injector) {
		this.titleService = _injector.get(Title);
		this.logger = _injector.get(LoggerService);
		this.alert = _injector.get(AlertService);
		this.appService = _injector.get(AppService);
		this.headerService = _injector.get(HeaderService);
		this.metaService = _injector.get(Meta);
	}

	_ngOnInit(): void {
		this.detectFormFactor();
		this.detectIsOnIOSDevice();
		this.setupPluralWords();
		this.headerService.init();
	}

	_ngOnDestroy(): void {
		this.destroy$.next();
		this.subscriptionsToDestroy.forEach((sub: Subscription) => {
			sub.unsubscribe();
		});
	}

	enableScrolling() {
		document.body.style.overflow = 'visible';
		document.body.style.touchAction = 'auto';
		document.body.style.position = '';
	}

	disableScrolling() {
		document.body.style.overflow = 'hidden';
		document.body.style.touchAction = 'none';
		document.body.style.position = 'relative';
	}

	highlightKeyword(keywordList, containerId) {
		const list = Array.isArray(keywordList) ? keywordList : keywordList.split('|');
		list.sort((a, b) => {
			return b.length - a.length;
		});
		let keywords = list.join('|');
		keywords = keywords.replace('f**|', '');
		keywords = keywords.replace('f**', '');
		const self = this;
		const pattern = new RegExp('\\b(' + keywords + ')\\b', 'gi');
		const replaceWith = '<span class="highlight-text">$1</span>'; // wrap in the tag you want

		setTimeout(function () {
			if (!self.container) {
				self.container = $('#' + containerId);
			}
			self.container.find('.post-title').each(function () {
				$(this).html($(this).html().replace(pattern, replaceWith));
			});
		}, 500);
	}

	public randomUuid() {
		return uuid();
	}

	public async recordButtonClick(element, group = null, buttonLabel = null, extra = null, groupProfile = null) {
		let segmentData = {};
		if (!element && !group) {
			return;
		}

		if (element) {
			if (buttonLabel) {
				segmentData['parent_label'] = element.currentTarget.dataset.csParentLabel;
				segmentData['button_label'] = buttonLabel;
			} else {
				segmentData['button_cs_id'] = element.currentTarget.dataset.csId;
				segmentData['button_label'] = element.currentTarget.dataset.csLabel;
			}
			segmentData['source'] = element.currentTarget.dataset.csSource;
		}

		if (group) {
			segmentData = await this.getGroupsSegment(segmentData, group);
		}

		if (extra) {
			const flattenObj = await this.flattenObject(extra);
			segmentData = Object.assign(segmentData, flattenObj);
		}

		if (groupProfile) {
			segmentData = await this.getGroupProfileSegement(segmentData, groupProfile);
		}

		this.logger.info('button_clicked', segmentData, 'BaseComponent', 'recordButtonClick', LoggerCategory.ClickStream);
	}

	public async recordToggleClicked(element, group = null, extra = null, groupProfile = null) {
		let segmentData = {};
		if (!element && !group) {
			return;
		}

		if (element) {
			segmentData['button_cs_id'] = element.currentTarget.dataset.csId;
			segmentData['button_label'] = element.currentTarget.dataset.csLabel;
			segmentData['source'] = element.currentTarget.dataset.csSource;
			segmentData['toggle_status'] = element.currentTarget.dataset.csToggleStatus;
		}

		if (group) {
			segmentData = await this.getGroupsSegment(segmentData, group);
		}

		if (extra) {
			const flattenObj = await this.flattenObject(extra);
			segmentData = Object.assign(segmentData, flattenObj);
		}

		if (groupProfile) {
			segmentData = await this.getGroupProfileSegement(segmentData, groupProfile);
		}

		this.logger.info('toggle_clicked', segmentData, 'BaseComponent', 'recordToggleClicked', LoggerCategory.ClickStream);
	}

	public async recordDialogBoxShow(dialogName: string, group = null, extra = null, groupProfile = null) {
		let segmentData = {};

		segmentData['dialog_box_name'] = dialogName;

		if (group) {
			segmentData = await this.getGroupsSegment(segmentData, group);
		}

		if (extra) {
			const flattenObj = await this.flattenObject(extra);
			segmentData = Object.assign(segmentData, flattenObj);
		}

		if (groupProfile) {
			segmentData = await this.getGroupProfileSegement(segmentData, groupProfile);
		}

		this.logger.info('dialog_box_shown', segmentData, 'BaseComponent', 'recordButtonClick', LoggerCategory.ClickStream);
	}

	public async tooltipHovered(element, group = null, extra = null, groupProfile = null) {
		let segmentData = {};
		if (!element && !group) {
			return;
		}

		if (element) {
			segmentData['parent_label'] = element.currentTarget.dataset.csParentLabel;
			segmentData['button_label'] = element.currentTarget.dataset.csLabel;
			segmentData['source'] = element.currentTarget.dataset.csSource;
		}

		if (group) {
			segmentData = await this.getGroupsSegment(segmentData, group);
		}

		if (extra) {
			const flattenObj = await this.flattenObject(extra);
			segmentData = Object.assign(segmentData, flattenObj);
		}

		if (groupProfile) {
			segmentData = await this.getGroupProfileSegement(segmentData, groupProfile);
		}

		this.logger.info('tooltip_hovered', segmentData, 'BaseComponent', 'recordButtonClick', LoggerCategory.ClickStream);
	}

	public async flattenObject(obj) {
		// Flat deep nested object into simple object
		return Object.assign(
			{},
			...(function _flatten(o) {
				return [].concat(...Object.keys(o).map(k => (typeof o[k] === 'object' ? _flatten(o[k]) : {[k]: o[k]})));
			})(obj)
		);
	}

	public async getGroupsSegment(segmentData, group) {
		segmentData['group_id'] = group.id;
		segmentData['group_name'] = group.name;
		segmentData['group_member_count'] = group.memberCount;
		segmentData['group_country'] = group.country;
		segmentData['group_business_category'] = group.businessCategory;
		segmentData['group_acquired_date'] = group.createdAtUTC;
		segmentData['group_fb_id'] = group.fbGroupId;

		return segmentData;
	}

	private getGroupProfileSegement(segmentData, groupProfile) {
		segmentData['default_profile'] = groupProfile.isDefaultProfile;
		segmentData['internal_page'] = true;
		segmentData['profile_name'] = groupProfile.name;
		segmentData['profile_id'] = groupProfile.id;
		segmentData['profile_group_id'] = groupProfile.groupId;
		segmentData['profile_group_name'] = groupProfile.groupName;
		segmentData['profile_group_category'] = groupProfile.category;
		segmentData['profile_is_published'] = groupProfile.isPublished;
		segmentData['profile_group_country'] = groupProfile.country;
		return segmentData;
	}

	protected setPageTitle(title: string, name: string, data = {}) {
		this.titleService.setTitle(title);
		this.appService.currentPageName.next(name);
		this.setPageNameMetaTag(name);
		this.logger.trackPage(name, data);
	}

	protected setPageNameMetaTag(name: string) {
		this.metaService.addTag({name: 'page_name', content: name});
	}

	private detectFormFactor() {
		if (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)/i)) {
			this.renderedOn = DeviceFormFactor.Mobile;
		} else {
			this.renderedOn = DeviceFormFactor.Desktop;
		}
	}

	private detectIsOnIOSDevice() {
		if (
			navigator.userAgent.match(/iPad/i) ||
			navigator.userAgent.match(/iPhone/i) ||
			navigator.userAgent.match(/CriOS/i) ||
			navigator.userAgent.match(/ipod/i)
		) {
			this.isOnIOS = true;
		} else {
			this.isOnIOS = false;
		}
	}

	private setupPluralWords() {
		this.pluralWordMapping = {
			member: {
				'=0': 'Members',
				'=1': 'Member',
				other: 'Members'
			}
		};
	}

	public isFacebookApp() {
		var ua = navigator.userAgent || navigator.vendor || window.opera;
		return ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
	}
}
