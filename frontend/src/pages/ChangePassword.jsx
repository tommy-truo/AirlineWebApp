import React, { useState } from 'react';

function ChangePassword({ accountId, onSuccess }) {

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setMessage('');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          newPassword: password
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully.");
        setError('');
        onSuccess(); // redirect after success
      } else {
        setError(data.message);
        setMessage('');
      }

    } catch (err) {
      console.error(err);
      setError("Error updating password.");
      setMessage('');
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2>Change Your Password</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          className="form-control mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="form-control mb-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="btn btn-danger">Update Password</button>
      </form>
    </div>
  );
}

export default ChangePassword;