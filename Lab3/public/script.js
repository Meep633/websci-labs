const NUM_ARTICLES = 20;  //number of articles to get per category
const MAX_LIMIT = 3;     //max number of articles that can be requested per api call
const CATEGORIES = ['general', 'science', 'sports', 'business', 'health', 'entertainment', 'tech', 'politics', 'food', 'travel']; //taken directly from https://www.thenewsapi.com/documentation (top stories endpoint)
let date = new Date();
const CURRENT_DATE = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay();

//continue by updating localStorage stuff with the new format ([locale][news/forex/details/weather]...)
//then make buttons for each category to get latest news
//then make a thing at the bottom of the screen where you can see weather and forex rates

function fetchNewsData(callback, locale, category, page, limit=MAX_LIMIT) {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/news',
    data: {
      locale: locale,
      category: category,
      limit: String(limit),
      page: String(page)
    },
    dataType: 'json',
    success: function(result) {
      // if (localStorage[category]) { //some articles are already stored
      //   let json = JSON.parse(localStorage[category]);
      //   for (let i = 0; i < result.length; i++) {
      //     json[json.length] = result[i];
      //   }
      //   console.log(json);
      //   localStorage[category] = JSON.stringify(json); //localStorage can't store objects -> store stringified JSON
      // } else { //no articles stored yet
      //   localStorage[category] = JSON.stringify(result);
      // }
      let json = JSON.parse(localStorage[locale]);
      for (let i = 0; i < result.length; i++) {
        json["news"][category][json.length] = result[i];
      }
      console.log(json);
      localStorage[locale] = JSON.stringify(json);
      callback(true, "fetchNewsData", locale, category, page+1);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error in fetchNewsData, switching to fetchLatestNewsData");
      callback(false, "fetchNewsData", locale, category, page+1);
    }
  });
}

function fetchLatestNewsData(callback, locale, category, num_articles) {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/news/latest',
    data: {
      locale: locale,
      category: category,
      num_articles: num_articles
    },
    dataType: 'json',
    success: function(result) {
      let json = JSON.parse(localStorage[locale]);
      for (let i = 0; i < result.length; i++) {
        json["news"][category][json.length] = result[i];
      }
      localStorage[locale] = JSON.stringify(json);
      callback(true, "fetchLatestNewsData", locale, category, 1);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error in fetchLatestNewsData, womp womp");
      
      noti.classList.add("show");
      noti.classList.remove("text-bg-success");
      noti.classList.add("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "GET /news/latest error";
      document.getElementById("noti-body").innerHTML = JSON.stringify(jqXHR.responseJSON, null, 2);
      
      callback(false, "fetchLatestNewsData", locale, category, 1);
    }
  })
}

//If fetchNewsData API call succeeded and more articles are needed, get next page from fetchNewsData. 
//Else, print last NUM_ARTICLES articles from localStorage.
function newsCallback(success, prevFunc, locale, category, nextPage) {
  let json = JSON.parse(localStorage[locale]);
  if (success && prevFunc == "fetchNewsData" && json["news"][category].length < NUM_ARTICLES) { //get MAX_LIMIT more articles
    fetchNewsData(newsCallback, locale, category, nextPage);
  } else if (((!success && prevFunc == "fetchNewsData") || (success && prevFunc == "fetchLatestNewsData")) && json["news"][category].length < NUM_ARTICLES) { 
    let num_articles = Math.min(NUM_ARTICLES - json["news"][category].length, 12); // 1 <= num_articles <= 12
    fetchLatestNewsData(newsCallback, locale, category, num_articles);
  } else { //print last min(localStorage[locale][news][category].length, NUM_ARTICLES) articles
    displayNews(category);
  }
}

//Get articles for each category
function fetchAllNews(locale) {
  if (!localStorage[locale]) initializeLocalStorage(locale);

  for (let i = 0; i < CATEGORIES.length; i++) {
    let json = JSON.parse(localStorage[locale]);
    
    if (!json["news"][CATEGORIES[i]]) {
      json["news"][CATEGORIES[i]] = [];
      localStorage[locale] = JSON.stringify(json);
    }

    if (json["news"][CATEGORIES[i]].length > NUM_ARTICLES) {
      displayNews(locale, CATEGORIES[i]);
    } else { 
      fetchNewsData(newsCallback, locale, CATEGORIES[i], 1);
    }
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
    document.getElementById("nav-items").innerHTML += output;
  }
}

