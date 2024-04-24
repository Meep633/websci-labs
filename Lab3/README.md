http://zuhays.eastus.cloudapp.azure.com/iit/Lab3/

I put any information about how to use endpoints in api_documentation.md (best viewed on GitHub - https://github.com/RPI-ITWS/itws4500-zuhays/blob/main/Lab3/api_documentation.md).


Feedback:
I honestly hated this lab. I feel like being forced to combine data about news, weather, and something else of our choosing just made me severely overthink of what to do to the point where I just wanted to avoid doing this lab. I think it's a good idea to have a lab where we update old data with new data, but maybe I just didn't like it either because of the open-endedness or just the combination of news + weather + whatever else.


Lab 2:
I started this off by trying to finish what I couldn't in lab 2 by integrating the POST, PUT, and DELETE requests into index.html instead of a demo page. I made the pencil and trash buttons functional and added a plus button in the navbar. When those buttons get clicked, a form pops up for one of the endpoints (plus = POST /news, pencil = PUT /news/<uuid>, trash = DELETE /news/<uuid>). I showed the output of these requests in a little notification pop-up in the bottom right corner when a form is submitted. I also used GET /news/<uuid> to help with PUT and DELETE by getting a selected article's data and prefilling the form with that (I would've just passed in all this data into the onclick function but that just didn't work out).
While doing that, I had to make some edits to script.js to make things work. I decided to keep using localStorage to cache my API calls even though I had no limit because I think it's more efficient. I then had it so that the localStorage was cleared whenever an article was posted / updated / deleted.

Also, I added an option to DELETE /news?<uuid> to let the user to specify all categories instead of individual categories. I also changed things so that only index.html, style.css, and script.js is publicly accessible by moving those files into a public folder and making it so that only files in the public folder can be statically served.


Lab 3:
I probably spent way too much time thinking about how to put data from different sources together into one GET endpoint because it just didn't make sense to me to combine data from things like forex rates and news, forex rates and weather, news and weather, etc. So, only a few of the new GET endpoints actually combine data from different sources together because of that (unless you count combining the data I got about a country's currency to be data from a different source).

To start off, I restructured my json file to work with the new data from external APIs. I had to go through all my previous endpoints and helper functions to update them and work with the new structure. Then, I wrote a couple of fetch functions to get data from the external APIs. I also wrote some update functions to update my current data with data from the external APIs so that I could easily call those. I had to make all of these functions asynchronous since my endpoints relied on the update functions on completing before returning something, so that was a bit of a pain to figure out how to do.

I'm too dejected to continue working on this frontend since it's a mess. If you would like to check my backend, use postman or you can directly test the GET endpoints. I'm just gonna rewrite this entire thing for lab 4 and cut my losses here. this is sad

Added endpoints (read more about them in https://github.com/RPI-ITWS/itws4500-zuhays/blob/main/Lab3/api_documentation.md):
- GET /forex
- GET /details
- GET /weather
- GET /all_details
- POST /news/latest
- PUT /forex


Creativity:
I restructured all of my data to work with new information. I also used a bunch of async functions to make my code that fetches data from external APIs look more clean (otherwise I would've had to deal with way too many nested callback functions). I also tried my best to make the data I'm using make sense together by choosing to use data that may be seen on a news broadcast (today's weather, forex rate of another country, today's news), and I also used another API to get some data that was necessary for my other API calls (World Geodata).


Lab 2 Sources:
https://stackoverflow.com/questions/41258881/place-form-at-center-of-page-using-bootstrap
ChatGPT:
- make me a form styled with bootstrap 5 that stays fixed in the center of the screen
- can you do this while leaving the body alone
- can you make a bootstrap 5 toast fixed to the bottom right corner of the screen
https://getbootstrap.com/docs/4.3/components/forms/
https://getbootstrap.com/docs/5.0/utilities/flex/
https://www.w3schools.com/jsref/prop_element_classlist.asp
https://www.w3schools.com/bootstrap5/bootstrap_toast.php
https://www.w3schools.com/jsref/jsref_findindex.asp
https://stackoverflow.com/questions/44651402/serve-html-with-express


Lab 3 Sources:
https://axios-http.com/docs/intro
https://rapidapi.com/natkapral/api/world-geo-data
https://rapidapi.com/alphavantage/api/alpha-vantage
https://openweathermap.org/current
https://www.thenewsapi.com/documentation
https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
https://youtu.be/lkIFF4maKMU?t=519
https://stackoverflow.com/questions/42964102/syntax-for-an-async-arrow-function
https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
https://www.w3schools.com/jsref/jsref_gettimezoneoffset.asp