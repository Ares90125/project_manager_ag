import {Component, Input, OnInit} from '@angular/core';

import {TopPerformingPost} from '../top-performing-post/top-performing-post.component';

@Component({
	selector: 'app-unretrieved-posts',
	templateUrl: './unretrieved-posts.component.html',
	styleUrls: ['./unretrieved-posts.component.scss']
})
export class UnretrievedPostsComponent implements OnInit {
	@Input()
	postLists: TopPerformingPost[];

	constructor() {}

	// eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
	ngOnInit(): void {}
}
