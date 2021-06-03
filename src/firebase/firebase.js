import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";
import moment from "moment";

// const config = {
//   apiKey: "AIzaSyCneEInwQf9s42gCzrX1ybhEvqO8Z1FcjM",
//   authDomain: "broad-expo-rent-dj.firebaseapp.com",
//   databaseURL: "https://broad-expo-rent-dj.firebaseio.com",
//   projectId: "broad-expo-rent-dj",
//   storageBucket: "broad-expo-rent-dj.appspot.com",
//   messagingSenderId: "60481384412",
//   appId: "1:60481384412:web:d39202acf4d3a9df266919",
//   measurementId: "G-N8YN11228Z"
// };

const config = {
  apiKey: "AIzaSyCvj4-A1bOwcmn60soy9lntpPXHuGFZf1U",
  authDomain: "zs-associates-virtual.firebaseapp.com",
  projectId: "zs-associates-virtual",
  storageBucket: "zs-associates-virtual.appspot.com",
  messagingSenderId: "411061106063",
  appId: "1:411061106063:web:cc40094724cbd8b58cc7fa",
  databaseURL: "https://zs-associates-virtual-default-rtdb.firebaseio.com",
  measurementId: "G-8RYCCHL3T0"
};

app.initializeApp(config);
class Firebase {
  constructor() {
    this.app = app;
    this.auth = app.auth();
    this.db = app.firestore();
    this.firestore = app.firestore();
    this.database = app.database();

    window.FirebaseObj = this;
    this.currentUser = null;
    this.meetingRooms = null;
    this.updateMeetingRooms = null;

    this.isOffical = false;
    this.getCurrentTimeStampV2();
  }

