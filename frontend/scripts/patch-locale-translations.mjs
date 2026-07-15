import fs from 'fs';
import path from 'path';

const base = 'src/i18n/locales';

const mapPatches = {
  de: {
    title: 'Lebendiges europäisches Business-Netzwerk',
    hubLabel: 'Berlin-Hub',
    'layers.jobs': 'Stellen',
    'live.jobs': 'Stellen',
    'live.transport': 'Transport',
    'live.marketplace': 'Marktplatz',
    'panel.jobs': 'Stellen',
    'panel.transport': 'Transport',
    'panel.marketplace': 'Marktplatz',
    'panel.tabs.jobs': 'Stellen',
    'panel.tabs.transport': 'Transport',
    'panel.tabs.marketplace': 'Marktplatz',
    'panel.tabs.services': 'Services',
    'panel.tabs.analytics': 'Analytik',
    'operating.businessLayer': 'Business',
    'operating.marketplace': 'Marktplatz',
    'businessLayers.marketplace': 'Marktplatz',
    'businessLayers.transport': 'Transport',
    'businessLayers.jobs': 'Stellen',
    'businessLayers.businessServices': 'Business-Services',
    'businessLayers.events': 'Events',
    'businessLayers.investments': 'Investments',
    'businessLayers.startups': 'Startups',
    'mobile.transport': 'Transport',
    'mobile.jobs': 'Stellen',
    'mobile.layerGroups.business.marketplace': 'Marktplatz',
    'mobile.layerGroups.business.jobs': 'Stellen',
    'mobile.moreCategories.marketplace': 'Marktplatz',
    'mobile.moreCategories.events': 'Events',
    'mobile.moreCategories.investments': 'Investments',
    'mobile.moreCategories.startups': 'Startups',
    'a11y.showCommandPanel': 'Kommandopanel anzeigen',
    'a11y.hideCommandPanel': 'Kommandopanel ausblenden',
  },
  uk: {
    title: 'Жива європейська бізнес-мережа',
    hubLabel: 'Хаб Берлін',
    'layers.jobs': 'Вакансії',
    'live.jobs': 'Вакансії',
    'live.transport': 'Транспорт',
    'live.marketplace': 'Маркетплейс',
    'panel.jobs': 'Вакансії',
    'panel.transport': 'Транспорт',
    'panel.marketplace': 'Маркетплейс',
    'panel.aiScore': 'Оцінка ШІ',
    'panel.tabs.jobs': 'Вакансії',
    'panel.tabs.transport': 'Транспорт',
    'panel.tabs.marketplace': 'Маркетплейс',
    'panel.tabs.services': 'Послуги',
    'panel.tabs.analytics': 'Аналітика',
    'operating.businessLayer': 'Бізнес',
    'operating.marketplace': 'Маркетплейс',
    'businessLayers.marketplace': 'Маркетплейс',
    'businessLayers.transport': 'Транспорт',
    'businessLayers.jobs': 'Вакансії',
    'businessLayers.businessServices': 'Бізнес-послуги',
    'businessLayers.events': 'Події',
    'businessLayers.investments': 'Інвестиції',
    'businessLayers.startups': 'Стартапи',
    'mobile.transport': 'Транспорт',
    'mobile.jobs': 'Вакансії',
    'mobile.layerGroups.business.marketplace': 'Маркетплейс',
    'mobile.layerGroups.business.jobs': 'Вакансії',
    'mobile.moreCategories.marketplace': 'Маркетплейс',
    'mobile.moreCategories.events': 'Події',
    'mobile.moreCategories.investments': 'Інвестиції',
    'mobile.moreCategories.startups': 'Стартапи',
    'tooltip.businessScore': 'Бізнес-рейтинг {{score}}',
    'tooltip.aiScore': 'Оцінка ШІ {{score}}',
    'germany.tech': 'Технології',
    'germany.businessIndex': 'Бізнес-індекс',
    'a11y.showCommandPanel': 'Показати панель керування',
    'a11y.hideCommandPanel': 'Приховати панель керування',
  },
  ru: {
    title: 'Живая европейская бизнес-сеть',
    hubLabel: 'Хаб Берлин',
    'layers.jobs': 'Вакансии',
    'live.jobs': 'Вакансии',
    'live.transport': 'Транспорт',
    'live.marketplace': 'Маркетплейс',
    'panel.jobs': 'Вакансии',
    'panel.transport': 'Транспорт',
    'panel.marketplace': 'Маркетплейс',
    'panel.aiScore': 'ИИ-рейтинг',
    'panel.tabs.jobs': 'Вакансии',
    'panel.tabs.transport': 'Транспорт',
    'panel.tabs.marketplace': 'Маркетплейс',
    'panel.tabs.services': 'Услуги',
    'panel.tabs.analytics': 'Аналитика',
    'operating.businessLayer': 'Бизнес',
    'operating.marketplace': 'Маркетплейс',
    'businessLayers.marketplace': 'Маркетплейс',
    'businessLayers.transport': 'Транспорт',
    'businessLayers.jobs': 'Вакансии',
    'businessLayers.businessServices': 'Бизнес-услуги',
    'businessLayers.events': 'События',
    'businessLayers.investments': 'Инвестиции',
    'businessLayers.startups': 'Стартапы',
    'mobile.transport': 'Транспорт',
    'mobile.jobs': 'Вакансии',
    'mobile.layerGroups.business.marketplace': 'Маркетплейс',
    'mobile.layerGroups.business.jobs': 'Вакансии',
    'mobile.moreCategories.marketplace': 'Маркетплейс',
    'mobile.moreCategories.events': 'События',
    'mobile.moreCategories.investments': 'Инвестиции',
    'mobile.moreCategories.startups': 'Стартапы',
    'tooltip.businessScore': 'Бизнес-рейтинг {{score}}',
    'tooltip.aiScore': 'ИИ-рейтинг {{score}}',
    'germany.tech': 'Технологии',
    'germany.businessIndex': 'Бизнес-индекс',
    'a11y.showCommandPanel': 'Показать панель управления',
    'a11y.hideCommandPanel': 'Скрыть панель управления',
  },
  pl: {
    title: 'Żywa europejska sieć biznesowa',
    hubLabel: 'Hub Berlin',
    'layers.jobs': 'Oferty pracy',
    'live.jobs': 'Oferty pracy',
    'live.transport': 'Transport',
    'live.marketplace': 'Marketplace',
    'panel.jobs': 'Oferty pracy',
    'panel.transport': 'Transport',
    'panel.marketplace': 'Marketplace',
    'panel.aiScore': 'Wynik AI',
    'panel.tabs.jobs': 'Oferty pracy',
    'panel.tabs.transport': 'Transport',
    'panel.tabs.marketplace': 'Marketplace',
    'panel.tabs.services': 'Usługi',
    'panel.tabs.analytics': 'Analityka',
    'routePanel.hours': 'h',
    'operating.businessLayer': 'Biznes',
    'operating.marketplace': 'Marketplace',
    'businessLayers.marketplace': 'Marketplace',
    'businessLayers.transport': 'Transport',
    'businessLayers.jobs': 'Oferty pracy',
    'businessLayers.businessServices': 'Usługi biznesowe',
    'businessLayers.events': 'Wydarzenia',
    'businessLayers.investments': 'Inwestycje',
    'businessLayers.startups': 'Startupy',
    'mobile.transport': 'Transport',
    'mobile.jobs': 'Oferty pracy',
    'mobile.layerGroups.business.marketplace': 'Marketplace',
    'mobile.layerGroups.business.jobs': 'Oferty pracy',
    'mobile.moreCategories.marketplace': 'Marketplace',
    'mobile.moreCategories.events': 'Wydarzenia',
    'mobile.moreCategories.investments': 'Inwestycje',
    'mobile.moreCategories.startups': 'Startupy',
    'tooltip.businessScore': 'Wynik biznesowy {{score}}',
    'tooltip.aiScore': 'Wynik AI {{score}}',
    'germany.tech': 'Technologie',
    'germany.businessIndex': 'Indeks biznesowy',
    'a11y.showCommandPanel': 'Pokaż panel sterowania',
    'a11y.hideCommandPanel': 'Ukryj panel sterowania',
  },
};

