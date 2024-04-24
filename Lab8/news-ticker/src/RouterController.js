import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import NewsTickerPage from './pages/newsTicker/NewsTickerPage';
import DataVis from './pages/dataVis/DataVis';
import MainNavbar from './components/navbar/MainNavbar';

function RouterController() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <MainNavbar />
            <Outlet /> {/* makes sure routes under this get rendered */}
          </>
        }>
          <Route index element={<NewsTickerPage />} />
          <Route path="/nbastats" element={<DataVis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RouterController;