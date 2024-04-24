import axios from 'axios';

async function getCurrentNews({locale, category, limit, page}) {
  let params = {};
  if (locale) params.locale = locale;
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (page) params.page = page;

  try {
    let response = await axios.get("http://localhost:3000/news", {
      params: params
    });
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    };
  }
}

async function postLatestNews({locale, category, num_articles}) {
  let params = {};
  if (locale) params.locale = locale;
  if (category) params.category = category;
  if (num_articles) params.num_articles = num_articles;

  try {
    let response = await axios.post("http://localhost:3000/news/latest", params);
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    };
  }
}

async function postNews({title, description, keywords, snippet, url, image_url, language, published_at, source, categories, locale}) {
  let params = {};
  if (title) params.title = title;
  if (description) params.description = description;
  if (keywords) params.keywords = keywords;
  if (snippet) params.snippet = snippet;
  if (url) params.url = url;
  if (image_url) params.image_url = image_url;
  if (language) params.language = language;
  if (published_at) params.published_at = published_at;
  if (source) params.source = source;
  if (categories) params.categories = categories;
  if (locale) params.locale = locale;

  try {
    let response = await axios.post("http://localhost:3000/news", params);
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    };
  }
}

async function putNews({uuid, title, description, keywords, snippet, url, image_url, language, published_at, source, categories, locale, old_categories, old_locale}) {
  let params = {};
  if (title) params.title = title;
  if (description) params.description = description;
  if (keywords) params.keywords = keywords;
  if (snippet) params.snippet = snippet;
  if (url) params.url = url;
  if (image_url) params.image_url = image_url;
  if (language) params.language = language;
  if (published_at) params.published_at = published_at;
  if (source) params.source = source;
  if (categories) params.categories = categories;
  if (locale) params.locale = locale;
  if (old_categories) params.old_categories = old_categories;
  if (old_locale) params.old_locale = old_locale;

  try {
    let response = await axios.put("http://localhost:3000/news/" + uuid, params);
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    };
  }
}

async function deleteNews({uuid, locale, categories}) {
  let params = {};
  if (locale) params.locale = locale;
  if (categories) params.categories = categories;

  try {
    let response = await axios.delete("http://localhost:3000/news/" + uuid, {
      data: params
    });
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    };
  }
}

// figure out what useEffect is and use that to do these api calls in react and update elements

export {getCurrentNews, postLatestNews, postNews, putNews, deleteNews};