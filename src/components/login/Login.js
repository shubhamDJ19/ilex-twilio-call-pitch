import React, { Component } from "react";
import './Login.css';
import './Login.css';
import Firebase, { FirebaseContext } from "../../firebase";

class Login extends Component {
    static contextType = FirebaseContext;

    state = {
        email: '',
        name: '',
        error: false,
        errorMessage: "",
        employeId: '',
        _loading: false,
        forceDisable: false,
        forceUpdate: false,
    };

    componentDidMount = () => {
        window.showLoginError = this.showLoginError
    }

    onInputChange = event => {
        event.preventDefault();
        let value = event.target.value
        if (event.target.name === 'employeId') {
            value = value.substr(0, 10)
        }
        this.setState({ [event.target.name]: value });
    };

    showLoginError = (err) => {
        this.setState({
            error: true,
            errorMessage: err.message ? err.message : err
        });
    }

    validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    onFormSubmit = async (event) => {
        event.preventDefault();
        try {
            this.setState({
                error: false,
                forceDisable: true
            })
            let employeId = this.state.employeId.toLowerCase().replace(/\s+/g, '');;
            let email = `${employeId}@event.com`;
            let password = `${employeId}123456`;
            let name = this.state.name;
            await this.context.loadUser(email, password, name,true, employeId);
        }
        catch (err) {
            this.setState({
                forceDisable: false
            })
            let error = '';
            switch (err.code) {
                case "auth/wrong-password":
                    error = "Invalid username and password.";
                    break;
                case "auth/user-not-found":
                    error = "User not registered";
                    break;
                case "auth/too-many-requests":
                    error = "Too many invalid requests, please wait for 60 seconds before retrying";
                    break;
                case "NoUserFound":
                    error = "User not registered"
                    break
                default:
                    error = err.message
            }
            this.setState({
                error: true,
                errorMessage: error,
            })
        }
    };


    render() {
        if (this.state._loading) {
            return <img alt="loading" src="/images/loader.gif" />;
        }
        return (
            <section className="landing-page min-height-full">
                <aside className="landing-pageBox d-flex justify-content-between align-items-start min-height-full image-bg" style={{ backgroundImage: `url(/assets/images/login.jpg)` }}>
                </aside>
                <aside className="signinBox min-height-full">
                    {
                        this.props.showLoggingIn &&
                        <>
                            <div className="signinBox__heading">
                                <div className="middle"></div>
                                {/* <div className="left"></div>
                                <div className="right"></div> */}
                            </div>
                            <br></br>
                            <div className="loaderContainer">
                                <img src="/assets/images/Loader.gif" alt="loader" ></img>
                                <div>Logging you in...</div>
                            </div>
                        </>
                    }
                    {
                        !this.props.showLoggingIn &&
                        <>
                            <form onSubmit={this.onFormSubmit}>
                                <div className="signinBox__heading">
                                    <div className="middle"></div>
                                    {/* <div className="left"></div>
                                    <div className="right"></div> */}
                                </div>
                                <div className="signinBox__body pd-t50">
                                    {/* <div className="form-group mg-b50">
                                        <input type="text" className="form-control" name="name" value={this.state.name} placeholder="ENTER YOUR NAME" onChange={this.onInputChange} required={true} />
                                    </div> */}
                                    <div className="signinBox_title">
                                        Participant Login
                                    </div>
                                    <div className="form-group mg-b50">
                                        <input type="text" className="form-control form-control-login" name="name" value={this.state.name} placeholder="Enter Name" onChange={this.onInputChange} autoComplete="off"
                                            autoCorrect="off" required={true} />
                                    </div>
                                    <div className="form-group mg-b50">
                                        <input type="number" className="form-control form-control-login" name="employeId" value={this.state.employeId} placeholder="Enter Phone Number" onChange={this.onInputChange} autoComplete="off"
                                            autoCorrect="off" required={true} />
                                    </div>
                                    {this.state.error && <div className="mg-b50" style={{ color: "red", fontSize: "1.25rem" }}>{this.state.errorMessage}</div>}
                                    <div className="text-center">
                                        <button
                                            // className="btn btn-lg btn-lg-v2 btn-yellow"
                                            className="loginBtn"
                                            disabled={this.state.forceDisable ? true : !this.state.employeId.length > 0} >LOG IN</button>
                                    </div>
                                </div>
                            </form>
                        </>
                    }
                </aside>
            </section>
        );
    }

}

export default Login;
