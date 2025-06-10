import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../UserContext';
import TwitterLogo from './TwitterLogo';
import './Login.css';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      username
      avatar
      token
    }
  }
`;

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [loginMutation, { loading, error }] = useMutation(LOGIN);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({ variables: { ...form } });
      login(data.login);
      navigate('/'); // Redirect to the homepage after login
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <TwitterLogo style={{ marginBottom: 32, marginTop: 40 }} />
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="login-input"
          />
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="login-error">{error.message}</p>}
        <div className="login-register">
          <p>Don't have an account? <Link to="/register" className="login-link">Register here</Link></p>
        </div>
      </div>
    </>
  );
};

export default Login;