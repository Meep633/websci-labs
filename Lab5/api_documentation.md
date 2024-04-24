All GET requests expect parameters to be passed in through the query. 

## GET /
Returns home page

---------------------------------------------------------------------------------------------------------------------------
# News
---------------------------------------------------------------------------------------------------------------------------

## GET /news
Returns articles from a given category

  #### Parameters:
  - locale (optional): What country's news you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - category (optional): What category of news you want<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel<br>
  Default = general
  - limit (optional): How many articles you want to get in one request<br> 
  1 <= limit <= 50<br>
  Default = 20
  - page (optional): Which page of articles you want (max page dependent on size of news.json, so if you input an invalid page, the response will tell you what page numbers are valid)<br>
  Default = 1
  
  #### Important response data:
  - uuid: Unique id of an article (use this for GET /news/\<uuid\>)
  - title: Article title
  - description: Article description
  - url: Article url
  - image_url: Article thumbnail url

  #### Example: 
  GET /news?locale=nz&category=business&limit=10&page=2

---------------------------------------------------------------------------------------------------------------------------

## GET /news/\<uuid\>
Returns article with uuid \<uuid\> from given locale and category

  #### Parameters:
  - locale (optional): What country's news you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - category (optional): What category of news the article you want is in<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel<br>
  Default = general
  
  #### Important response data:
  - Same as GET /news

  #### Example: 
  GET /news/\<uuid\>?locale=gb&category=politics

---------------------------------------------------------------------------------------------------------------------------

## POST /news
Creates a new article with the given data

  #### Parameters:
  - title (optional): Article title
  - description (optional): Article description
  - keywords (optional): Comma-separated list of keywords describing article
  - snippet (optional): First 60 words of article
  - url (optional): Article url
  - image_url (optional): Article thumbnail url
  - language (optional): Article language<br>
  Valid languages: ar, bg, bn, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hr, hu, id, it, ja, ko, lt, multi, nl, no, pl, pt, ro, ru, sk, sv, ta, th, tr, uk, vi, zh<br>
  Default = en
  - published_at (optional): Time at which article was published<br>
  Must be in format: YYYY-MM-DD<br>
  Default = current date
  - source (optional): Source url of article
  - categories (optional): Comma-separated list of categories that article should be part of<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel<br>
  Default = general
  - locale (optional): Place where article was written<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us

  #### Important response data:
  - uuid: Unique id of the created article
  - locale: Locale of article
  - categories: Categories the article is in
  - article: Data about the article that you made (same data that GET /news gives)

  #### Example:
  POST /news<br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,food,politics,health",<br>
  &nbsp;&nbsp;  locale: "fr"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## POST /news/latest
Add new articles for a given locale's category.

  #### Parameters:
  - locale (optional): Locale whose articles you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - category (optional): Category of articles you want<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel<br>
  Default = general
  - num_articles (optional): Number of articles you want<br>
  1 <= num_articles <= 12<br>
  Default = 3

  #### Important response data:
  - articles: list of articles added<br>
  Note: A multiple of 3 articles is always given, so if num_articles isn't a multiple of 3, you will get 1-2 extra articles.<br>
  Another Note: You will likely get a lot of errors with countries that aren't super populated (us, gb, in, etc.) when getting categories that aren't general since thenewsapi doesn't seem to offer news in other categories for these countries.

---------------------------------------------------------------------------------------------------------------------------

