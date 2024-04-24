import './carousel.css';
import Article from '../article/Article';
import capitalize from '../../util/capitalize';

// updateData is used to update the data object containing all stuff about what has been fetched from the api
function Slide({active, category, articleData, bookmarkFunc, openPutForm, openDeleteForm}) {
  let activeClass = active ? "active" : "";
  let articleComponents = articleData.map((article) => {
    return (
      <Article 
        key={category + "-" + article.uuid}
        article={article} 
        bookmarkFunc={(article) => {bookmarkFunc(article)}}
        editFunc={(article) => {openPutForm(article);}}
        deleteFunc={(article) => {openDeleteForm(article)}} 
      />
    );
  });

  return (
    <div className={"carousel-item " + activeClass}>
      <div className="row">{articleComponents}</div>
    </div>
  );
}

// locale and category used to get articles in data.locale.news.category
// updateData updates main data object
// openPutForm and openDeleteForm are passed into all articles so that they can open/close forms with buttons
function Carousel({data, locale, category, bookmarkFunc, openPutForm, openDeleteForm}) {
  let slides = []; // may need to make this a state
  for (let i = 0; i < data[locale].news[category].length; i+=5) {
    let active = i === 0;
    let articleData = [];
    for (let j = i; j < i+5 && j < data[locale].news[category].length; j++) {
      articleData.push(data[locale].news[category][j]);
    }
    slides.push((
      <Slide 
        key={category + "-" + i} 
        active={active} 
        category={category}
        articleData={articleData} 
        bookmarkFunc={bookmarkFunc} 
        openPutForm={openPutForm} 
        openDeleteForm={openDeleteForm} 
      />
    ));
  }
  return (
    <div className="container-fluid">
      <h1 className="m-3">{capitalize(category)}</h1>
      <div id={category} className="carousel slide m-2" data-bs-ride="carousel">
        <div className="carousel-inner">{slides}</div>
        <button className="carousel-control-prev" type="button" data-bs-target={"#" + category} data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target={"#" + category} data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
}

export default Carousel;