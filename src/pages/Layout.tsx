import { Link, Outlet, useLocation } from 'react-router-dom';
import IconCalendar from '../icons/IconCalendar';
import IconChevronLeft from '../icons/IconChevronLeft';

export const Layout = () => {
  return (
    <>
      <HomeHeader />
      <Outlet />
      <footer>
        <div className="credits">
          Arrow Up/Down by Design Effectz from the Noun Project
        </div>
      </footer>
    </>
  );
};

const HomeHeader = () => {
  const { pathname } = useLocation();

  return (
    <header>
      <h1>
        {pathname === '/' ? (
          <IconCalendar />
        ) : (
          <Link to="/">
            <IconChevronLeft />
          </Link>
        )}
        Calendar Widget
      </h1>
    </header>
  );
};