## PUT /news
Updates all articles in all categories with the given data

  #### Parameters:
  - Same as POST /news (except locale and categories)
  - locale (optional): Place where article was written<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve, same (stay in current locale)<br>
  Default = same
  - categories (optional): Comma-separated list of categories that all articles should be placed in<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel, same (stay in current category, can't use any other category if using this)<br>
  Default = same

  #### Important response data:
  - message: Tells you if update was successful

  #### Example:
  PUT /news<br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,health"<br>
  &nbsp;&nbsp;  locale: "fr"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## PUT /news/\<uuid\>
Updates article with uuid \<uuid\> with the given data

  #### Parameters:
  - Same as PUT /news (except locale and categories)
  - locale (optional): Locale that article should be placed in<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve, same (stay in current locale)<br>
  Default = same
  - categories (optional): Categories that article should be placed in<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel, same (stay in current category, can't use any other category if using this)<br>
  Default = same
  - old_locale (optional): Locale that article you want is in<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - old_categories (optional): Comma-separated list of categories the article you want is in (article could be in multiple categories)<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel<br>
  Default = general

  #### Important resposne data:
  - uuid: Unique id of the created article
  - categories: Categories the article is in
  - locale: Locale the article is in
  - article: Data about the article that you made (same data that GET /news gives)

  #### Example:
  PUT /news/\<uuid\><br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,health"<br>
  &nbsp;&nbsp;  locale: "fr",<br>
  &nbsp;&nbsp;  old_categories: "sports,politics"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## DELETE /news/\<uuid\>
Deletes article with uuid \<uuid\> from the given locale and categories

  #### Parameters:
  - locale (optional): Locale that you want to delete article from<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - categories (optional): Categories that you want to delete article from. If a category is given that the article isn't in, that category won't be affected<br>
  Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel, all (all categories, if using all, you can't use any other category)<br>
  Default = all categories

  #### Important response data:
  - affected_locale: Locale that article was deleted from
  - affected_categories: Comma-separated list of categories that article was deleted from

  #### Example:
  DELETE /news/\<uuid\><br>
  data: {<br>
  &nbsp;&nbsp;  categories: sports,entertainment<br>
  }

---------------------------------------------------------------------------------------------------------------------------
# Forex
---------------------------------------------------------------------------------------------------------------------------

## GET /forex
Get forex rates from one currency to another

  #### Parameters:
  - from_locale (optional): Locale's rate that you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - to_locale (optional): Locale that you want to convert to<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = gb

  #### Important response data:
  - from_currency: Currency of from_locale
  - to_currency: Currency of to_locale
  - rate: Current forex rate of from_locale's currency to to_locale's currency<br>
  Note: If you fetch the same forex rate on the same day, you'll get back the same rate. But if you fetch the same forex rate on a different day, it will be updated to that day's rate.

  #### Example:
  GET /forex?from_locale=gb&to_locale=us

---------------------------------------------------------------------------------------------------------------------------

## PUT /forex
Update forex rate from one country to another

  #### Parameters:
  - from_locale (optional): Locale's rate that you want to update<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - to_locale (optional): Locale that you want to convert to<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = gb

  #### Important response data:
  - from_currency: Currency of from_locale
  - to_currency: Currency of to_locale
  - rate: Current forex rate of from_locale's currency to to_locale's currency<br>
  Note: If you fetch the same forex rate on the same day, you'll get back the same rate. But if you fetch the same forex rate on a different day, it will be updated to that day's rate.

---------------------------------------------------------------------------------------------------------------------------
# Weather
---------------------------------------------------------------------------------------------------------------------------

## GET /weather
Get weather of a given locale's capital

  #### Parameters:
  - locale (optional): Locale whose details you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us

  #### Important response data:
  - weather: Current weather of locale's capital
  - temp: Current temp of locale's capital<br>
  Note: weather and temp will update if a request is made at a different hour and date from the last request

  #### Example:
  GET /weather?locale=jp

---------------------------------------------------------------------------------------------------------------------------
# Country details
---------------------------------------------------------------------------------------------------------------------------

## GET /details
Get details of a given locale

  #### Parameters:
  - locale (optional): Locale whose details you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us

  #### Important response data:
  - name: Name of locale
  - currency: Currency of locale
  - capital: Capital of locale
  - latitude: Latitude of locale's capital
  - longitude: Longitude of locale's capital

  #### Example:
  GET /details?locale=in

---------------------------------------------------------------------------------------------------------------------------

## GET /all_details
Get details, weather, and forex rates of a given locale

  #### Parameters:
  - from_locale (optional): Locale whose details you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = us
  - to_locale (optional): Locale whose forex rate you want<br>
  Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve<br>
  Default = gb

  #### Important response data:
  - details: Contains response data that would be given with GET /details?locale=from_locale
  - weather: Contains response data that would be given with GET /weather?locale=from_locale
  - forex: Contains response data that would be given with GET /forex?from_locale=from_locale&to_locale=to_locale

  #### Example:
  GET /all_details?from_locale=kr&to_locale=cn

---------------------------------------------------------------------------------------------------------------------------
# Database
---------------------------------------------------------------------------------------------------------------------------

## GET /db
Get all GET endpoints for specific documents

  #### Important response data:
  - Array of GET endpoints

  #### Example:
  GET /db

---------------------------------------------------------------------------------------------------------------------------

## GET /db/0
Same as GET /db

---------------------------------------------------------------------------------------------------------------------------

## GET /db/\<index\>
Get a document with the index \<index\>

  #### Important response data:
  - Same as GET /news/\<uuid\>

  #### Example:
  GET /db/51

---------------------------------------------------------------------------------------------------------------------------

## POST /db
Create a new document

  #### Parameters:
  - Same as POST /news

  #### Important response data:
  - Same as POST /news

  #### Example:
  POST /db<br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,food,politics,health",<br>
  &nbsp;&nbsp;  locale: "fr"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## PUT /db
Bulk update documents

  #### Parameters:
  - Same as POST /news

  #### Important response data:
  - Message stating that update was successful

  #### Example:
  PUT /db<br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,health"<br>
  &nbsp;&nbsp;  locale: "fr"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## PUT /db/\<index\>
Update a specific document

  #### Parameters:
  - Same as POST /news

  #### Important response data:
  - updatedArticle: Contains updated article's new data
  - endpoint: GET endpoint for updated article

  #### Example: 
  PUT /db/52<br>
  data: {<br>
  &nbsp;&nbsp;  title: "Title",<br>
  &nbsp;&nbsp;  description: "Blah blah blah",<br>
  &nbsp;&nbsp;  url: "google.com",<br>
  &nbsp;&nbsp;  language: "fr",<br>
  &nbsp;&nbsp;  published_at: "2024-02-01",<br>
  &nbsp;&nbsp;  categories: "general,health"<br>
  &nbsp;&nbsp;  locale: "fr"<br>
  }

---------------------------------------------------------------------------------------------------------------------------

## DELETE /db
Delete all documents

  #### Important response data:
  - numAffectedDocuments: Number of documents deleted

  #### Example:
  DELETE /db

---------------------------------------------------------------------------------------------------------------------------

## DELETE /db/\<index\>
Delete a specific document

  #### Important response data:
  - numAffectedDocuments: Number of documents deleted

  #### Example:
  DELETE /db/50