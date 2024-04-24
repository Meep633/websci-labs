function NBAStatsNavbar({openNBAForm, openNotification, dataLoaded}) {
  const handleClick = () => {
    if (dataLoaded) {
      openNBAForm();
    } else {
      openNotification({
        heading: "Error",
        body: "Please wait until data visualization has loaded before using the form (will cause some mongo connection error otherwise)",
        show: true,
        success: false
      });
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
        <div className="container-fluid">
          <ul className="navbar-nav container-fluid d-flex justify-content-between">
            <li className="nav-item">
              <button className="btn btn-light me-1" onClick={handleClick}>NBA</button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NBAStatsNavbar;