  user_AnalyticsHandler = async (stateValue, stateMode) => {
    try {
      if (stateValue === "Meeting" && stateMode === "enter") {
        var countVal = 0;
        this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Meeting_Visit_Count').once('value').then((snapshot) => {
          countVal = (snapshot.val());
          countVal++;
          this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Meeting_Visit_Count').set(countVal);
          this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Current_Room').set("Meeting");

        });
      } else if (stateValue === "Meeting" && stateMode === "exit") {
        this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Current_Room').set("none");
      }
      else if (stateValue === "Call" && stateMode === "enter") {
        var countVal = 0;
        this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Meeting_Visit_Count').once('value').then((snapshot) => {
          countVal = (snapshot.val());
          countVal++;
          this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Meeting_Visit_Count').set(countVal);
          this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Current_Room').set("Call");
        });
      } else if (stateValue === "Call" && stateMode === "exit") {
        this.database.ref('/user_analytics/' + this.auth.currentUser.uid + '/Current_Room').set("none");
      }

    } catch (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("code: " + errorCode + " & ErrorMsg: " + errorMessage);
    }
  };

  //#region meeting Room Functions
  saveMeetingRoomData = (rooms) => {
    var self = this;
    rooms.forEach(element => {
      self.saveSingleMeetingRoomData(element.name, element.id, element.slots);
    });
  }

  saveSingleMeetingRoomData = async (name, id, data) => {
    try {
      const db = app.firestore();
      const docName = id + "_" + name
      const docRef = db.collection('meetingRoom').doc(docName);
      await docRef.set({
        id: id,
        name: name,
        slots: data
      })
      console.log("dataSaved");
    }
    catch (err) {
      console.log(err);
    }
  }

  getMeetingRoomData = async () => {
    try {
      var result = [];
      const db = app.firestore();
      const docRef = db.collection('meetingRoom');
      const snapShots = await docRef.get();
      console.log(snapShots);
      if (!snapShots.empty) {
        var docs = snapShots.docs;
        docs.forEach(doc => {
          var data = doc.data();
          var roomDetails = {};
          roomDetails.id = data.id;
          roomDetails.name = data.name;
          roomDetails.slots = data.slots;
          result.push(roomDetails);
        });
        this.meetingRooms = result;
        console.log(this.meetingRooms);
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  attachMeetingRoomListener = () => {
    const self = this;
    const db = app.firestore();
    const docRef = db.collection('meetingRoom');
    docRef.onSnapshot(function (snapShots) {
      var result = [];
      // console.log(snapShots);
      if (!snapShots.empty) {
        var docs = snapShots.docs;
        docs.forEach(doc => {
          var data = doc.data();
          var roomDetails = {};
          roomDetails.id = data.id;
          roomDetails.name = data.name;
          roomDetails.slots = data.slots;
          result.push(roomDetails);
        });
        self.meetingRooms = result;
        // console.log(self.meetingRooms);
        self.updateMeetingRooms();
        // self.updateMeetingRoomData("Enquiry", 1, "enquiry-slot-2", false);
      }

    }, function (error) {
      console.log(error);
    });
  }

  updateMeetingRoomDataAccLimit = (roomName, roomId, slotName, availableValue, callback) => {

    console.log(roomName, slotName, availableValue);
    var docName = roomId + "_" + roomName;

    var data = this.meetingRooms.filter(value => value.id == roomId)[0];
    console.log(data);
    var slotIndex = -1;
    data.slots.forEach((slot, index) => {
      if (slot.id === slotName) {
        slotIndex = index
      }
    });
    let userId = this.getUserId(this.currentUser, true);

    const db = app.firestore();
    const docRef = db.collection('meetingRoom').doc(docName);

    //transcation 
    return db.runTransaction(function (transaction) {
      return transaction.get(docRef).then(function (doc) {
        if (!doc.exists) {
          throw "Document does not exist!";
        }
        let slots = doc.data().slots;
        let slotIndex = -1;

        slots.forEach((slot, index) => {
          if (slot.id === slotName) {
            slotIndex = index
          }
        });

        if (slotIndex !== -1) {
          //------------------------------
          // if (!availableValue) {

          //   if (slots[slotIndex].available) {

          //     slots[slotIndex].userId.push(userId)
          //     slots[slotIndex].currentCount += 1;
          //     if (slots[slotIndex].limit == slots[slotIndex].currentCount + 1) {
          //       slots[slotIndex].available = false
          //     }
          //     return transaction.update(docRef, { slots: slots });

          //   } else {
          //     throw { code: 'busySlot', messgage: "slot not avalilable" }
          //   }

          // } else {

          //   var index = slots[slotIndex].userId.indexOf(userId);
          //   if (index > -1) {
          //     slots[slotIndex].userId.splice(index, 1);
          //   }
          //   slots[slotIndex].currentCount -= 1;
          //   slots[slotIndex].available = true
          //   return transaction.update(docRef, { slots: slots });

          // }
          //------------------------------
        } else {
          throw { code: 'noSlot', messgage: "slot not foun" }
        }


      });
    }).then(function () {
      console.log("Transaction successfully committed!");
      if (callback)
        callback();
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
      if (callback)
        callback(error);
    });
  }

  updateMeetingRoomData = (roomName, roomId, slotName, availableValue, callback) => {

    console.log(roomName, slotName, availableValue);
    var docName = roomId + "_" + roomName;
    // var data = this.meetingRooms[roomId - 1];
    var data = this.meetingRooms.filter(value => value.id == roomId)[0];
    console.log(data);
    var slotIndex = -1;
    data.slots.forEach((slot, index) => {
      if (slot.id === slotName) {
        slotIndex = index
      }
    });
    if (slotIndex !== -1) {
      data.slots[slotIndex].available = availableValue;
      if (availableValue) {
        data.slots[slotIndex].userId = ""
      } else {
        data.slots[slotIndex].userId = this.getUserId(this.currentUser, true);
      }
    }

    const db = app.firestore();
    const docRef = db.collection('meetingRoom').doc(docName);
    //simple
    // docRef.update({
    //   slots: data.slots
    // })

    //transcation 
    return db.runTransaction(function (transaction) {
      return transaction.get(docRef).then(function (doc) {
        if (!doc.exists) {
          throw "Document does not exist!";
        }

        if (!availableValue) {
          let slots = doc.data().slots;
          let slotIndex = -1;
          slots.forEach((slot, index) => {
            if (slot.id === slotName) {
              slotIndex = index
            }
          });
          if (slotIndex !== -1) {
            if (slots[slotIndex].available) {
              return transaction.update(docRef, { slots: data.slots });
            } else {
              throw "slot not avalilable"
            }
          }
        }
        else {
          return transaction.update(docRef, { slots: data.slots });
        }
      });
    }).then(function () {
      console.log("Transaction successfully committed!");
      if (callback)
        callback();
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
      if (callback)
        callback(error);
    });
  }


  getMeetingOfficalsData = async () => {
    try {
      const db = app.firestore();
      const docRef = db.collection('meetingRoomOfficials');
      const doc = await docRef.where("members", "array-contains", this.currentUser.email).get();
      console.log(this.currentUser.uid);
      // console.log(doc);
      if (!doc.empty) {
        this.isOffical = true;
        console.log("found meeting room offical");
      }
      else {
        this.isOffical = false;
        console.log("Not meeting room offical");
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  //#endregion


  getUserId = (user, forCall = false) => {
    let userId = "";
    if (user.phoneNumber) {
      userId = `${user.phoneNumber}`
    } else if (user.email !== null) {
      userId = user.email;
      userId = userId.toLowerCase();
      if (forCall) {
        // userId = userId.replace(/[&\/\\#,+$~%.'":*?<>{}]/g, '');
      } else {
        userId = userId.replace(/[&\/\\#,+$~%.'":*?<>{}]/g, '');
      }
    }
    return userId
  }

  getCurrentTimeStampV2 = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("https://dj-timeserver.glitch.me/date");
        const result = await res.json()
        window.date = result.date
        resolve(result)
      } catch (err) {
        reject(err)
      }
    })
  }


  getDate = () => {
    return new Promise(async (res, rej) => {
      try {
        if (window.date) {
          res(window.date)
        } else {
          const result = await this.getCurrentTimeStampV2();
          window.date = result.date
          res(window.date)
        }
      } catch (error) {
        rej(error)
      }
    })
  }

  addHotspotAnalytics = async (videoCallId, user) => {
    if (!videoCallId) {
      console.error("videoCallId is null");
      return;
    }
    console.log(videoCallId)
    let userId = window.userId ? window.userId : this.getUserId(user);
    let date = await this.getDate()
    let path = `/userAnalytics/${date}/${userId}/videoCall`;
    const reference = this.database.ref(path)
    reference.update({
      [videoCallId]: app.database.ServerValue.increment(1)
    })
  }




  signInWithId = (email, password) => {
    return new Promise(async (res, rej) => {
      try {
        const cred = await this.auth.signInWithEmailAndPassword(email, password)
        console.log(cred.user.email + " is logged in right now");
        res();
      } catch (error) {
        rej(error);
      }
    })
  }

  defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/djfarmademo.appspot.com/o/profileimages%2Fblank-avatar.png?alt=media&token=2af15226-9bd7-47ce-bc72-f3c1a12a0780";

  signUpWithId = (email, password, name) => {
    return new Promise(async (res, rej) => {
      try {
        const response = await this.auth.createUserWithEmailAndPassword(email, password);
        console.log(response.user.email + " is signedUp in right now");
        await response.user.updateProfile({
          displayName: name,
          photoURL: this.defaultImageUrl,
        })
        res();
      } catch (error) {
        rej(error);
      }
    })
  }



  loadUser = async (email, password, name, forceCreateNew = false, employeeId) => {
    return new Promise(async (res, rej) => {
      try {
        await this.signInWithId(email, password)
        res();
      } catch (err) {
        if (err.code === "auth/user-not-found" && forceCreateNew) {
          try {
            await this.signUpWithId(email, password, name)
            // await turnOnUserCard(email)
            return;
          } catch (error) {
            if (error.code === "NoUserFound") {
              rej(error);
            }
          }
        }
        rej({
          code: err.code,
          message: err.message
        });
      }
    })
  }

}

export default Firebase;
