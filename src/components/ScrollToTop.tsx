import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // when the route changes, scroll to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // this component renders nothing
}
