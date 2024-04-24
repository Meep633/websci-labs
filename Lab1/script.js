const NUM_ARTICLES = 20; //number of articles to get per category
const MAX_LIMIT = 3;     //max number of articles that can be requested per api call
const CATEGORIES = ['general', 'science', 'sports', 'business', 'health', 'entertainment', 'tech', 'politics', 'food', 'travel']; //taken directly from https://www.thenewsapi.com/documentation (top stories endpoint)

function fetchNewsData(callback, category, page, limit=MAX_LIMIT) {
  var requestOptions = {
      method: 'GET'
  };
  var params = {
      api_token: 'syYRYmQjrCJOYcuqcuxHNN3fwyd48GMHWFOD1Rwy',
      categories: category,
      limit: String(limit),
      language: 'en',
      published_after: '2024-01-01', //to get recent articles
      page: String(page) //cycle through pages to get different articles
  };
  var esc = encodeURIComponent;
  var query = Object.keys(params)
      .map(function(k) {return esc(k) + '=' + esc(params[k]);})
      .join('&');

  $.ajax({
    type: 'GET',
    url: 'https://api.thenewsapi.com/v1/news/top?' + query,
    dataType: 'json',
    data: params,
    success: function(result) {
      if (localStorage[category]) { //some articles are already stored
        let json = JSON.parse(localStorage[category]);
        for (let i = 0; i < result.data.length; i++) {
          json[json.length] = result.data[i];
        }
        console.log(json);
        localStorage[category] = JSON.stringify(json); //localStorage can't store objects -> store stringified JSON
      } else { //no articles stored yet
        localStorage[category] = JSON.stringify(result.data);
      }
      callback(true, category, page+1);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error, using localStorage cache for backup");
      callback(false, category, page+1);
    }
  });
}

//If fetchNewsData API call succeeded and more articles are needed, get next page from fetchNewsData. 
//Else, print last NUM_ARTICLES articles from localStorage.
function newsCallback(success, category, nextPage) {
  if (success && (nextPage-1) * MAX_LIMIT < NUM_ARTICLES) { //get MAX_LIMIT more articles
    fetchNewsData(newsCallback, category, nextPage);
  } else if (localStorage[category]) {                      //print last NUM_ARTICLES articles
    displayNews(category);
  } else {
    console.log("Ran out of API credits to get articles for " + capitalizeFirstLetter(category) + " and don't have any articles stored in localStorage");
  }
}

//Get articles for each category
function fetchAllNews() {
  for (let i = 0; i < CATEGORIES.length; i++) {
    fetchNewsData(newsCallback, CATEGORIES[i], 1);
  }
}

//Initialize each category's content (heading + news ticker)
function initializeCategories() {
  for (let i = 0; i < CATEGORIES.length; i++) {
    let output = '<div id="' + CATEGORIES[i] + '-container" class="container-fluid">';
    output += '<h1 class="m-3">' + capitalizeFirstLetter(CATEGORIES[i]) + '</h1>';
    output += '<div id="' + CATEGORIES[i] + '" class="carousel slide m-2" data-bs-ride="carousel">';
    output += '<div id="' + CATEGORIES[i] + '-carousel" class="carousel-inner"></div>';
    output += '<button class="carousel-control-prev" type="button" data-bs-target="#' + CATEGORIES[i] + '" data-bs-slide="prev">';
    output += '<span class="carousel-control-prev-icon"></span>';
    output += '</button>';
    output += '<button class="carousel-control-next" type="button" data-bs-target="#' + CATEGORIES[i] + '" data-bs-slide="next">';
    output += '<span class="carousel-control-next-icon"></span>';
    output += '</button>';
    output += '</div>';
    output += '</div>';
    document.body.innerHTML += output;

    output = '<li class="nav-item">';
      output += '<a class="nav-link" href="#' + CATEGORIES[i] + '-container">' + capitalizeFirstLetter(CATEGORIES[i]) + '</a>';
    output += '</li>';
    document.getElementById("navbar-list").innerHTML += output;
  }
}

