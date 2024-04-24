http://zuhays.eastus.cloudapp.azure.com/iit/Lab4/

Please run `npm start` to start up the server from now on (I moved stuff around so server.js isn't in the root of the lab folder anymore).

Before doing anything with React, I made sure to do something about my server.js because there was just way too much code in one file (1500+ lines for a project like this is insane I think). I looked into modularizing my code and figured out how to split up all my helper functions into modules. I wanted to use ES6 modules at first since I saw a video talking about how libraries are eventually going to use ES6 instead of CommonJS, but trying to get data.json with ES6 seemed to complicated so I didn't do that. I also eventually figured out how to split up my endpoints into different files to make them easier to look through.

To start with rewriting everything in React, I focused on making individual components. I made a component for an article, form, news ticker (carousel), and notification. Making them look right was pretty simple, but figuring out how to update states properly got messy pretty fast. A big problem was that I didn't think through how I wanted my data to be stored overall, so I messed up a lot of stuff with how states get passed through different components. I had to end up rethinking how all the states and data interact with each other in the end to make something sensible and something that doesn't spontaneously combust.

Creativity:
I split up my server stuff to make it nice and neat. I also split up my components in a way that they should be pretty separate from each other. For each component file, I only made new files for functions if I thought they would be used in other places outside of this component. Then to keep track of the data I get from my API, I came up with a system where data gets stored in App.js as a state, specific articles from data get passed into carousels which pass that data into articles, and the update data function gets passed into forms to give forms a way of updating data on submission. This sounds pretty nice but I had to redo all this stuff to make sense at the last minute which was not fun.

Sources:
https://www.youtube.com/watch?v=85IxatMJNY4
https://expressjs.com/en/guide/routing.html
ChatGPT:
- im using express to handle api requests, how can i modularize them
- how can i dynamically add and remove components in react
https://www.w3schools.com/react/default.asp
https://www.geeksforgeeks.org/how-to-use-bootstrap-with-react/
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
https://www.w3schools.com/js/js_htmldom_css.asp
https://stackoverflow.com/questions/3314989/can-i-make-a-button-not-submit-a-form
https://adhithiravi.medium.com/why-do-i-need-keys-in-react-lists-dbb522188bbb
https://fontawesome.com/docs/web/use-with/react/add-icons
https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
https://medium.com/@bhanu.mt.1501/api-calls-in-react-js-342a09d5315f
https://www.geeksforgeeks.org/create-a-comma-separated-list-from-an-array-in-javascript/
https://www.w3schools.com/css/css3_mediaqueries.asp
https://stackoverflow.com/questions/51069552/axios-delete-request-with-request-body-and-headers