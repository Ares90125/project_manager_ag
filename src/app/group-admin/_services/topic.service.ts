import {TreeviewItem} from 'ngx-treeview';
import {Injectable} from '@angular/core';

@Injectable()
export class TopicService {
	getTopicList(): TreeviewItem[] {
		const BabyCareCat = new TreeviewItem({
			text: 'Baby Care',
			value: 'Baby Care',
			children: [
				{text: 'Baby Skin', value: 'Baby Skin'},
				{text: 'Baby Hygeine', value: 'Baby Hygeine'},
				{text: 'Baby Oral Care', value: 'Baby Oral Care'}
			]
		});
		const BabyGearCat = new TreeviewItem({
			text: 'Baby Gear',
			value: 'Baby Gear',
			children: [
				{text: 'Gears', value: 'Gears'},
				{text: 'Feeding', value: 'Feeding'}
			]
		});
		const DevelopmentCat = new TreeviewItem({
			text: 'Development',
			value: 'Development',
			children: [
				{text: 'Toys', value: 'Toys'},
				{text: 'Books', value: 'Books'},
				{text: 'Training', value: 'Training'}
			]
		});
		const DiaperingCat = new TreeviewItem({
			text: 'Diapering',
			value: 'Diapering',
			children: [
				{text: 'Diapers', value: 'Diapers'},
				{text: 'Wipes', value: 'Wipes'}
			]
		});
		const DigestionCat = new TreeviewItem({
			text: 'Digestion',
			value: 'Digestion',
			children: [{text: 'Digestion', value: 'Digestion'}]
		});
		const FeedingCat = new TreeviewItem({
			text: 'Feeding',
			value: 'Feeding',
			children: [
				{text: 'Infant Non Solid Nutrition', value: 'Infant Non Solid Nutrition'},
				{text: 'Breastfeeding', value: 'Breastfeeding'},
				{text: 'DHA', value: 'DHA'}
			]
		});
		const ImmunityCat = new TreeviewItem({
			text: 'Immunity',
			value: 'Immunity',
			children: [
				{text: 'Immunity', value: 'Immunity'},
				{text: 'Cold & Cough', value: 'Cold & Cough'}
			]
		});
		const NutritionCat = new TreeviewItem({
			text: 'Nutrition',
			value: 'Nutrition',
			children: [
				{text: 'Infant nutrition', value: 'Infant nutrition'},
				{text: 'Toddler nutrition', value: 'Toddler nutrition'}
			]
		});
		const PregnancyCat = new TreeviewItem({
			text: 'Pregnancy',
			value: 'Pregnancy',
			children: [{text: 'Pregnancy', value: 'Pregnancy'}]
		});
		const SleepCat = new TreeviewItem({
			text: 'Sleep',
			value: 'Sleep',
			children: [{text: 'Baby Sleep', value: 'Baby Sleep'}]
		});
		const LifestyleCat = new TreeviewItem({
			text: "Women's Lifestyle",
			value: "Women's Lifestyle",
			children: [
				{text: 'Women Hygiene', value: 'Women Hygiene'},
				{text: 'Women Skin & Beauty', value: 'Women Skin & Beauty'},
				{text: 'Women Health Issues', value: 'Women Health Issues'},
				{text: 'Women Nutrition', value: 'Women Nutrition'},
				{text: 'Women Hair', value: 'Women Hair'},
				{text: 'Women Fashion', value: 'Women Fashion'},
				{text: 'Women Fitness', value: 'Women Fitness'}
			]
		});

		const OthersCat = new TreeviewItem({
			text: 'Others',
			value: 'Others'
		});
		return [
			BabyCareCat,
			BabyGearCat,
			DevelopmentCat,
			DiaperingCat,
			DigestionCat,
			FeedingCat,
			ImmunityCat,
			NutritionCat,
			PregnancyCat,
			SleepCat,
			LifestyleCat,
			OthersCat
		];
	}

	getTopicsObject(): {} {
		const categoriesMaster = {
			'Women Hygiene': "Women's Lifestyle",
			'Women Skin & Beauty': "Women's Lifestyle",
			'Women Health Issues': "Women's Lifestyle",
			'Women Nutrition': "Women's Lifestyle",
			'Women Hair': "Women's Lifestyle",
			'Women Fashion': "Women's Lifestyle",
			'Women Fitness': "Women's Lifestyle",
			'Baby Skin': 'Baby Care',
			'Baby Hygeine': 'Baby Care',
			'Baby Oral Care': 'Baby Care',
			'Infant nutrition': 'Nutrition',
			'Toddler nutrition': 'Nutrition',
			Diapers: 'Diapering',
			Wipes: 'Diapering',
			Gears: 'Baby Gear',
			Feeding: 'Baby Gear',
			'Infant Non Solid Nutrition': 'Feeding',
			Breastfeeding: 'Feeding',
			DHA: 'Feeding',
			'Baby Sleep': 'Sleep',
			Toys: 'Development',
			Books: 'Development',
			Training: 'Development',
			Pregnancy: 'Pregnancy',
			Immunity: 'Immunity',
			'Cold & Cough': 'Immunity',
			Digestion: 'Digestion',
			null: 'Others'
		};

		return categoriesMaster;
	}
}
