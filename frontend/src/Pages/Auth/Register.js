// SignupPage.js
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./auth.css";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerAPI } from "../../utils/ApiRequest";
import axios from "axios";

const Register = () => {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(localStorage.getItem('user')){
      navigate('/');
    }
  }, [navigate]);

  const [values, setValues] = useState({
    name : "",
    email : "",
    password : "",

  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  }

  const handleChange = (e) => {
    setValues({...values , [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

      const {name, email, password} = values;

      if (!name || !email || !password) {
        toast.error("All fields are required!", toastOptions);
        return;
      }
  
      setLoading(true);
  
      try {
        const { data } = await axios.post(registerAPI, {
          name,
          email,
          password
        });
  
        if (data.success) {
          delete data.user.password;
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success(data.message, toastOptions);
          navigate("/");
        } else {
          toast.error(data.message, toastOptions);
        }
      } catch (error) {
        toast.error("Registration failed. Please try again.", toastOptions);
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
    <div className="d-flex align-items-center justify-content-center vh-100">
      <Container className="text-center">
      <Row>
        <h1>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white"}} />
        </h1>
        <h1 className="text-center text-white">Welcome to Expense Management System</h1>
        <Col md={6} className="mx-auto">
          <h2 className="text-white mt-5" >Registration</h2>
          <Form>
            <Form.Group controlId="formBasicName" className="mt-3" >
              <Form.Label className="text-white text-start w-100">Name</Form.Label>
              <Form.Control type="text"  name="name" placeholder="Full name" value={values.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formBasicEmail" className="mt-3">
              <Form.Label className="text-white text-start w-100">Email address</Form.Label>
              <Form.Control type="email"  name="email" placeholder="Enter email" value={values.email} onChange={handleChange}/>
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mt-3">
              <Form.Label className="text-white text-start w-100">Password</Form.Label>
              <Form.Control type="password"  name="password" placeholder="Password" value={values.password} onChange={handleChange} />
            </Form.Group>
            <div style={{width: "100%", display: "flex" , alignItems:"center", justifyContent:"center", flexDirection: "column"}} className="mt-4">
              <Link to="/forgotPassword" className="text-white lnk" >Forgot Password?</Link>

              <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Signup"}
                </Button>

              <p className="mt-3" style={{color: "#9d9494"}}>Already have an account? <Link to="/login" className="text-white lnk" >Login</Link></p>
            </div>
          </Form>
        </Col>
      </Row>
    <ToastContainer />
    </Container>
    </div>
    </>
  );
}

export default Register