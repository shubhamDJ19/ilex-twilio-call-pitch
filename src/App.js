// eslint-disable-next-line no-unused-vars
import React, { Component } from "react";
import "./App.css";
import { FirebaseContext } from "./firebase";
import { createHashHistory } from "history";
import Meeting from './components/meeting/Meeting';
import MultiVideoCall from "./components/videoCalling/MultiVideoCall";
import swal from 'sweetalert';
import { auth } from "firebase";
import Login from "./components/login/Login";


export const history = createHashHistory();

const rooms = [
  {
    id: 1, name: "Room-1", slots: [
      { id: "tabel-1", name: "tabel-1", available: true, adminID: ["9991004781@event.com"], userId: "" },
    ]
  },
  // {
  //   id: 2, name: "SyncAV Plus CRT Technology", slots: [
  //     { id: "Feature2-slot-1", name: "SyncAV Plus CRT Technology Team A", available: true, adminID: ["0123456787@event.com"], userId: "" },
  //     { id: "Feature2-slot-2", name: "SyncAV Plus CRT Technology Team B", available: true, adminID: ["0123456786@event.com"], userId: "" },
  //   ]
  // },
  // {
  //   id: 3, name: "VF Therapy Assurance", slots: [
  //     { id: "Feature3-slot-1", name: "VF Therapy Assurance Team A", available: true, adminID: ["0123456785@event.com"], userId: "" },
  //     { id: "Feature3-slot-2", name: "VF Therapy Assurance Team B", available: true, adminID: ["0123456784@event.com"], userId: "" },
  //   ]
  // },
  // {
  //   id: 4, name: "MRI", slots: [
  //     { id: "Feature4-slot-1", name: "MRI Team A", available: true, adminID: ["0123456783@event.com"], userId: "" },
  //     { id: "Feature4-slot-2", name: "MRI Team B", available: true, adminID: ["0123456782@event.com"], userId: "" },
  //   ]
  // },
  // {
  //   id: 5, name: "my Merlin pulse app", slots: [
  //     { id: "Feature5-slot-1", name: "my Merlin pulse app Team A", available: true, adminID: ["0123456781@event.com"], userId: "" },
  //     { id: "Feature5-slot-2", name: "my Merlin pulse app Team B", available: true, adminID: ["0123456780@event.com"], userId: "" },
  //   ]
  // },
];


class App extends Component {
  static contextType = FirebaseContext;

  state = {
    user: null,
    rooms: null,
    room: null,
    showVideoCall: true,
    isCurrentMeetingRoomOfficial: false,
    showWhiteborad: true,
  }
  MeetingRoomMessage = "";
  busyRoomMessage = "";
  videoCall = React.createRef();
  activeMeetingRoomDetails = {}
  userId = null;

  getUserId = (user) => {
    let userId = "";
    if (user.phoneNumber) {
      userId = `${user.phoneNumber}`
    } else if (user.email !== null) {
      userId = user.email;
      userId = userId.toLowerCase();
      // userId = userId.replace(/[&\/\\#,+$~%.'":*?<>{}]/g, '');
    }
    return userId
  }

