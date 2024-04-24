http://zuhays.eastus.cloudapp.azure.com/iit/Lab6/ (I didn't get this stuff working on my VM yet)

Please run `npm start` to start up the server

I changed my data from news articles to NBA player averages because I thought doing a data visualization on the articles would be hard while NBA stats would be easy and I also like the NBA. Trying to find data sources for this lab is what took me the longest time I think, as I probably spent around 3-4 hours trying to find NBA stat APIs that work and aren't outdated or wack. It got so bad I just had to ask ChatGPT for possible sources at some point because of how difficult it was to find anything. The official NBA stats API also seems to be pretty weird with Node since it seems to have been designed to be used with Python. I could only find one endpoint that works and it returns an array of players and their UNLABELED stats, so I just pulled up their stats and tried to compare them to figure out what each array item is. There's a good chance that my stuff is inaccurate but I can't be bothered to go further on this because trying to find free APIs is some of the worst things I've had to do here.

After getting the data, I just found whatever stats the APIs had in common and made a schema. Then I made functions to load them in and stuff.

Creativity:
I think it makes sense for NBA stats to show on a news ticker website because it's kinda like news but specifically for sports. I also incorporated into my website by doing something really creative: adding a button to my navbar. I may or may not be reaching.

Sources:
ChatGPT
- please gimme list of free nba stats apis
- can i use nba stats api by stats.nba.com in nodejs
- how can i get a player's season averages using nba stats api by stats.nba.com
https://documenter.getpostman.com/view/24232555/2s93shzpR3#0b757468-b123-4d74-9513-d2f19f4f6c30
https://docs.balldontlie.io/#get-averages
https://www.basketball-reference.com/
https://www.w3schools.com/jsref/jsref_encodeuricomponent.asp
https://www.w3schools.com/jsref/jsref_parsefloat.asp