const commonPatches = {
  de: {
    'app.osTagline': 'Business OS',
    'sectionEyebrows.dashboard': 'Dashboard',
    'sectionEyebrows.modules': 'Module',
    'sectionEyebrows.stats': 'Live',
    'hero.ctaButtons.marketplace': 'Marktplatz',
    'hero.ctaButtons.transport': 'Transport',
    'hero.ctaButtons.jobs': 'Stellen',
    'dashboard.marketplace': 'Marktplatz',
    'dashboard.transport': 'Transport',
    'dashboard.jobs': 'Stellen',
    'dashboard.analytics': 'Analytik',
    'nav.dashboard': 'Dashboard',
  },
  uk: {
    'app.osTagline': 'Business OS',
    'sectionEyebrows.dashboard': 'Панель',
    'sectionEyebrows.modules': 'Модулі',
    'sectionEyebrows.stats': 'Live',
    'hero.ctaButtons.marketplace': 'Маркетплейс',
    'hero.ctaButtons.transport': 'Транспорт',
    'hero.ctaButtons.jobs': 'Вакансії',
    'dashboard.marketplace': 'Маркетплейс',
    'dashboard.transport': 'Транспорт',
    'dashboard.jobs': 'Вакансії',
    'dashboard.analytics': 'Аналітика',
    'nav.dashboard': 'Панель',
  },
  ru: {
    'app.osTagline': 'Business OS',
    'sectionEyebrows.dashboard': 'Панель',
    'sectionEyebrows.modules': 'Модули',
    'sectionEyebrows.stats': 'Live',
    'hero.ctaButtons.marketplace': 'Маркетплейс',
    'hero.ctaButtons.transport': 'Транспорт',
    'hero.ctaButtons.jobs': 'Вакансии',
    'dashboard.marketplace': 'Маркетплейс',
    'dashboard.transport': 'Транспорт',
    'dashboard.jobs': 'Вакансии',
    'dashboard.analytics': 'Аналитика',
    'nav.dashboard': 'Панель',
  },
  pl: {
    'app.osTagline': 'Business OS',
    'sectionEyebrows.dashboard': 'Panel',
    'sectionEyebrows.modules': 'Moduły',
    'sectionEyebrows.stats': 'Live',
    'hero.ctaButtons.marketplace': 'Marketplace',
    'hero.ctaButtons.transport': 'Transport',
    'hero.ctaButtons.jobs': 'Oferty pracy',
    'dashboard.marketplace': 'Marketplace',
    'dashboard.transport': 'Transport',
    'dashboard.jobs': 'Oferty pracy',
    'dashboard.analytics': 'Analityka',
    'nav.dashboard': 'Panel',
  },
  en: {
    'app.osTagline': 'Business OS',
    'sectionEyebrows.dashboard': 'Dashboard',
    'sectionEyebrows.modules': 'Modules',
    'sectionEyebrows.stats': 'Live',
    'a11y.showCommandPanel': 'Show command panel',
    'a11y.hideCommandPanel': 'Hide command panel',
  },
};

