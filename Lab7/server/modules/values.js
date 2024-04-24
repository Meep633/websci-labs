const PAGE_LIMIT = 50;
const CATEGORIES = ['business', 'entertainment', 'food', 'general', 'health', 'politics', 'science', 'sports', 'tech', 'travel'];
const LANGUAGES = ['ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'multi', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh'];
const LOCALES = ['ar', 'am', 'au', 'at', 'by', 'be', 'bo', 'br', 'bg', 'ca', 'cl', 'cn', 'co', 'hr', 'cz', 'ec', 'eg', 'fr', 'de', 'gr', 'hn', 'hk', 'in', 'id', 'ir', 'ie', 'il', 'it', 'jp', 'kr', 'mx', 'nl', 'nz', 'ni', 'pk', 'pa', 'pe', 'pl', 'pt', 'qa', 'ro', 'ru', 'sa', 'za', 'es', 'ch', 'sy', 'tw', 'th', 'tr', 'ua', 'gb', 'us', 'uy', 've'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const API_TIMEOUT = 1500; //time to wait between world geodata api calls (in ms)
const NUM_ARTICLES_LIMIT = 50;

module.exports = {
  PAGE_LIMIT,
  CATEGORIES,
  LANGUAGES,
  LOCALES,
  DAYS,
  API_TIMEOUT,
  NUM_ARTICLES_LIMIT
};