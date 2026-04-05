const fs = require('fs');

const pathRu = 'public/assets/i18n/ru.json';
const pathEn = 'public/assets/i18n/en.json';

const ruAdd = {
  COUNT: 'Всего по фильтрам найдено',
  RESULTS: 'объявлений',
  SORT_NEWEST: 'Сначала новые',
  SORT_PRICE_ASC: 'Сначала дешевле',
  SORT_PRICE_DESC: 'Сначала дороже',
  SORT_RATING: 'По рейтингу',
  SORT_AREA: 'По площади',
  FILTERS: 'Фильтры',
  CLEAR: 'Сбросить',
  REGION: 'Регион',
  ALL: 'Все',
  STATUS: 'Тип предложения',
  RENT: 'Долгосрочная аренда',
  SALE: 'Купить',
  DAILY: 'Посуточно',
  TYPE: 'Тип недвижимости',
  APARTMENT: 'Квартира',
  HOUSE: 'Дом',
  OFFICE: 'Офис',
  LAND: 'Земельный участок',
  PRICE_RANGE: 'Ценовой диапазон (USD)',
  MIN: 'Мин',
  MAX: 'Макс',
  ROOMS: 'Количество комнат',
  ALL_ROOMS: 'Любое',
  LOCATION_PERKS: 'Преимущества расположения',
  METRO: 'Рядом с метро',
  MARKET: 'Магазин / Рынок',
  SCHOOL: 'Школа',
  HOSPITAL: 'Больница',
  APPLY: 'Применить',
  EMPTY_TITLE: 'Ничего не найдено',
  EMPTY_DESC: 'По вашим фильтрам пока нет активных объявлений. Попробуйте смягчить фильтры.',
  VIEW_ALL: 'Посмотреть всё',
};

const enAdd = {
  COUNT: 'Based on all filters found',
  RESULTS: 'listings',
  SORT_NEWEST: 'Newest added',
  SORT_PRICE_ASC: 'Price (Low-High)',
  SORT_PRICE_DESC: 'Price (High-Low)',
  SORT_RATING: 'By rating',
  SORT_AREA: 'By area',
  FILTERS: 'Filters',
  CLEAR: 'Clear',
  REGION: 'Region',
  ALL: 'All',
  STATUS: 'Listing status',
  RENT: 'Long-term rent',
  SALE: 'Buy',
  DAILY: 'Daily rent',
  TYPE: 'Property type',
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  OFFICE: 'Office',
  LAND: 'Land area',
  PRICE_RANGE: 'Price range (USD)',
  MIN: 'Min',
  MAX: 'Max',
  ROOMS: 'Number of rooms',
  ALL_ROOMS: 'Any',
  LOCATION_PERKS: 'Location perks',
  METRO: 'Near subway',
  MARKET: 'Market / Shop',
  SCHOOL: 'School',
  HOSPITAL: 'Hospital',
  APPLY: 'Apply',
  EMPTY_TITLE: 'Nothing found',
  EMPTY_DESC:
    'There are no active listings currently matching your filters. Please try softening your filters.',
  VIEW_ALL: 'View all',
};

let ruObj = JSON.parse(fs.readFileSync(pathRu, 'utf8'));
ruObj['LIST'] = ruAdd;
fs.writeFileSync(pathRu, JSON.stringify(ruObj, null, 2), 'utf8');

let enObj = JSON.parse(fs.readFileSync(pathEn, 'utf8'));
enObj['LIST'] = enAdd;
fs.writeFileSync(pathEn, JSON.stringify(enObj, null, 2), 'utf8');

// Now let's rewrite the property-list HTML exactly replacing the hardcoded text with translate pipes
let html = fs.readFileSync(
  'src/app/features/properties/property-list/property-list.component.html',
  'utf8',
);

html = html.replace("Barcha filterlar bo'yicha", "{{ 'LIST.COUNT' | translate }}");
html = html.replace("ta e'lon topildi", "{{ 'LIST.RESULTS' | translate }}");

