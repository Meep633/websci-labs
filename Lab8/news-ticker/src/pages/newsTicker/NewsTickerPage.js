import './NewsTickerPage.css';

import { useEffect, useState } from 'react';

import PostForm from '../../components/form/PostForm';
import PutForm from '../../components/form/PutForm';
import DeleteForm from '../../components/form/DeleteForm';
import DBForm from '../../components/form/DBForm';

import Notification from '../../components/notification/Notification';
import NewsTickerNavbar from '../../components/navbar/NewsTickerNavbar';

import Carousel from '../../components/carousel/Carousel';

import { getCurrentNews, postLatestNews } from '../../util/fetch';
import capitalize from '../../util/capitalize';
import { CATEGORIES, LOCALES } from '../../util/constants';

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

function NewsTickerPage({ newsLocale="us" }) {
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
  const [dbForm, updateDBForm] = useState(<></>);
  
  const openPostForm = () => {
    if (document.getElementById("post-form")) updatePostForm(<></>);
    if (document.getElementById("put-form")) updatePutForm(<></>);
    if (document.getElementById("del-form")) updateDeleteForm(<></>);
    if (document.getElementById("db-form")) updateDBForm(<></>);
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
    if (document.getElementById("db-form")) updateDBForm(<></>);
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
    if (document.getElementById("db-form")) updateDBForm(<></>);
    let form = <DeleteForm 
                article={article} 
                updateData={updateData} 
                updateForm={updateDeleteForm} 
                openNotification={openNotification}
               />;
    updateDeleteForm(form);
  };

  const openDBForm = () => {
    if (document.getElementById("post-form")) updatePostForm(<></>);
    if (document.getElementById("put-form")) updatePutForm(<></>);
    if (document.getElementById("del-form")) updateDeleteForm(<></>);
    if (document.getElementById("db-form")) updateDBForm(<></>);
    let form = <DBForm
                updateForm={updateDBForm}
                openNotification={openNotification}
               />;
    updateDBForm(form);
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
        if (!x) break; //TO DO: change output of fetchNews() to return an object {success: boolean, data: obj} and update data only after all articles for category are fetched
        page++;
      }
    };
    
    for (let i = 0; i < CATEGORIES.length; i++) {
      getCategoryNews({locale: newsLocale, category: CATEGORIES[i]});
    }
  }, []);

  return (
    <>
      <NewsTickerNavbar headers={headers} openPostForm={openPostForm} openDBForm={openDBForm} />
      <Carousel 
        key={"bookmarks"}
        data={data}
        locale={newsLocale}
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
              locale={newsLocale}
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
      {dbForm}
      {notification}
    </>
  );
}

export default NewsTickerPage;