//Fill in category's carousel with news articles
function displayNews(category) {
  if (!localStorage[category]) {
    console.log("No articles found for " + capitalizeFirstLetter(category));
    return;
  }

  let json = JSON.parse(localStorage[category]);
  //creating all the cards in the carousel
  for (let i = json.length-1; i >= 0 && i >= json.length - NUM_ARTICLES; i -= 5) {
    let output = '<div class="carousel-item">';
    if (i == json.length-1) {
      output = '<div class="carousel-item active">'; //first slide in carousel
    }
      output += '<div class="row">';
    //.title = title, .description = description, .url = link to article, .image_url = article thumbnail, .uuid = unique article identifier
    for (let j = i; j >= 0 && j >= i-4; j--) { //go through 5 articles at a time and add to carousel
        output += '<div class="card col-sm">';
          output += '<div class="card-body">';
            output += '<img class="card-img-top" src="' + json[j].image_url + '">';
            output += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + json[j].url + '" target="_blank">' + json[j].title + '</a></div>';
            output += '<div class="card-text text-bg-secondary p-1">' + json[j].description +'</div>';
            output += '<div class="card-footer p-1 d-grid">';
              let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`)';
              let defaultButton = '<button class="fa fa-star btn btn-light btn-block ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
              if (localStorage.bookmarks) {
                if (Object.values(JSON.parse(localStorage.bookmarks)).find(function(article) {
                  return article.uuid == json[j].uuid;
                })) {
                  output += '<button class="fa fa-star btn btn-light btn-block checked ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
                } else {
                  output += defaultButton;
                }
              } else {
                output += defaultButton;
              }
            output += '</div>';
          output += '</div>';
        output += '</div>';
    }
      output += '</div>';
    output += '</div>';
    document.getElementById(category + "-carousel").innerHTML += output;
  }
}

//uuid is the unique identifier of an article
function toggleBookmark(title, description, url, image_url, uuid) {
  if (localStorage.bookmarks) {
    let json = JSON.parse(localStorage.bookmarks);
    
    if (!Object.values(json).find(function(article) {
      return article.uuid == uuid;
    })) {
      json[json.length] = { //add bookmark
        title: title,
        description: description,
        url: url,
        image_url: image_url,
        uuid: uuid
      };

      let j = json.length-1; //index of last article in bookmarks
      if (json.length % 5 == 1) { //last slide has 5 articles, need to create a new slide (% 1 because a new article was added so length increased by 1)
        let output = '<div class="carousel-item">';
        if (json.length == 1) {
          output = '<div class="carousel-item active">';
        }
          output += '<div class = "row">';
            output += '<div class="card col-sm">';
              output += '<div class="card-body">';
                output += '<img class="card-img-top" src="' + json[j].image_url + '">';
                output += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + json[j].url + '" target="_blank">' + json[j].title + '</a></div>';
                output += '<div class="card-text text-bg-secondary p-1">' + json[j].description +'</div>';
                output += '<div class="card-footer p-1 d-grid">';
                  let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`)';
                  output += '<button class="fa fa-star btn btn-light btn-block checked bookmark-card ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
                output += '</div>';
              output += '</div>';
            output += '</div>';
          output += '</div>';
        output += '</div>';
        document.getElementById('bookmarks-carousel').innerHTML += output;
      } else { //last slide still has space for more articles
        //adding to a row in bookmarks-carousel -> last part to implement for bookmarks and then need to make the spyscroll to finish this lab entirely
        let output = '<div class="card col-sm">';
        output += '<div class="card-body">';
          output += '<img class="card-img-top" src="' + json[j].image_url + '">';
          output += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + json[j].url + '" target="_blank">' + json[j].title + '</a></div>';
          output += '<div class="card-text text-bg-secondary p-1">' + json[j].description +'</div>';
          output += '<div class="card-footer p-1 d-grid">';
            let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`)';
            output += '<button class="fa fa-star btn btn-light btn-block checked bookmark-card ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
          output += '</div>';
        output += '</div>';

        let slides = document.getElementById('bookmarks-carousel').children;
        let lastRow = slides[slides.length-1].children[0]; //getting lastRow in the carousel and adding a card to it
        lastRow.innerHTML += output;
      }

      localStorage.bookmarks = JSON.stringify(json);
      console.log("adding");
    } else {
      json = json.filter(function(article) { //remove bookmark
        return article.uuid != uuid;
      });
      localStorage.bookmarks = JSON.stringify(json); //need to update before calling displayBookmarks()

      //resetting the bookmarks carousel instead of trying to shift everything over because it's easier. could improve on this in the future
      document.getElementById("bookmarks-carousel").innerHTML = "";
      displayBookmarks();
      console.log("removing");
    }

    //need to update the bookmark for the article in all places it shows up (category scroll bar (potentially multiple) + bookmark scroll bar)
    let cards = document.getElementsByClassName(uuid);
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].classList.contains('bookmark-card')) { //dpn't want to toggle the bookmarks since i created them with the star already being yellow
        cards[i].classList.toggle('checked');
      }
    }
  } else { //nothing has been bookmarked yet
    let newBookmark = {
      title: title,
      description: description,
      url: url,
      image_url: image_url,
      uuid: uuid
    };
    localStorage.bookmarks = JSON.stringify([newBookmark]);
  }
  console.log(localStorage.bookmarks);
  resizeCards();
}

function displayBookmarks() {
  if (!localStorage.bookmarks) { //no bookmarks to show because nothing has been bookmarked yet
    return;
  }
  
  let json = JSON.parse(localStorage.bookmarks);
  for (let i = 0; i < json.length; i += 5) {
    let output = '<div class="carousel-item">';
    if (i == 0) {
      output = '<div class="carousel-item active">'; //first slide in carousel
    }
      output += '<div class="row">';
    for (let j = i; j <= i+4 && j < json.length; j++) { //add 5 bookmarks to a slide
        output += '<div class="card col-sm">';
          output += '<div class="card-body">';
            output += '<img class="card-img-top" src="' + json[j].image_url + '">';
            output += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + json[j].url + '" target="_blank">' + json[j].title + '</a></div>';
            output += '<div class="card-text text-bg-secondary p-1">' + json[j].description +'</div>';
            output += '<div class="card-footer p-1 d-grid">';
              let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`)';
              output += '<button class="fa fa-star btn btn-light btn-block checked bookmark-card ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
            output += '</div>';
          output += '</div>';
        output += '</div>';
    }
      output += '</div>';
    output += '</div>';
    document.getElementById("bookmarks-carousel").innerHTML += output;
  }
}

function resizeCards() {
  if (window.innerWidth > 540) { //540px = small screen
    $(".card").css("max-width", "20%"); //without this, max-width is always 100% which may look weird if a carousel only has one card
  } else {
    $(".card").css("max-width", "100%");
  }
}

function addSpaceUnderNavbar() {
  $("#space").height($("#navbar").height() + window.innerHeight * 0.005);
}

//https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$(document).ready(function() {
  initializeCategories();
  displayBookmarks();
  fetchAllNews(); //check this to see if it works and if it doesn't idk cry or something
  resizeCards();
  addSpaceUnderNavbar();
  window.onresize = function() {
    resizeCards();
    addSpaceUnderNavbar();
  };
});