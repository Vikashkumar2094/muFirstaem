import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  console.log('Building hero block...');
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
    console.log('Hero block built successfully.');
  } else {
    console.log('Hero block not built: missing h1 or picture.');
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  console.log('Loading fonts...');
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
    console.log('Fonts loaded and session storage updated.');
  } catch (e) {
    console.error('Error loading fonts or updating session storage:', e);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  console.log('Building auto blocks...');
  try {
    buildHeroBlock(main);
    console.log('Auto blocks built successfully.');
  } catch (error) {
    console.error('Auto Blocking failed:', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  console.log('Decorating main element...');
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  console.log('Main element decorated.');
}

/**
 * Loads embedded messaging script.
 */
function loadEmbeddedMessaging() {
  console.log('Loading embedded messaging scripts...');
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = `
    function initEmbeddedMessaging() {
      try {
        embeddedservice_bootstrap.settings.language = 'en_US';
        embeddedservice_bootstrap.init(
          '00D2t000000pdcQ',
          'MIAW',
          'https://wise-otter-721unq-dev-ed.trailblaze.my.site.com/ESWMIAW1734539716133',
          {
            scrt2URL: 'https://wise-otter-721unq-dev-ed.trailblaze.my.salesforce-scrt.com'
          }
        );
        console.log('Embedded Messaging initialized successfully.');
      } catch (err) {
        console.error('Error loading Embedded Messaging:', err);
      }
    }
  `;
  document.head.appendChild(script);

  const bootstrapScript = document.createElement('script');
  bootstrapScript.type = 'text/javascript';
  bootstrapScript.src = 'https://wise-otter-721unq-dev-ed.trailblaze.my.site.com/ESWMIAW1734539716133/assets/js/bootstrap.min.js';
  bootstrapScript.onload = () => {
    console.log('Bootstrap script loaded.');
    initEmbeddedMessaging();
  };
  document.head.appendChild(bootstrapScript);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  console.log('Starting eager load...');
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
    console.log('Eager load completed.');
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  console.log('Starting lazy load...');
  const main = doc.querySelector('main');
  await loadSections(main);
  console.log('Sections loaded in lazy phase.');

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) {
    element.scrollIntoView();
    console.log(`Scrolled to element with ID: ${hash.substring(1)}`);
  }

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  console.log('Header and footer loaded.');

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // Add embedded messaging script
  loadEmbeddedMessaging();
  console.log('Lazy load completed.');
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  console.log('Starting delayed load...');
  window.setTimeout(() => {
    import('./delayed.js')
      .then(() => console.log('Delayed script loaded.'))
      .catch((err) => console.error('Error loading delayed script:', err));
  }, 3000);
}

/**
 * Orchestrates the page loading process.
 */
async function loadPage() {
  console.log('Page loading initiated...');
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  console.log('Page loading completed.');
}

loadPage();
