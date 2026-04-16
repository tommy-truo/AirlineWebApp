/* Abhishek Singh */
import React, { useState } from 'react';
import './SignUp.css';

const SignUp = ({ onSignupSuccess, onSwitch }) => {
  const [form, setForm] = useState({            // Form Fields
    firstName: '',
    middleInitial: '',
    lastName: '',
    dob: '',
    gender:'',
    email: '',
    password: '',
    confirmPassword: '',
    isLoyaltyMember: false
  });

  const [errors, setErrors] = useState({}); // State for real-time errors

  const validateField = (id, value) => {
    let error = "";


    if (id === 'password') {
      if (!passwordStrength.test(value)) error = "Password must be 8 characters long and must include letters and numbers.";
    }

    if (id === 'confirmPassword') {
      if (value !== form.password) error = "Passwords do not match.";
    }

    if (id === 'dob') {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) error = "You must be at least 18 years old.";
    }

    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleChange = (e) => {                 //handlechange
    const { id, type, checked, value } = e.target;
    
    let val = type === 'checkbox' ? checked : value;  // Checkbox value

    if(id === 'firstName'|| id === 'lastName'){
      val=val.replace(/[^a-zA-Z\s-]/g, '');
    }
    
    if (id==='middleInitial'){
      val=val.charAt(0).toUpperCase().replace(/[^A-Z]/g, '');
    }

    setForm({ ...form, [id]: val });
    validateField(id, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) return;

    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match!"); 
      return;
    }


    console.log("Sending signup data to Render...", form);

    try {
      const res = await fetch('https://airlinewebapp.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      
      if (res.ok) {
        alert("Account created!"); 
        onSignupSuccess(result); 
      } else {
        alert(result.message || "Signup failed");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert("Is the backend running?");
    }
};

  return (                                            //page layout
    <div className='login-page'>
      <div className="light-red-page">
        <nav className="navbar navbar-expand-lg navbar-light-red">
          <div className="container-fluid">
            <a className="navbar-brand brand-text" href="#">
              <img src="acmelogo.png" alt="logo" className="navbar-logo me-2" />
              ACME Airlines
            </a>
          </div>
        </nav>
      </div>

      <div className='form-wrapper'>
        <div className='signup-container'>
          <form onSubmit={handleSubmit}>
            <h2 className='form-title'>Create an Account</h2>

            
            <div className='form-field'>
              <label>First Name</label>
              <input type='text' id='firstName' value={form.firstName} onChange={handleChange} placeholder='First Name' maxLength="50" required />
            </div>

            <div className='form-field'>
              <label>Middle Initial</label>
              <input type='text' id='middleInitial' value={form.middleInitial} onChange={handleChange} placeholder='Middle Initial' maxLength="1" />
            </div>

            <div className='form-field'>
              <label>Last Name</label>
              <input type='text' id='lastName' value={form.lastName} onChange={handleChange} placeholder='Last Name' maxLength="50" required />
            </div>


            <div className='form-field'>
              <label>Birthday</label>
              <input type='date' id='dob' value={form.dob} onChange={handleChange} required />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>


            <div className='form-field'>
              <label htmlFor='gender'>Gender</label>
              <select id='gender' value={form.gender} onChange={handleChange} required>
                <option value="" disabled>Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="X">Non-Binary</option>
                <option value="U">Prefer not to say</option>
              </select>           
              </div>

            <div className='form-field'>
              <label>Email</label>
              <input type='email' id='email' value={form.email} onChange={handleChange} placeholder='Email' required />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

           
            <div className='form-field'>
              <label>Password</label>
              <input type='password' id='password' value={form.password} onChange={handleChange} placeholder='Min 8 characters' required />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className='form-field'>
              <label>Confirm Password</label>
              <input type='password' id='confirmPassword' value={form.confirmPassword} onChange={handleChange} placeholder='Confirm Password' required />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <div className='loyalty-field'>
              <input 
                type='checkbox' 
                id='isLoyaltyMember' 
                checked={form.isLoyaltyMember} 
                onChange={handleChange} 
              />
              <label htmlFor='isLoyaltyMember' style={{ cursor: 'pointer' }}>Join loyalty program</label>
            </div>

            <button type="submit" className="login-button">Sign Up</button>

            <div className='sign-in'>
              <p>
                Already have an account?{' '}
                <button type="button" onClick={onSwitch} className="switch-btn">
                  Sign In.
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;