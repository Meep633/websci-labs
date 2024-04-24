import axios from 'axios';

async function getCurrentNews({locale, category, limit, page}) {
  let params = {};
  if (locale) params.locale = locale;
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (page) params.page = page;

  try {
    let response = await axios.get("/news", {
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
    let response = await axios.post("/news/latest", params);
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
    let response = await axios.post("/news", params);
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
    let response = await axios.put("/news/" + uuid, params);
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
    let response = await axios.delete("/news/" + uuid, {
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

async function getDB({path}) {
  try {
    let response = await axios.get("/db/" + path);
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

async function postDB({path, params}) {
  try {
    let response = await axios.post("/db/" + path, params);
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

async function putDB({path, params}) {
  try {
    let response = await axios.put("/db/" + path, params);
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

async function deleteDB({path}) {
  try {
    let response = await axios.delete("/db/" + path);
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

async function getNBA({path}) {
  try {
    let response = await axios.get("/nba/" + path);
    return {
      success: true,
      output: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.error
    }
  }
}

async function postNBA({path, params}) {
  try {
    let response = await axios.post("/nba/" + path, params);
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

async function putNBA({path, params}) {
  try {
    let response = await axios.put("/nba/" + path, params);
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

async function deleteNBA({path}) {
  try {
    let response = await axios.delete("/nba/" + path);
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

export {
  getCurrentNews, postLatestNews, postNews, putNews, deleteNews, 
  getDB, postDB, putDB, deleteDB, 
  getNBA, postNBA, putNBA, deleteNBA
};
