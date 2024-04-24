import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { useEffect, useState } from 'react';

import PostForm from './components/form/PostForm';
import PutForm from './components/form/PutForm';
import DeleteForm from './components/form/DeleteForm';

import Notification from './components/notification/Notification';
import Navbar from './components/navbar/Navbar';

import Carousel from './components/carousel/Carousel';

import { getCurrentNews, postLatestNews } from './util/fetch';
import capitalize from './util/capitalize';

const CATEGORIES = ['business', 'entertainment', 'food', 'general', 'health', 'politics', 'science', 'sports', 'tech', 'travel'];
const LOCALES = ['ar', 'am', 'au', 'at', 'by', 'be', 'bo', 'br', 'bg', 'ca', 'cl', 'cn', 'co', 'hr', 'cz', 'ec', 'eg', 'fr', 'de', 'gr', 'hn', 'hk', 'in', 'id', 'ir', 'ie', 'il', 'it', 'jp', 'kr', 'mx', 'nl', 'nz', 'ni', 'pk', 'pa', 'pe', 'pl', 'pt', 'qa', 'ro', 'ru', 'sa', 'za', 'es', 'ch', 'sy', 'tw', 'th', 'tr', 'ua', 'gb', 'us', 'uy', 've'];


function initializeLocale() {
  let initData = {
    news: {},
    forex: [],
    weather: {},
    details: {}
  };
  initData.news.bookmarks = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    let category = CATEGORIES[i];
    initData.news[category] = [];
  }
  return initData;
}

