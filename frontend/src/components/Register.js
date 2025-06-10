import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import TwitterLogo from './TwitterLogo';
import './Register.css';

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $username: String!, $password: String!) {
    register(name: $name, email: $email, username: $username, password: $password) {
      id
      name
      email
      username
      token
    }
  }
`;

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [register, { loading, error }] = useMutation(REGISTER);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ variables: { ...form } });
      setForm({ name: '', email: '', username: '', password: '' });
      navigate('/login'); // Redirect to login page after successful registration
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <TwitterLogo style={{ marginBottom: 32, marginTop: 40 }} />
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div>
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && <p className="register-error">{error.message}</p>}
      </div>
      <div className="register-login">
        <p>Already have an account? <Link to="/login" className="register-link">Login here</Link></p>
      </div>
    </>
  );
};

export default Register;