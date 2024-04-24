http://zuhays.eastus.cloudapp.azure.com/iit/Lab2/

Run 'node server'
Run 'cp backupNews.json news.json' if you need to reset the json file

Since I separated all my news for lab 1 by category and stored all articles in separate JSON objects, I had to put them together into one object and just have the first level in the JSON object be the categories. Then, the value of each category would be an array of articles.

Also, I wasn't able to make features to showcase some of the endpoints on the main page, so I made a quick page called test.html (http://localhost:3000/test.html) where you can try some stuff out that I made separately to test the API with a frontend.

---------------------------------------------------------------------------------------------------------------------------

1. GET /
I just copied my files from the Lab1 folder to this folder and allowed files in the current directory to be publicly accessible. Going to http://localhost:3000 then goes directly to index.html.

---------------------------------------------------------------------------------------------------------------------------

2. GET /news
Since I had all my news sorted by categories and there's a lot of news articles stored (I accidentally stored 400+ articles), I needed to modify this GET request to take in some parameters. I decided to give a page number to allow for pagination, a category to specify what kind of news you want, and how many articles you want to get in one request. I also set a hard limit on the number of articles in one request to 50 because I think more than that would be a lot I guess.

  Parameters:
  - page (optional): Which page of articles you want (max page dependent on size of news.json, so if you input an invalid page, the response will tell you what page numbers are valid). Default = 1
  - category (optional): What category of news you want. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel. Default = general
  - limit (optional): How many articles you want to get in one request. 1 <= limit <= 50. Default = 20
  
  Important response data:
  - uuid: Unique id of an article (use this for GET /news/<uuid>)
  - title: Article title
  - description: Article description
  - url: Article url
  - image_url: Article thumbnail url

  Example: 
  GET /news?page=2&category=business&limit=10

---------------------------------------------------------------------------------------------------------------------------

3. GET /news/<uuid>
All the articles that I got from https://www.thenewsapi.com had a unique id (uuid), so I decided to use that instead of an index to request specific articles. Otherwise, it would've been pretty difficult to figure out indexing between multiple categories (the way my json file is set up, at the top level there are 10 categories and each category has an array of article objects). After thinking about how I would actually determine a valid uuid (I would need to check every article to make sure the uuid exists), I decided to add a category parameter to limit the number of articles I would have to search through (if I had 1000 articles, 100 articles per category, and the uuid given was the last article in the last category, I would only need to search through 100 articles instead of 1000). To help with making this even faster, I decided to sort each category's articles by uuid in ascending order. That way, I could use binary search to find a valid uuid.

  Parameters:
  - category (optional): What category of news the article you want is in. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel. Default = general
  
  Important response data:
  - Same as GET /news

  Example: 
  GET /news/<uuid>?category=politics

---------------------------------------------------------------------------------------------------------------------------

4. POST /news
I decided to make the uuid automatically set myself since it is really important for them to be unique. To make sure that users also know how to access an article that they created / verify that the article was created, I returned a JSON object with three things: uuid, category, and the article itself. I decided not to make any parameters required since I guess articles can exist without any information as long as they can be accessed by a uuid. Also, the lists of valid languages and locales are based on https://www.thenewsapi.com/documentation.

  Parameters:
  - title (optional): Article title
  - description (optional): Article description
  - keywords (optional): Comma-separated list of keywords describing article
  - snippet (optional): First 60 words of article
  - url (optional): Article url
  - image_url (optional): Article thumbnail url
  - language (optional): Article language. Valid languages: ar, bg, bn, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hr, hu, id, it, ja, ko, lt, multi, nl, no, pl, pt, ro, ru, sk, sv, ta, th, tr, uk, vi, zh. Default = en
  - published_at (optional): Time at which article was published. Must be in format: YYYY-MM-DD. Default = current date
  - source (optional): Source url of article
  - categories (optional): Comma-separated list of categories that article should be part of. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel. Default = general
  - locale (optional): Place where article was written. Valid locales: ar, am, au, at, by, be, bo, br, bg, ca, cl, cn, co, hr, cz, ec, eg, fr, de, gr, hn, hk, in, id, ir, ie, il, it, jp, kr, mx, nl, nz, ni, pk, pa, pe, pl, pt, qa, ro, ru, sa, za, es, ch, sy, tw, th, tr, ua, gb, us, uy, ve. Default = us

  Important response data:
  - uuid: Unique id of the created article
  - categories: Categories the article is in
  - article: Data about the article that you made (same data that GET /news gives)

  Example:
  POST /news
  data: {
    title: "Title",
    description: "Blah blah blah",
    url: "google.com",
    language: "fr",
    published_at: "2024-02-01",
    categories: "general,food,politics,health",
    locale: "fr"
  }

