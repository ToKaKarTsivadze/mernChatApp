import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSignupUserMutation } from '../services/appApi'
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./signup.css";
import botImg from "../assets/bot.png";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupUser, { isLoading, error }] = useSignupUserMutation()
  const navigate = useNavigate();

  //image upload state
  const [image, setImage] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const validateImg = (e) => {
    const file = e.target.files[0];
    if (file.size >= 1048576) {
      return alert("Max file size is 1MB");
    } else {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function uploadImage() {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "pbst63f9");
    try {
      setUploadingImg(true);
      let res = await fetch(
        "https://api.cloudinary.com/v1_1/dmkvjc0xm/image/upload",
        {
          method: "post",
          body: data,
        }
      );
      const urlData = await res.json();
      setUploadingImg(false);
      return urlData.url;
    } catch (error) {
      setUploadingImg(false);
      console.log(error);
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!image) return alert("please upload your profile picture");
    const url = await uploadImage(image);
    console.log(url);
    //sign up the user
    signupUser({name, email, password, picture: url }).then(({data})=>{
      if(data){
        console.log(data)
        navigate('/chat')
      }
    })
  };


  return (
    <Container>
      <Row>
        <Col
          md={7}
          className="d-flex align-items-center justify-content-center flex-direction-column"
        >
          <Form
            style={{ width: "80%", maxWidth: "500px" }}
            onSubmit={handleSignup}
          >
            <h1 className="text-center">Create accaunt</h1>
            <div className="signup-profile-pic_containet">
              <img
                src={imagePreview || botImg}
                className="signup-profile-pic"
              ></img>
              <label htmlFor="image-upload" className="image-upload-label">
                <input
                  type="file"
                  id="image-upload"
                  hidden
                  accept="image/png, image/jpeg"
                  onChange={validateImg}
                ></input>
                <i className="fas fa-plus-circle add-picture-icon"></i>
              </label>
            </div>
            {error && <p className="alert alert-danger" > {error.data} </p>}
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                id="123"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
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
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {uploadingImg || isLoading ? "signing you up...  " : "Create accaunt"}
            </Button>
            <div className="py-4">
              <p className="text-center">
                Already have an account? <Link to={"/login"}>login</Link>
              </p>
            </div>
          </Form>
        </Col>
        <Col md={5} className="signup_bg"></Col>
      </Row>
    </Container>
  );
}