  componentDidMount() {
    // this.context.saveMeetingRoomData(rooms); //can be used to save data to firebase
    // this.context.getMeetingRoomData();
    this.listener = this.context.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.userId = this.getUserId(authUser)
        console.log(this.userId);
        console.log(authUser.email);
        this.context.currentUser = authUser;
        if (!authUser.displayName) {
          authUser.updateProfile({
            displayName: `${authUser.email ? authUser.email.split('@')[0] : authUser.phoneNumber ? authUser.phoneNumber.slice(3) : "GuestUser"}`,
          })
        }
        this.setState({
          user: authUser
        })

        this.context.updateMeetingRooms = this.updateMeetingRoom;
        this.context.attachMeetingRoomListener();
        // this.gettingMeetingRoomErrMessage();
        this.joinFirstSlot()
      } else {
        // this.signIn("9991004781@event.com", "9991004781")
        console.log("user not logged in");
        this.removeLoader()
        // if (localStorage.getItem('bypassLogin')) {
        //   this.signIn("0123456789@event.com", "0123456789")
        // } else {
        //   window.location.href = "/login/index.html";
        // }
      }
    });
  }

  removeLoader = () => {
    var load = document.querySelector(".platformStart")
    console.log(load);
    if (load) { load.remove() }
  }

  joinFirstSlot = () => {
    if (this.state.rooms) {
      this.onSlotJoin(this.state.rooms[0], this.state.rooms[0].slots[0])
    } else {
      setTimeout(() => {
        this.joinFirstSlot()
      }, 1000)
    }
  }

  //#region utility functions
  signIn = (email, password) => {
    this.context.auth.signInWithEmailAndPassword(email, password)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });


  }

  gettingMeetingRoomErrMessage = async () => {
    const Messagedoc = await this.context.db.collection("backStage").doc("meetingRoomMessage").get();
    if (Messagedoc.data) {
      this.MeetingRoomMessage = Messagedoc.data().meetingRoomMsg;
      this.busyRoomMessage = Messagedoc.data().busyRoomMessage;
    }
  }

  updateMeetingRoom = () => {
    this.setState({
      rooms: this.context.meetingRooms
    });
  }

  closeMeetingRoom = () => {
    if (localStorage.getItem("lastLocation")) {
      window.location.href = localStorage.getItem("lastLocation");
    } else {
      window.location.href = "/login/index.html";
    }
  }


  showInfoPopUp(message) {
    //console.log("showInfoPopUp", message);
    swal({
      title: message, // `Event will start at ${roomStatus.timeLeft}`,
      // icon: "info",
      className: "video-swal-modal",
      button: "continue",
    });
  }

  showMeetingRoomPopup = () => {
    // this.showInfoPopUp(this.MeetingRoomMessage);
  }

  showMeetingRoomBusyPopup = () => {
    // this.showInfoPopUp(this.busyRoomMessage);
  }


  checkForSlotAdmin = (adminArray, userId) => {
    if (adminArray && userId) {
      if (adminArray.indexOf(userId) != -1) {
        return true;
      } else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  onSlotJoin = (activeRoom, slot) => {
    if (window.parent.hideCrossBtn) {
      window.parent.hideCrossBtn()
    }
    this.activeMeetingRoomDetails =
    {
      roomName: activeRoom.name,
      roomId: activeRoom.id,
      slotId: slot.id,
      slot: slot
    }
    var isOfficial = this.checkForSlotAdmin(slot.adminID, this.userId);
    console.log(this.activeMeetingRoomDetails);
    // 
    // this.addAnalytics(this.activeMeetingRoomDetails.roomName)
    // 
    this.setState({ isCurrentMeetingRoomOfficial: isOfficial })
    if (!isOfficial) {
      // window.FirebaseObj.user_AnalyticsHandler("Call", "enter");
      this.context.updateMeetingRoomDataAccLimit(activeRoom.name, activeRoom.id, slot.id, false, (err) => {
        if (err) {
          console.log(err);
          this.showMeetingRoomBusyPopup();
        } else {
          this.removeLoader();
          let room = { roomId: slot.id, roomName: slot.name, roomParentId: activeRoom.id }
          this.setState({ room: room })
          this.setState({ showVideoCall: true })
        }
      });
    } else {
      this.removeLoader();
      let room = { roomId: slot.id, roomName: slot.name, roomParentId: activeRoom.id }
      this.setState({ room: room })
      this.setState({ showVideoCall: true })
    }
  };

  onCallDisconnect = (forceExit) => {
    if (window.parent.showCrossBtn) {
      window.parent.showCrossBtn()
    }

    var isOfficial = this.checkForSlotAdmin(this.activeMeetingRoomDetails.slot.adminID, this.userId);
    if (!isOfficial && !forceExit) {
      window.FirebaseObj.user_AnalyticsHandler("Meeting", "enter");
      console.log("exiting as a normal user");
      var activeMeetingRoomDetails = this.activeMeetingRoomDetails;
      this.context
        .updateMeetingRoomDataAccLimit(activeMeetingRoomDetails.roomName,
          activeMeetingRoomDetails.roomId,
          activeMeetingRoomDetails.slotId, true,
          function (err) {
            if (err) {
              console.log(err);
            } else {
              window.open('/index.html', '_self')
            }
          });
    } else {
      window.open('/index.html', '_self')
    }
    this.setState({ showVideoCall: false });
  }

  updateRoomStatus = () => {

  }
  currentSlotRest = () => {
    var self = this;
    setTimeout(() => {
      self.context
        .updateMeetingRoomDataAccLimit(self.activeMeetingRoomDetails.roomName,
          self.activeMeetingRoomDetails.roomId,
          self.activeMeetingRoomDetails.slotId, true,
          function (err) {
            if (err) {
              console.log(err);
            } else {

            }
          });
    }, 2500);
  }
  //#endregion

  componentWillUnmount() {
    if (this.listener)
      this.listener();
  }


  addAnalytics = (roomId) => {
    this.context.addHotspotAnalytics(roomId, this.context.currentUser)
  }

  render() {
    return (
      <>
        {
          !this.state.user &&
          <Login></Login>
        }
        {/* {
          this.state.user && this.state.rooms && <>
            <Meeting onHomeClick={this.closeMeetingRoom} rooms={this.state.rooms} onSlotJoin={(activeRoom, slot) => this.onSlotJoin(activeRoom, slot)} userID={this.userId} ></Meeting>
          </>
        } */}
        {this.state.showVideoCall && this.state.user && this.state.user.displayName && this.state.room &&
          <>
            <MultiVideoCall
              userName={this.state.user.displayName}
              userId={this.userId}
              room={this.state.room}
              onCallDisconnect={this.onCallDisconnect}
              ref={this.videoCall}

              updateRoomStatus={this.updateRoomStatus}
              isOfficial={this.state.isCurrentMeetingRoomOfficial}
              liveRooms={this.state.rooms}
              slotReset={this.currentSlotRest}
              showPopup={this.showMeetingRoomPopup}
              showBusyPopup={this.showMeetingRoomBusyPopup}
              showInfoPopUp={this.showInfoPopUp}
            ></MultiVideoCall>
          </>
        }
      </>);
  }
}

export default App;
