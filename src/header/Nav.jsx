// src/components/Nav.jsx
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

export default function Nav() {
  const navigate = useNavigate();

  // Use localStorage or your preferred method to check if the token exists
  const token = Cookies.get('token');
  console.log("Nav token " +token)

  return (
    <nav>
      <ul>
        {token ? <li><Link to="/">Home</Link></li> : null}
        {token ? <li><Link to="/videos">Videos</Link></li> : null}
        {token ? null : <li><Link to="/login">Login</Link></li>}
        {token ? null : <li><Link to="/register">Register</Link></li>}
        {token ?  <li><Link to="/logout">logout</Link></li> : null }
      </ul>
    </nav>
  );
}
