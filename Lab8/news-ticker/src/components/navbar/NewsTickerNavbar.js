import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function NewsTickerNavbar({headers, openPostForm, openDBForm}) {
  let navbarHeaders = headers.map((header) => {
    return (
      <li key={header.id} className="nav-item">
        <a className="nav-link" href={"#" + header.id}>{header.name}</a>
      </li>
    );
  });

  return (
    <>
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
        <div className="container-fluid">
          <ul className="navbar-nav container-fluid d-flex justify-content-between">
            <li className="navbar-nav">
              {navbarHeaders}
            </li>
            <li className="nav-item">
              <button className="btn btn-light me-1" onClick={openDBForm}>DB</button>
              <button className="btn btn-light" onClick={openPostForm}><FontAwesomeIcon icon={faPlus} className="icon" /></button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NewsTickerNavbar;