const workspacePatches = {
  de: { 'metrics.marketplace': 'Marktplatz', 'actions.marketplace': 'Marktplatz öffnen', companies: { marketplace: undefined } },
  uk: { marketplace: 'Маркетплейс', 'metrics.marketplace': 'Маркетплейс', 'actions.marketplace': 'Відкрити маркетплейс' },
  ru: { marketplace: 'Маркетплейс', 'metrics.marketplace': 'Маркетплейс', 'actions.marketplace': 'Открыть маркетплейс' },
  pl: { marketplace: 'Marketplace', 'metrics.marketplace': 'Marketplace', 'actions.marketplace': 'Otwórz marketplace' },
};

function setPath(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur[parts[i]] ??= {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyPatches(lang, file, patches) {
  const p = path.join(base, lang, `${file}.json`);
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [key, value] of Object.entries(patches)) {
    setPath(json, key, value);
  }
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

for (const [lang, patches] of Object.entries(mapPatches)) {
  applyPatches(lang, 'map', patches);
}
for (const [lang, patches] of Object.entries(commonPatches)) {
  applyPatches(lang, 'common', patches);
}
for (const [lang, patches] of Object.entries(workspacePatches)) {
  if (lang === 'de') {
    const p = path.join(base, 'de', 'workspace.json');
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    json.metrics.marketplace = 'Marktplatz';
    json.actions.marketplace = 'Marktplatz öffnen';
    fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    continue;
  }
  applyPatches(lang, 'workspace', patches);
}

// EN map a11y keys
applyPatches('en', 'map', {
  'a11y.showCommandPanel': 'Show command panel',
  'a11y.hideCommandPanel': 'Hide command panel',
});

console.log('Locale patches applied.');
