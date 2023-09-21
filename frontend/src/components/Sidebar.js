import React, { useContext, useEffect } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import "./sidebar.css";

export default function Sidebar() {
  const user = useSelector((state) => state.user);
  const dispach = useDispatch();
  const {
    socket,
    setMembers,
    members,
    setCurrentRoom,
    setRooms,
    privateMemberMsg,
    rooms,
    setPrivateMemberMsg,
    currentRoom,
  } = useContext(AppContext);

  const joinRoom = (room, isPublic = true) => {
    if (!user) {
      return alert("Please log in");
    }
    socket.emit("join-room", room, currentRoom);
    setCurrentRoom(room);
    if (isPublic) {
      setPrivateMemberMsg(null);
    }
    //dispach for notifications

    dispach(resetNotifications(room));
  };

  socket.off("notifications").on("notifications", (room) => {
    if (currentRoom != room) dispach(addNotifications(room));
  });

  useEffect(() => {
    if (user) {
      setCurrentRoom("general");
      getRooms();
      socket.emit("join-room", "general");
      socket.emit("new-user");
    }
  }, []);

  socket.off("new-user").on("new-user", (payload) => {
    console.log(payload);
    setMembers(payload);
  });

  const getRooms = () => {
    fetch("http://localhost:5001/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  };

  const orderIds = (id1, id2) => {
    if (id1 > id2) {
      return id1 + "-" + id2;
    } else {
      return id2 + "-" + id1;
    }
  };

  const handlePrivateMemberMsg = (member) => {
    setPrivateMemberMsg(member);
    const roonId = orderIds(user._id, member._id);
    joinRoom(roonId, false);
  };

  if (!user) {
    return <>Available rooms will appear here</>;
  }

  return (
    <>
      <h2>Available rooms</h2>
      <ListGroup>
        {rooms.map((room, idx) => (
          <ListGroup.Item
            key={idx}
            onClick={() => joinRoom(room)}
            active={room == currentRoom}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {room}{" "}
            {currentRoom !== room && (
              <span className="badge rounded-pill bg-primary">
                {user.newMessages[room]}
              </span>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <h2>Members</h2>
      <ListGroup>
        {members.map((member) => {
          return (
            <ListGroup.Item
              key={member.id}
              style={{ cursor: "pointer" }}
              active={privateMemberMsg?._id == member?._id}
              onClick={() => handlePrivateMemberMsg(member)}
              disabled={member._id === user._id}
            >
              <Row>
                <Col xs={2} className="member-status">
                  <img src={member.picture} className="member-status-img"></img>
                  {member.status == "online" ? (
                    <i className="fas fa-circle sidebar-online-status"> </i>
                  ) : (
                    <i className="fas fa-circle sidebar-offlile-status"></i>
                  )}
                </Col>
                <Col xs={9}>
                  {member.name}
                  {member._id === user?._id && " (You)"}

                  {member.status == "online" &&
                    member._id !== user?._id &&
                    " (online)"}
                </Col>
                <Col xs={1}>
                  <span className="badge rounded-pill bd-primary">
                    {" "}
                    {user.newMessages[orderIds(member._id, user._id)]}{" "}
                  </span>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </>
  );
}
