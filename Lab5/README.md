http://zuhays.eastus.cloudapp.azure.com/iit/Lab5/ (I didn't get this stuff working on my VM yet)

Please run `npm start` to start up the server

I decided to go with news articles for my data for this lab since I've been working with them for all of my labs this semester. That made making all my endpoints pretty simple, as I pretty much just copy-pasted a lot of stuff from my old endpoints and changed some stuff to make it work with mongo instead of my own json file. There were some things I had to adjust like how I was storing data (I'm storing news articles in mongo differently from my json file), but besides that, not much had to be done. Then for the React component, I just made another form for the db endpoints. One issue I found there was that I didn't make my Form component work for anything besides an input element for inputs and I needed a select element, so I had to make a new component from scratch specifically for this. A lot of the logic in that form was copied from other forms. One thing that I noticed from this lab was that I really made life a lot easier for myself by trying to generalize things, modularizing code, and using data that I've used before.

Creativity:
I continued to keep my server code split into modules to try and practice good coding habits by keeping things modularized and easy to change. I made a new router for all my db endpoints and made new modules for mongoose models and functions that use mongoose. This allows db.js to just use functions from other files that can get changed easily if something doesn't work or needs to be changed.

Sources:
https://stackoverflow.com/questions/10547118/why-does-mongoose-always-add-an-s-to-the-end-of-my-collection-name
https://www.youtube.com/watch?v=_GkujEyjJm8
https://www.youtube.com/watch?v=DZBGEVgL2eE&ab_channel=WebDevSimplified
https://www.w3schools.com/tags/tag_select.asp
https://stackoverflow.com/questions/1480588/input-size-vs-width