function App() {
  let locale = "gb"; //making this initially, in the future user should be able to change this
  
  // Data is in format: { locale: { news: { category: [articles], ... }, forex: [], weather: {}, details: {} } }
  let initData = {};
  for (let i = 0; i < LOCALES.length; i++) {
    let locale = LOCALES[i];
    initData[locale] = initializeLocale();
  }
  // initData.us.news.general.push(testArticle);
  const [data, updateData] = useState(initData);
  
  // navbar headers
  let headers = [{id: "bookmarks", name: "Bookmarks"}];
  for (let i = 0; i < CATEGORIES.length; i++) {
    let category = CATEGORIES[i];
    headers.push({
      id: category, 
      name: capitalize(category)
    });
  }

  // notification
  const [notification, updateNotification] = useState(<></>);
  const openNotification = ({heading, body, show, success}) => {
    if (document.getElementById("noti")) updateNotification(<></>);
    let noti = (
      <Notification 
        heading={heading} 
        body={body} 
        show={show} 
        success={success}
        updateNotification={updateNotification}
      />
    );
    updateNotification(noti);
  };

  // bookmark function for articles, putting this here so that updateData is in scope and i don't 
  // have to pass it through a million components again
  const bookmarkArticle = (article) => {
    updateData((prevData) => { //for some reason this updates all bookmarks if you only do one category??
      let newData = {...prevData};
      let ind = newData[article.locale].news[article.categories[0]].findIndex((a) => a.uuid === article.uuid);
      if (ind === -1) {
        openNotification({
          heading: "Bookmark error",
          body: "Article with uuid '" + article.uuid + "' not found in category '" + article.categories[0] + "' despite it being in that category",
          show: true,
          success: false
        });
        return newData;
      }
      let a = newData[article.locale].news[article.categories[0]][ind];
      a.bookmarked = !a.bookmarked;
      if (a.bookmarked) {
        // add to bookmarks
        newData[article.locale].news.bookmarks.push(article);
      } else {
        // remove from bookmarks
        let ind = newData[article.locale].news.bookmarks.findIndex((a) => a.uuid === article.uuid);
        if (ind !== -1) newData[article.locale].news.bookmarks.splice(ind,1);
      }

      return newData;
    });
  }
  
  // forms
  const [postForm, updatePostForm] = useState(<></>);
  const [putForm, updatePutForm] = useState(<></>);
  const [deleteForm, updateDeleteForm] = useState(<></>);
  
  const openPostForm = () => {
    if (document.getElementById("post-form")) updatePostForm(<></>);
    if (document.getElementById("put-form")) updatePutForm(<></>);
    if (document.getElementById("del-form")) updateDeleteForm(<></>);
    let form = <PostForm 
                updateData={updateData} //update data object
                updateForm={updatePostForm} //update the form itself to control whether or not it shows on page
                openNotification={openNotification} //update notification with success/error message
               />;
    updatePostForm(form);
  }

  const openPutForm = (article) => {
    if (document.getElementById("post-form")) updatePostForm(<></>);
    if (document.getElementById("put-form")) updatePutForm(<></>);
    if (document.getElementById("del-form")) updateDeleteForm(<></>);
    let form = <PutForm 
                article={article} 
                updateData={updateData} 
                updateForm={updatePutForm} 
                openNotification={openNotification}
               />;
    updatePutForm(form);
  };
  
  const openDeleteForm = (article) => {
    if (document.getElementById("post-form")) updatePostForm(<></>);
    if (document.getElementById("put-form")) updatePutForm(<></>);
    if (document.getElementById("del-form")) updateDeleteForm(<></>);
    let form = <DeleteForm 
                article={article} 
                updateData={updateData} 
                updateForm={updateDeleteForm} 
                openNotification={openNotification}
               />;
    updateDeleteForm(form);
  };
  
  useEffect(() => {
    const fetchNews = async ({locale, category, limit, page}) => {
      let response = await getCurrentNews({locale: locale, category: category, limit: limit, page: page});
      
      if (!response.success || response.output.length === 0) { //no news stored, try posting latest news and getting that
        response = await postLatestNews({locale: locale, category: category, num_articles: limit});
        if (!response.success) {
          openNotification({
            heading: "Fetch news error", 
            body: response.error,
            show: true,
            success: false
          });
          return false;
        }
      }

      updateData((prevData) => {
        let newData = {...prevData};
        for (let i = 0; i < response.output.length; i++) {
          for (let j = 0; j < response.output[i].categories.length; j++) {
            let categoryArticles = newData[locale].news[response.output[i].categories[j]];
            if (categoryArticles.findIndex((a) => a.uuid === response.output[i].uuid) === -1) { //dont add dupes
              newData[locale].news[response.output[i].categories[j]].push(response.output[i]);
            }
          }
        }
        return newData;
      });
      return true;
    };
    
    const getCategoryNews = async ({locale, category}) => {
      let page = 1;
      while (data[locale].news[category].length < 20) {
        let x = await fetchNews({locale: locale, category: category, limit: 5, page: page});
        if (!x) break;
        page++;
      }
    };
    
    // getCategoryNews({locale: locale, category: "business"});
    for (let i = 0; i < CATEGORIES.length; i++) {
      getCategoryNews({locale: locale, category: CATEGORIES[i]});
    }
  }, []);

  return (
    <>
      <Navbar headers={headers} openPostForm={openPostForm} />
      <Carousel 
        key={"bookmarks"}
        data={data}
        locale={locale}
        category={"bookmarks"}
        bookmarkFunc={bookmarkArticle}
        openPutForm={openPutForm}
        openDeleteForm={openDeleteForm}
      />
      {
        CATEGORIES.map((category) => {
          return (
            <Carousel 
              key={category}
              data={data} 
              locale={locale} 
              category={category} 
              bookmarkFunc={bookmarkArticle} 
              openPutForm={openPutForm} 
              openDeleteForm={openDeleteForm} 
            />
          );
        })
      }
      {postForm}
      {putForm}
      {deleteForm}
      {notification}
      {/* <Article 
        article={data.us.news.general[0]}
        bookmarkFunc={bookmarkArticle}
        editFunc={openPutForm}
        deleteFunc={openDeleteForm}
      />
      {postForm}
      {putForm}
      {deleteForm}
      {notification} */}
    </>
  );
}

// <>
//   <input type="text" id="input" defaultValue="us" />
//   <button onClick={() => {func(document.getElementById("input").value)}}>Fetch News</button>
//   {
//     response.constructor === Array && response.map((article) => <div>{article.uuid}</div>)
//   }
//   {
//     response.constructor != Array && <div>{response}</div>
//   }
// </>

export default App;

/*
how data is stored:
 
  data = {
    locale: {
      news: {
        category: [
          {
            uuid: "",
            title: "",
            ...
          },
          ...
        ]
      },
      details: {...},
      weather: {...},
      forex: {...}
    }
  }

*/