import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

function MainNavbar() {
  return (
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
      <div className="container-fluid">
        <ul className="navbar-nav container-fluid d-flex justify-content-between">
          <div className="navbar-nav">
            <li className="nav-item me-3">
              <Link to={"/"}>News Tickers</Link>
            </li>
            <li className="nav-item">
              <Link to={"/nbastats"}>NBA Stats</Link>
            </li>
          </div>
          <a className="nav-item" href="https://github.com/RPI-ITWS/itws4500-zuhays/blob/main/Lab8/api_documentation.md" target="_blank" rel="noreferrer">
            API Documentation <FontAwesomeIcon icon={faUpRightFromSquare} />
          </a>
        </ul>
      </div>
    </nav>
  );
}

export default MainNavbar;