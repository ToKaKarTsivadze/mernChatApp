import React, { useContext, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useLoginUserMutation } from '../services/appApi'
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { AppContext } from "../context/appContext";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    const {socket} = useContext(AppContext)

    const [ loginUser, {isLoading, error} ] = useLoginUserMutation()

    const  handldeLogin = (e) => {
    e.preventDefault()
    //login logic
    loginUser({email, password}).then(({data}) => {
      if(data){
        //socket work
        socket.emit('new-user')
        //navigate to the chat
        navigate('/chat')
        console.log('logged in')
      }
    } )
  }



  return (
    <Container>
      <Row>
        <Col md={5} className="login_bg"></Col>
        <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column" >
          
          <Form style={{ width: "80%", maxWidth: "500px" }} onSubmit={handldeLogin}>
          {error && <p className="alert alert-danger" > {error.data} </p>}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {isLoading ? <Spinner animation="grow"/> : 'login'}
            </Button>
            <div className="py-4">
              <p className="text-center">
                Dont have an account? <Link to={"/signup"}>Signup</Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
