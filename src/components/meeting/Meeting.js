import React, { Component } from "react";
import PropTypes from "prop-types";
import { isMobileOnly } from 'react-device-detect';


class Meeting extends Component {

    state = {
        rooms: this.props.rooms,
        activeRoom: 0,
        showSideMenu: false
    }

    componentDidMount() {
        window.FirebaseObj.user_AnalyticsHandler("Meeting", "enter");
    }

    componentWillUnmount() {
        window.FirebaseObj.user_AnalyticsHandler("Meeting", "exit");
    }

    componentWillReceiveProps(newprops) {
        this.setState({ rooms: newprops.rooms });
    }

    onRoomCLick = (room, index) => {
        this.setState({ activeRoom: index });
        this.setState({ showSideMenu: false });
    }

    onSlotJoin = (activeRoom, slot) => {

        // console.log(activeRoom);
        // console.log(slot);
        var isOfficial = this.checkForAdmin(slot.adminID, this.props.userID);
        // console.log(isOfficial);
        setTimeout(() => {
            if (isOfficial) {
                if (this.props.onSlotJoin) {
                    this.props.onSlotJoin(activeRoom, slot);
                }
            } else {
                if (slot.available) {
                    // Set room unavailable
                    if (this.props.onSlotJoin) {
                        this.props.onSlotJoin(activeRoom, slot);
                    }
                }
            }

        }, 1000);

    };

    showSideMenu = () => {
        this.setState({ showSideMenu: !this.state.showSideMenu })
    };

    onHomeClick = () => {
        if (this.props.onHomeClick) {
            this.props.onHomeClick();
        }
    }

    checkValue = (slot) => {
        // console.log(slot);
    }

    checkForAdmin = (adminArray, userId) => {
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

    checkForAdminInFeature = (feautre, userId) => {
        if (feautre) {
            if (feautre.slots) {
                for (let i = 0; i < feautre.slots.length; i++) {
                    let room = feautre.slots[i];
                    if (room.adminID) {
                        if (this.checkForAdmin(room.adminID, userId)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false
    }

    render() {
        let activeRoom = this.state.rooms[this.state.activeRoom];

        return (
            <>
                <section className="meetingBox">
                    <div className="meetingBox__header meetingBox__header__gradient">
                        {/* <button onClick={event => this.onHomeClick()} className="meetingBox_close"><i className="icon-angle-back"></i></button> */}
                        <img onClick={event => this.onHomeClick()} src="assets/images/abbott-logo-vector 1.png" alt="" />
                        <span className={isMobileOnly ? ("meeting_title") : ("")}>Meeting Room</span>
                        <button className={`meetingBox__header--toggle ${this.state.showSideMenu ? "active" : ""}`}
                            onClick={event => this.showSideMenu()}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        {/* {!isMobileOnly &&
                            <button className={`meetingBox_close`} onClick={event => this.onHomeClick()}>
                            </button>
                        } */}
                    </div>
                    {/*{isMobileOnly && */}
                    {/*<div className="meetingBox__header  meetingBox__header_mobileoverride justify-content-center">*/}
                    {/*     <button className={`meetingBox_close_mobile`} onClick={event => this.onHomeClick()}>*/}
                    {/*        </button>*/}
                    {/*</div>*/}
                    {/*}*/}

                    <div className="meetingBox__body">
                        <aside className={`meetingBox__sidebar ${this.state.showSideMenu ? "active" : ""}`}>
                            <ul>
                                {
                                    this.state.rooms.map((room, index) => <li key={room.id}
                                        onClick={event => this.onRoomCLick(room, index)}><a
                                            className={`cursor-pointer ${(activeRoom.id == room.id) ? "active" : ""}`}>{room.name}{this.checkForAdminInFeature(room, this.props.userID) ? ' (admin)':''}</a></li>)
                                }
                            </ul>
                            <div className="meetingBox__sidebar meetingBox__sidebar_base"></div>
                        </aside>
                        <div className="meetingBox__contents">
                            {
                                activeRoom.slots && activeRoom.slots.map(slot =>

                                    <div className={`meetingBox__block ${slot.available ? "meetingBox__block--gradient" : "meetingBox__block--greySolid"} ${this.checkForAdmin(slot.adminID, this.props.userID) ? 'adminBox' : ''}`} key={slot.id}>
                                        <h2 className="meetingBox__block__title">{slot.name}</h2>
                                        <div className="meetingBox__block__right">
                                            {this.checkForAdmin(slot.adminID, this.props.userID) ? (
                                                <div className={`meetingBox__block__status ${!slot.available ? "green" : "red"}`}>{!slot.available ? "User" : "No User"}</div>
                                            ) :
                                                (
                                                    <div className={`meetingBox__block__status ${slot.available ? "green" : "red"}`}>{slot.available ? "Available" : "Busy"}</div>
                                                )}

                                            <button className="meetingBox__block__btn" onClick={event => this.onSlotJoin(activeRoom, slot)}
                                                disabled={this.checkForAdmin(slot.adminID, this.props.userID) ? (false) : (!slot.available)}>
                                                {this.checkForAdmin(slot.adminID, this.props.userID) ? "Enter Call" : "Join Call"}
                                            </button>

                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </section>
            </>
        );
    }
}

export default Meeting;
