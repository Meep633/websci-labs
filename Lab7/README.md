http://zuhays.eastus.cloudapp.azure.com/iit/datavis

Please run `npm start` in /Lab7 to start up the server

If you ever heard of a youtuber called 'JxmyHighroller', he makes NBA videos and makes some pretty cool graphs with NBA stats. That's why I picked NBA stats, since I wanted to do something similar. I just ended up making 2 scatterplots but it's still pretty cool I guess, although I was hoping to do something with multiple seasons or stats by teams, but I was limited by whatever data I could get from the free APIs. 
This was all done from a website I found which was pretty neat, but I think I just don't understand D3 all that well because I don't understand SVGs all that well and don't have time to learn all about it right now. I also hardcoded some styling and will need to figure out how to dynamically adjust the positions of the axis labels.

Creativity:
I made 2 scatterplots and added some customization to them like different colors and tooltips when hovering over circles. I also added a little loading screen so that you wouldn't see an empty graph while waiting for the data from my Mongo DB to be fetched.

Sources:
https://blog.logrocket.com/getting-started-d3-js-react/
https://www.react-graph-gallery.com/scatter-plot
ChatGPT:
- i have a react router that routes the frontend to another page when going to /datavis and i have an express backend that serves the frontend at get /. how can i make it so that trying to get /datavis gives the frontend page instead of trying to find the /datavis endpoint
https://expressjs.com/en/api.html#app.use
https://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
https://nodejs.org/api/path.html#pathresolvepaths