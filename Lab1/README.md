http://zuhays.eastus.cloudapp.azure.com/iit/Lab1/

I got started by make a google doc for everyone to contribute to the specs guide. I looked up some examples of news tickers and what they had in common, writing that down in the specs guide. After that, someone came up with an idea of adding a bookmarks to save news articles which I thought was a pretty good idea, so I expanded on that a bit in the specs guide. Once that was done, I made a plan to first learn some Bootstrap so that I could use it in this lab. Then I would make a basic news ticker to figure out how to make it look the way I want. After that, I would look at the structure of the news API JSON output to see how I will show the articles on my page. Then I would make the navbar to quickly jump to specific tickers. Finally, I would make the bookmarks bar, as that isn't something any of the other features I need to implement depend on. In the end, I ended up making the bookmarks before the navbar just because I felt like it I guess. The most difficult part of this for me ended up being the bookmark functionality as I had to figure out how to keep the info I needed, how to update the correct articles, etc. This lab probably wouldn't be so messy if I could use a database instead of localStorage, but I think I did okay with what I had.

Also one thing I wasn't able to figure out in time was how to get the navbar to stay horizontal. When the window's width is small enough, the navbar displays the headings vertically, taking up a ton of space on the screen. I wasn't really sure how I was supposed to prevent that from happening though.

Creativity: 
I had the news be separated by different genres, using those genres to do API searches and get news specific to each genre. I also made a bookmarks bar so that users could save articles that they think are interesting, adding an additional feature to this page. I also made the navbar update based on where you are on the page, so it's clearly visible what category of news articles you're looking at.

Note: If you don't see any articles showing up, check the console. I most likely ran out of API credits and nothing was stored in localStorage yet at the time you loaded the page for the first time.

Sources:
https://tickernews.co/
https://www.w3schools.com/bootstrap5/
https://getbootstrap.com/
https://www.w3schools.com/howto/howto_css_star_rating.asp
https://www.w3schools.com/bootstrap5/bootstrap_carousel.php
https://www.w3schools.com/bootstrap5/bootstrap_scrollspy.php
https://stackoverflow.com/questions/46249541/change-arrow-colors-in-bootstraps-carousel
https://chat.openai.com/
- I'm running into a problem with getting a link to take precedence over the carousel action button. How can I fix this?
https://stackoverflow.com/questions/65605654/how-to-cache-an-api-response
https://www.thenewsapi.com/documentation
https://stackoverflow.com/questions/2010892/how-to-store-objects-in-html5-localstorage-sessionstorage
https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
https://www.w3schools.com/jsref/jsref_find.asp
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
https://gomakethings.com/getting-direct-descendant-elements-by-selector-with-vanilla-js/

Specifications guide:
- Have a bunch of scroll bars stacked on top of each other, with each scroll bar being for a different genre/topic of news
  - Choose 5-10 different categories of news to have displayed on the page (ex: US politics, foreign politics, business/finance, entertainment, sports, general, health, science, technology, education, cooking/food)
    - ~20-50 news articles for each category 
  - If the screen is wide enough to show 5 articles, then the scroll bars should scroll horizontal
    - Ex:
      ===============================
      =     =     =     =     =     =
      =     =     =     =     =     =
      ===============================
  - If the screen isn't wide enough to show 5 articles, then the scroll bars should scroll vertically.
    - Ex:
      =======
      =     =
      =     =
      =======
      =     =
      =     =
      =======
      =     =
      =     =
      =======
      =     =
      =     =
      =======
      =     =
      =     =
      =======

  - Each article should have a title, description, and image. The title and description should be beneath the image as seen above
  - News articles must come from one of 3 sources:
    - API: https://newsdata.io/documentation/#latest-news 
    - Another API: https://www.thenewsapi.com/documentation
    - Another API: api.spaceflightnewsapi.net 
      - If doing an API call, save the output to a JSON file to be able to always output some data even if you run out of API calls
      - Alternatively cache api calls or save in local storage or session storage 
    - Manually scraped JSON file: https://www.nytimes.com/rss 
  - Must have a navigation bar at the top of the page to jump to different news genres/topics scroll bars
  - Should have a header at the top of the web page
  - optional features
    - Articles can be able to be bookmarked by being starred. Each article must have a star that when clicked, it will signify that the article has been bookmarked by the user. This will be kept track of through localStorage.
    - Articles should also be able to be un-bookmarked by clicking the star again
  - A bookmarks bar underneath the navigation bar. That will display the articles that users bookmarked.
  - Site structure:
    /Lab1
      index.html
      /resources
          script.js
          style.css
          news.json → if storing API response in a file / manually scraping news articles