html = html.replace("Yangi qo'shilganlar", "{{ 'LIST.SORT_NEWEST' | translate }}");
html = html.replace('Narx (Past-Yuqori)', "{{ 'LIST.SORT_PRICE_ASC' | translate }}");
html = html.replace('Narx (Yuqori-Past)', "{{ 'LIST.SORT_PRICE_DESC' | translate }}");
html = html.replace("Reyting bo'yicha", "{{ 'LIST.SORT_RATING' | translate }}");
html = html.replace("Maydon bo'yicha", "{{ 'LIST.SORT_AREA' | translate }}");

// Replace multiple occurrences of Filtrlash and Filtrlar safely
html = html.replaceAll('Filtrlar', "{{ 'LIST.FILTERS' | translate }}");
html = html.replaceAll('>Filtrlash<', ">{{ 'LIST.FILTERS' | translate }}<");

html = html.replaceAll('Tiklash', "{{ 'LIST.CLEAR' | translate }}");
html = html.replaceAll('Viloyat', "{{ 'LIST.REGION' | translate }}");
html = html.replaceAll('>Barchasi<', ">{{ 'LIST.ALL' | translate }}<");
html = html.replaceAll('Mulk holati', "{{ 'LIST.STATUS' | translate }}");
html = html.replaceAll('Uzoq muddatli ijara', "{{ 'LIST.RENT' | translate }}");
html = html.replaceAll('Sotib olish', "{{ 'LIST.SALE' | translate }}");
html = html.replaceAll('Kunlik ijara', "{{ 'LIST.DAILY' | translate }}");
html = html.replaceAll('Mulk turi', "{{ 'LIST.TYPE' | translate }}");
html = html.replaceAll('Kvartira', "{{ 'LIST.APARTMENT' | translate }}");
html = html.replaceAll('Hovli Uy', "{{ 'LIST.HOUSE' | translate }}");
html = html.replaceAll('Ofis', "{{ 'LIST.OFFICE' | translate }}");
html = html.replaceAll('Yer qismi', "{{ 'LIST.LAND' | translate }}");
html = html.replaceAll("Narx oralig'i (USD)", "{{ 'LIST.PRICE_RANGE' | translate }}");
html = html.replaceAll(
  '<mat-label>Min</mat-label>',
  "<mat-label>{{ 'LIST.MIN' | translate }}</mat-label>",
);
html = html.replaceAll(
  '<mat-label>Max</mat-label>',
  "<mat-label>{{ 'LIST.MAX' | translate }}</mat-label>",
);
html = html.replaceAll('Xonalar soni', "{{ 'LIST.ROOMS' | translate }}");
html = html.replaceAll('>Bari<', ">{{ 'LIST.ALL_ROOMS' | translate }}<");
html = html.replaceAll('Joylashuv qulayliklari', "{{ 'LIST.LOCATION_PERKS' | translate }}");
html = html.replaceAll('Metroga yaqin', "{{ 'LIST.METRO' | translate }}");
html = html.replaceAll('Bozor/Magazin', "{{ 'LIST.MARKET' | translate }}");
html = html.replaceAll('Maktab', "{{ 'LIST.SCHOOL' | translate }}");
html = html.replaceAll('Kasalxona', "{{ 'LIST.HOSPITAL' | translate }}");
html = html.replaceAll(">Qo'llash<", ">{{ 'LIST.APPLY' | translate }}<");

html = html.replaceAll('Hech nima topilmadi', "{{ 'LIST.EMPTY_TITLE' | translate }}");
html = html.replaceAll(
  "Kiritgan filterlaringiz bo'yicha hozircha aktiv e'lonlar mavjud emas. Filterni yumshatib qayta urinib ko'ring.",
  "{{ 'LIST.EMPTY_DESC' | translate }}",
);
html = html.replaceAll("Barchasini ko'rish", "{{ 'LIST.VIEW_ALL' | translate }}");

fs.writeFileSync(
  'src/app/features/properties/property-list/property-list.component.html',
  html,
  'utf8',
);
console.log('HTML updated successfully with translate pipes!');
