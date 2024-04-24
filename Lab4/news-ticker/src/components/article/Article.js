import './article.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

function CardImg({img_url, alt}) {
  return <img className="card-img-top" src={img_url} alt={alt}/>;
}

function CardTitle({title, url}) {
  return (
    <div className="card-title text-bg-primary p-1">
      <a className="text-white" href={url} target="_blank" rel="noreferrer">{title}</a>
    </div>
  );
}

function CardDescription({description}) {
  return <div className="card-text text-bg-secondary p-1">{description}</div>;
}

function CardFooter({article, updateArticle, bookmarkFunc, editFunc, deleteFunc}) {
  return (
    <div className="card-footer p-1 d-grid">
      <BookmarkButton article={article} onClick={bookmarkFunc} />
      <EditButton article={article} onClick={editFunc} />
      <DeleteButton article={article} onClick={deleteFunc} />
    </div>
  );
}

function BookmarkButton({article, onClick}) {
  const handleClick = () => {
    onClick(article);
  };
  if (article.bookmarked) {
    return <button className="btn btn-light btn-block" onClick={handleClick}><FontAwesomeIcon icon={faStar} className="bookmarked icon" /></button>;
  }
  return <button className="btn btn-light btn-block" onClick={handleClick}><FontAwesomeIcon icon={faStar} className="icon" /></button>;
}

function EditButton({article, onClick}) {
  const handleClick = () => {
    onClick(article);
  };
  return <button className="btn btn-light btn-block" onClick={handleClick}><FontAwesomeIcon icon={faPenToSquare} className="icon" /></button>;
}

function DeleteButton({article, onClick}) {
  const handleClick = () => {
    onClick(article);
  };
  return <button className="btn btn-light btn-block" onClick={handleClick}><FontAwesomeIcon icon={faTrashCan} className="icon" /></button>
}

// data contains all the data about an article that would be given from an API request
function Article({article, bookmarkFunc, editFunc, deleteFunc}) {
  return (
    <div className={"card col-sm " + article.uuid}>
      <div className="card-body">
        <CardImg img_url={article.image_url} alt={article.title} />
        <CardTitle title={article.title} url={article.url} />
        <CardDescription description={article.description} />
        <CardFooter 
          article={article}
          bookmarkFunc={bookmarkFunc} 
          editFunc={editFunc}
          deleteFunc={deleteFunc}
        />
      </div>
    </div>
  );
}

export default Article;