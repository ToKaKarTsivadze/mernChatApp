import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import "./messageForm.css";
import { AppContext } from "../context/appContext";
import CryptoJS from "crypto-js";
import { DecryptVigenere, EncryptVigenere } from "./vigenere";

export default function MessageForm() {
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user);
  const { socket, currentRoom, setMessages, messages, privateMemberMsg } =
    useContext(AppContext);

  const messageEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : "0" + day;
    // return year + "/" + month + "/" + day;
    return day + "/" + month + "/" + year;
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const todayDate = getFormattedDate();

  const encrypt = (value) => {
    let key;
    if (value.length < 3) {
      key = value[0] + value[0] + value[0];
    } else {
      key = value.slice(0, 3);
    }
    let vigenere = EncryptVigenere(value, key);
    let aes = CryptoJS.AES.encrypt(vigenere, key).toString();

    let encryptedValue =
      aes.slice(0, 3) +
      key[0] +
      aes.slice(3, 6) +
      key[1] +
      aes.slice(6, 8) +
      key[2] +
      aes.slice(8, -1) +
      aes.slice(-1);
    return encryptedValue;
  };

  const decrypt = (value) => {
    let key = value[3] + value[7] + value[10];
    let newValue =
      value.slice(0, 3) +
      value.slice(4, 7) +
      value.slice(8, 10) +
      value.slice(11, -1) +
      value.slice(-1);
    let aesDecrypt = CryptoJS.AES.decrypt(newValue, key).toString(
      CryptoJS.enc.Utf8
    );
    return DecryptVigenere(aesDecrypt, key);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return;

    const today = new Date();
    const minutes =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;
    socket.emit(
      "message-room",
      roomId,
      encrypt(message),
      user,
      time,
      todayDate
    );
    setMessage("");
  };

  socket.off("room-messages").on("room-messages", (roomMessages) => {
    console.log("roomMessages", roomMessages);
    setMessages(roomMessages);
  });

  return (
    <>
      <div className="message-output">
        {user && !privateMemberMsg?._id && (
          <div className="alert alert-info">
            {" "}
            you are in the {currentRoom} room{" "}
          </div>
        )}
        {user && privateMemberMsg?._id && (
          <>
            <div className="alert alert-info conversation-info">
              <span>
                Your conversation with {privateMemberMsg.name}{" "}
                <img
                  src={privateMemberMsg.picture}
                  className="conversation-profile-picture"
                />
              </span>
            </div>
          </>
        )}

        {!user && <div className="alert alert-danger">please login</div>}

        {user &&
          messages.map(({ _id: date, messagesByDate }, idx) => (
            <div key={idx}>
              <p className="alert alert-info text-center message-date-indicator">
                {" "}
                {date}{" "}
              </p>

              {messagesByDate?.map(({ content, time, from: sender }, idx) => (
                <div
                  className={
                    sender?.email == user?.email
                      ? "outgoing-message"
                      : "message"
                  }
                  key={idx}
                >
                  <div className="message-inner">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={sender.picture}
                        style={{
                          width: 35,
                          height: 35,
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginRight: 10,
                        }}
                      />
                      <p className="message-sender">
                        {" "}
                        {sender._id == user?._id ? "You" : sender.name}{" "}
                      </p>
                    </div>
                    <p className="message-content ">{content}</p>
                    <p className="message-timestamp-left"> {time} </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={11}>
            <Form.Group>
              <Form.Control
                disabled={!user}
                value={message}
                type="text  "
                placeholder="Your message.."
                onChange={(e) => setMessage(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button
              disabled={!user}
              variant="primary"
              type="submit"
              style={{ width: "100%", backgroundColor: "orange" }}
            >
              <i className="fas fa-paper-plane"> </i>
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}