---------------------------------------------------------------------------------------------------------------------------

5. PUT /news
I allowed the user to update any value except the uuid because that would really mess up how articles are found. Also, I decided to only send a message instead of any data for the response since a bulk update would update a lot of things, making it not so good of an idea to send all the affected articles.

  Parameters:
  - Same as POST /news (except categories)
  - categories (optional): Comma-separated list of categories that all articles should be placed in. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel, same (stay in current category, can't use any other category if using this). Default = same

  Important response data:
  - message: Tells you if update was successful

  Example:
  PUT /news
  data: {
    title: "Title",
    description: "Blah blah blah",
    url: "google.com",
    language: "fr",
    published_at: "2024-02-01",
    categories: "general,health"
    locale: "fr"
  }

---------------------------------------------------------------------------------------------------------------------------

6. PUT /news/<uuid>
I just did the same thing for this using stuff from POST /news like I did for GET /news/* and GET /news.

  Parameters:
  - Same as PUT /news (except categories)
  - categories (optional): Categories that article should be placed in. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel, same (stay in current category, can't use any other category if using this). Default = same
  - old_categories (optional): Comma-separated list of categories the article you want is in (article could be in multiple categories). Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel. Default = general

  Important resposne data:
  - uuid: Unique id of the created article
  - categories: Categories the article is in
  - article: Data about the article that you made (same data that GET /news gives)

  Example:
  PUT /news/<uuid>
  data: {
    title: "Title",
    description: "Blah blah blah",
    url: "google.com",
    language: "fr",
    published_at: "2024-02-01",
    categories: "general,health"
    locale: "fr",
    old_categories: "sports,politics"
  }

---------------------------------------------------------------------------------------------------------------------------

7. DELETE /news/<uuid>
im tired

  Parameters:
  - categories (optional): Categories that you want to delete article from. If a category is given that the article isn't in, that category won't be affected. Valid categories: business, entertainment, food, general, health, politics, science, sports, tech, travel. Default = general

  Important response data:
  - affected_categories: Comma-separated list of categories that article was deleted from

  Example:
  DELETE /news/<uuid>
  data: {
    categories: sports,entertainment
  }

---------------------------------------------------------------------------------------------------------------------------

Creativity:
I added a bunch of parameters to almost every endpoint to allow for specifying the data you want to get/change/delete. I based a lot of the allowable things on the API that I originally got my news articles from, so if you were to do an API call to thenewsapi and then try to post those articles into my json file, it would be pretty easy and seamless. To show the functionality of my API, I made it so that when you cl


Sources:
https://expressjs.com/en/api.html
https://stackoverflow.com/questions/47748831/fetching-value-and-key-from-local-json-file-in-node-js
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
https://stackoverflow.com/questions/23751914/how-can-i-set-response-header-on-express-js-assets
https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
https://www.w3schools.com/jsref/jsref_ceil.asp
https://stackoverflow.com/questions/35864088/how-to-send-error-http-response-in-express-node-js
https://www.w3schools.com/js/js_typeof.asp
https://www.thenewsapi.com/documentation
https://www.w3schools.com/jsref/jsref_localecompare.asp
https://stackoverflow.com/questions/10685998/how-to-update-a-value-in-a-json-file-and-save-it-through-node-js
https://www.geeksforgeeks.org/binary-search-in-javascript/
https://www.w3schools.com/jsref/jsref_split.asp
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
https://www.w3schools.com/js/js_date_methods.asp
https://www.geeksforgeeks.org/how-to-clone-an-array-in-javascript/
https://www.w3schools.com/jsref/jsref_splice.asp
Lab 1 files
ChatGPT:
- how can i make my api enable cross origin requests using express.js

https://fontawesome.com/icons/pen-to-square?f=classic&s=solid
https://fontawesome.com/icons/trash-can?f=classic&s=solid
https://fontawesome.com/icons/plus?f=classic&s=solid
https://www.w3schools.com/html/html_forms.asp