//Fill in category's carousel with news articles
function displayNews(locale, category) {
  document.getElementById(category + "-carousel").innerHTML = ""; //clear out carousel before adding in articles

  let json = JSON.parse(localStorage[locale])["news"][category];
  let bookmarks = JSON.parse(localStorage[locale])["news"]["bookmarks"];
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
              let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`, `' + locale + '`, `' + category + '`)';
              let defaultButton = '<button class="fa fa-star btn btn-light btn-block ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
              if (Object.values(bookmarks).find((article) => article.uuid == json[j].uuid)) {
                output += '<button class="fa fa-star btn btn-light btn-block checked ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
              } else {
                output += defaultButton;
              }
              let changeFunc = "showForm('put-form', '" + json[j].uuid + "', '" + locale + "', '" + category + "')";
              output += '<button class="fa fa-solid fa-pen-to-square btn btn-light btn-block" onclick="' + changeFunc + '"></button>';
              let deleteFunc = "showForm('del-form', '" + json[j].uuid + "', '" + locale + "', '" + category + "')";
              output += '<button class="fa fa-solid fa-trash-can btn btn-light btn-block" onclick="' + deleteFunc + '"></button>';
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
function toggleBookmark(title, description, url, image_url, uuid, locale, category) {
  let json = JSON.parse(localStorage[locale]);
  if (!Object.values(json).find((article) => article.uuid == uuid)) {
    json["news"]["bookmarks"].push({ //add new bookmark
      title: title,
      description: description,
      url: url,
      image_url: image_url,
      uuid: uuid,
      locale: locale,
      category: category
    });

    let article = json["news"]["bookmarks"][json.length-1]; //last article in bookmarks
    let bookmarkFunc = 'toggleBookmark(`' + article.title + '`, `' + article.description + '`, `' + article.url + '`, `' + article.image_url + '`, `' + article.uuid + '`, `' + article.locale + '`, `' + article.category + '`)';
    let changeFunc = "showForm('put-form', '" + article.uuid + "', '" + article.locale + "', '" + article.category + "')";
    let deleteFunc = "showForm('del-form', '" + article.uuid + "', '" + article.locale + "', '" + article.category + "')";
    let card = '<div class="card col-sm">';
      card += '<div class="card-body">';
        card += '<img class="card-img-top" src="' + article.image_url + '">';
        card += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + article.url + '" target="_blank">' + article.title + '</a></div>';
        card += '<div class="card-text text-bg-secondary p-1">' + article.description +'</div>';
        card += '<div class="card-footer p-1 d-grid">';
          card += '<button class="fa fa-star btn btn-light btn-block checked bookmark-card ' + article.uuid + '" onclick="' + bookmarkFunc + '"></button>';
          card += '<button class="fa fa-solid fa-pen-to-square btn btn-light btn-block" onclick="' + changeFunc + '"></button>';
          card += '<button class="fa fa-solid fa-trash-can btn btn-light btn-block" onclick="' + deleteFunc + '"></button>';
        card += '</div>';
      card += '</div>';
    card += '</div>';

    if (json["news"]["bookmarks"].length % 5 == 1) { //last slide has 5 articles, need to create a new slide (% 1 because a new article was added so length increased by 1)
      let output = (json["news"]["bookmarks"].length == 1) ? '<div class="carousel-item active">' : '<div class="carousel-item">';
        output += '<div class = "row">';
          output += card;
        output += '</div>';
      output += '</div>';
      document.getElementById('bookmarks-carousel').innerHTML += output;
    } else { //last slide still has space for more articles
      let slides = document.getElementById('bookmarks-carousel').children;
      let lastRow = slides[slides.length-1].children[0]; //getting lastRow in the carousel and adding a card to it
      lastRow.innerHTML += card;
    }

    localStorage[locale] = JSON.stringify(json);
    console.log("adding");
  } else {
    json = json.filter((article) => article.uuid != uuid); //remove bookmark
    localStorage[locale] = JSON.stringify(json); //need to update before calling displayBookmarks()

    //resetting the bookmarks carousel instead of trying to shift everything over because it's easier. could improve on this in the future
    document.getElementById("bookmarks-carousel").innerHTML = "";
    displayBookmarks(locale);
    console.log("removing");
  }

  //need to update the bookmark for the article in all places it shows up (category scroll bar (potentially multiple) + bookmark scroll bar)
  let cards = document.getElementsByClassName(uuid);
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].classList.contains('bookmark-card')) { //dpn't want to toggle the bookmarks since i created them with the star already being yellow
      cards[i].classList.toggle('checked');
    }
  }
  
  console.log(localStorage[locale]);
  resizeCards();
}

function displayBookmarks(locale) {
  document.getElementById("bookmarks-carousel").innerHTML = ""; //clear out before adding in articles
  
  let json = JSON.parse(localStorage[locale])["news"]["bookmarks"];
  for (let i = 0; i < json.length; i += 5) {
    let output = (i == 0) ? '<div class="carousel-item active">' : '<div class="carousel-item">';
      output += '<div class="row">';
    for (let j = i; j <= i+4 && j < json.length; j++) { //add 5 bookmarks to a slide
        output += '<div class="card col-sm">';
          output += '<div class="card-body">';
            output += '<img class="card-img-top" src="' + json[j].image_url + '">';
            output += '<div class="card-title text-bg-primary p-1"><a class="text-white" href="' + json[j].url + '" target="_blank">' + json[j].title + '</a></div>';
            output += '<div class="card-text text-bg-secondary p-1">' + json[j].description +'</div>';
            output += '<div class="card-footer p-1 d-grid">';
              let bookmarkFunc = 'toggleBookmark(`' + json[j].title + '`, `' + json[j].description + '`, `' + json[j].url + '`, `' + json[j].image_url + '`, `' + json[j].uuid + '`, `' + json[j].locale + '`, `' + json[j].category + '`)';
              output += '<button class="fa fa-star btn btn-light btn-block checked bookmark-card ' + json[j].uuid + '" onclick="' + bookmarkFunc + '"></button>';
              let changeFunc = "showForm('put-form', '" + json[j].uuid + "', '" + json[j].locale + '`, `' + json[j].category + "')";
              output += '<button class="fa fa-solid fa-pen-to-square btn btn-light btn-block" onclick="' + changeFunc + '"></button>';
              let deleteFunc = "showForm('del-form', '" + json[j].uuid + "', '" + json[j].locale + '`, `' + json[j].category + "')";
              output += '<button class="fa fa-solid fa-trash-can btn btn-light btn-block" onclick="' + deleteFunc + '"></button>';
            output += '</div>';
          output += '</div>';
        output += '</div>';
    }
      output += '</div>';
    output += '</div>';
    document.getElementById("bookmarks-carousel").innerHTML += output;
  }
}

function postData() {
  let noti = document.getElementById("noti");

  let title = document.getElementById("post-title").value;
  let desc = document.getElementById("post-desc").value;
  let keywords = document.getElementById("post-keywords").value;
  let snippet = document.getElementById("post-snippet").value;
  let url = document.getElementById("post-url").value;
  let img_url = document.getElementById("post-img-url").value;
  let lang = document.getElementById("post-lang").value;
  let publish = document.getElementById("post-publish").value;
  let source = document.getElementById("post-source").value;
  let categories = document.getElementById("post-categories").value;
  let locale = document.getElementById("post-locale").value;

  document.getElementById("post-title").value = "";
  document.getElementById("post-desc").value = "";
  document.getElementById("post-keywords").value = "";
  document.getElementById("post-snippet").value = "";
  document.getElementById("post-url").value = "";
  document.getElementById("post-img-url").value = "";
  document.getElementById("post-lang").value = "en";
  document.getElementById("post-publish").value = CURRENT_DATE;
  document.getElementById("post-source").value = "";
  document.getElementById("post-categories").value = "general";
  document.getElementById("post-locale").value = "us";

  let data = {};
  if (title) data.title = title;
  if (desc) data.description = desc;
  if (keywords) data.keywords = keywords;
  if (snippet) data.snippet = snippet;
  if (url) data.url = url;
  if (img_url) data.image_url = img_url;
  if (lang) data.language = lang;
  if (publish) data.published_at = publish;
  if (source) data.source = source;
  if (categories) data.categories = categories;
  if (locale) data.locale = locale;

  // continue updating functions to match new localStorage structure
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/news',
    data: data,
    dataType: 'json',
    success: function(data) {
      console.log("POST /news success");

      $("#post-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.add("text-bg-success");
      noti.classList.remove("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "POST /news successful";
      document.getElementById("noti-body").innerHTML = JSON.stringify(data, null, 2);
      
      //add posted article to selected categories
      let json = JSON.parse(localStorage[data.locale]);
      for (let i = 0; i < data.categories.length; i++) {
        json[data.locale]["news"][data.categories[i]].push(data.article);
        displayNews(data.locale, data.categories[i]);
      }
      resizeCards();
      localStorage[data.locale] = JSON.stringify(json);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("POST /news error");

      $("#post-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.remove("text-bg-success");
      noti.classList.add("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "POST /news error";
      document.getElementById("noti-body").innerHTML = JSON.stringify(jqXHR.responseJSON, null, 2);
    }
  });

}

function changeData() {
  let noti = document.getElementById("noti");

  let uuid = document.getElementById("put-uuid").value;
  let title = document.getElementById("put-title").value;
  let desc = document.getElementById("put-desc").value;
  let keywords = document.getElementById("put-keywords").value;
  let snippet = document.getElementById("put-snippet").value;
  let url = document.getElementById("put-url").value;
  let img_url = document.getElementById("put-img-url").value;
  let lang = document.getElementById("put-lang").value;
  let publish = document.getElementById("put-publish").value;
  let source = document.getElementById("put-source").value;
  let categories = document.getElementById("put-categories").value;
  let locale = document.getElementById("put-locale").value;
  let oldcat = document.getElementById("put-oldcat").value;

  let data = {};
  if (title) data.title = title;
  if (desc) data.description = desc;
  if (keywords) data.keywords = keywords;
  if (snippet) data.snippet = snippet;
  if (url) data.url = url;
  if (img_url) data.image_url = img_url;
  if (lang) data.language = lang;
  if (publish) data.published_at = publish;
  if (source) data.source = source;
  if (categories) data.categories = categories;
  if (locale) data.locale = locale;  
  if (oldcat) data.old_categories = oldcat;

  $.ajax({
    type: 'PUT',
    url: 'http://localhost:3000/news/' + uuid,
    data: data,
    dataType: 'json',
    success: function(data) {
      console.log("PUT /news/<uuid> success");

      $("#put-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.add("text-bg-success");
      noti.classList.remove("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "PUT /news/<uuid> successful";
      document.getElementById("noti-body").innerHTML = JSON.stringify(data, null, 2);

      let givenLocale = "us";
      if (locale) givenLocale = locale;

      let bookmarks = JSON.parse(localStorage[givenLocale])["bookmarks"];
      let ind = bookmarks.findIndex((article) => article.uuid == uuid);
      if (ind != -1) { //bookmark needs to be updated
        bookmarks["title"] = title;
        bookmarks["description"] = desc;
        bookmarks["url"] = url;
        bookmarks["image_url"] = img_url;
      }

      let json = JSON.parse(localStorage[givenLocale]);
      for (let category in json["news"]) {
        json["news"][category] = [];
      }
      json["news"]["bookmarks"] = bookmarks;
      localStorage[givenLocale] = JSON.stringify(json);
      displayBookmarks();
      fetchAllNews();
      resizeCards();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("PUT /news/<uuid> error");

      $("#put-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.remove("text-bg-success");
      noti.classList.add("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "POST /news/<uuid> error";
      document.getElementById("noti-body").innerHTML = JSON.stringify(jqXHR.responseJSON, null, 2);
    }
  });
}

function deleteData() {
  let noti = document.getElementById("noti");

  let uuid = document.getElementById("del-uuid").value;
  let categories = document.getElementById("put-categories").value;

  let data = {};
  if (categories) data.categories = categories;

  $.ajax({
    type: 'DELETE',
    url: 'http://localhost:3000/news/' + uuid,
    data: data,
    dataType: 'json',
    success: function(data) {
      console.log("DELETE /news/<uuid> success");

      $("#del-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.add("text-bg-success");
      noti.classList.remove("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "DELETE /news/<uuid> successful";
      document.getElementById("noti-body").innerHTML = JSON.stringify(data, null, 2);

      if (data.affected_locale != "" && data.affected_categories.length > 0) {
        let locale = data.affected_locale;
        let json = JSON.parse(localStorage[locale]);

        let ind = json["news"]["bookmarks"].findIndex((article) => article.uuid == uuid);
        if (ind != -1) {
          json["news"]["bookmarks"].splice(ind, 1);
          displayBookmarks(locale);
        }
        for (let i = 0; i < data.affected_categories.length; i++) {
          let category = data.affected_categories[i];
          let ind = json["news"][category].findIndex((article) => article.uuid == uuid);
          if (ind != -1) {
            json["news"][category].splice(ind, 1);
            localStorage[locale] = JSON.stringify(json);
            displayNews(locale, category);
          }
        }
        resizeCards();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("DELETE /news/<uuid> error");

      $("#del-form").css("display", "none");
      noti.classList.add("show");
      noti.classList.remove("text-bg-success");
      noti.classList.add("text-bg-danger");
      document.getElementById("noti-header").innerHTML = "DELETE /news/<uuid> error";
      document.getElementById("noti-body").innerHTML = JSON.stringify(jqXHR.responseJSON, null, 2);
    }
  });
}

function showForm(formid, uuid="", category="") {
  if (formid != "post-form") $("#post-form").css("display", "none");
  if (formid != "put-form") $("#put-form").css("display", "none");
  if (formid != "del-form") $("#del-form").css("display", "none");
  $("#" + formid).css("display", "block");

  document.getElementById("post-publish").value = CURRENT_DATE;

  if (formid != "post-form") {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/news/' + uuid,
      data: { category: category },
      dataType: 'json',
      success: function(data) {
        if (formid == "put-form") {
          document.getElementById("put-uuid").value = data.uuid;
          document.getElementById("put-title").value = data.title;
          document.getElementById("put-desc").value = data.description;
          document.getElementById("put-keywords").value = data.keywords;
          document.getElementById("put-snippet").value = data.snippet;
          document.getElementById("put-url").value = data.url;
          document.getElementById("put-img-url").value = data.image_url;
          document.getElementById("put-lang").value = data.language;
          document.getElementById("put-publish").value = data.published_at;
          document.getElementById("put-source").value = data.source;
          document.getElementById("put-categories").value = data.categories;
          document.getElementById("put-locale").value = data.locale;
          document.getElementById("put-oldcat").value = data.categories;
        } else {
          document.getElementById("del-uuid").value = data.uuid;
          document.getElementById("del-categories").value = "all";
        }
      },
      error: function(jqXHR, textStatus, errorThrown) { //hopefully this should never happen or else I probably royally screwed up
        console.log("GET /news/<uuid> error");

        noti.classList.add("show");
        noti.classList.remove("text-bg-success");
        noti.classList.add("text-bg-danger");
        document.getElementById("noti-header").innerHTML = "GET /news/<uuid> error";
        document.getElementById("noti-body").innerHTML = JSON.stringify(jqXHR.responseJSON, null, 2);
      }
    });
  }
}

function closeForm(formid) {
  $("#" + formid).css("display", "none");
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

function initializeLocalStorage(locale) {
  localStorage[locale] = JSON.stringify({
    news: {
      bookmarks: []
    },
    weather: {},
    forex: {},
    details: {}
  });
}

$(document).ready(function() {
  let locale = "us";
  initializeLocalStorage(locale);
  initializeCategories();
  displayBookmarks(locale);
  fetchAllNews(locale); //check this to see if it works and if it doesn't idk cry or something
  resizeCards();
  addSpaceUnderNavbar();
  window.onresize = function() {
    resizeCards();
    addSpaceUnderNavbar();
  };
});