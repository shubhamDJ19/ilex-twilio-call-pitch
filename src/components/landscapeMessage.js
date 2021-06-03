import React, { Component } from "react";
import { FirebaseContext } from "../firebase";
import LSImage from '../assets/images/Orientation.png';

var LandscapeMessageStyle = 
{    
    // position: "absolute",
    zIndex: '5',
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3%",
    backgroundColor: "#323333",
}


var LandscapeMessageImageStyle = 
{    
    width: "100%",
    height: "100%",
    backgroundImage: "url(/assets/images/Orientation.png)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    /* flex: 5; */
    margin: "60px",
}

var LandscapeMessageTextStyle = 
{    
    flex: "2",
    fontSize: "larger",
    fontWeight: "800",
    color: "white",
}

var MessageStyle = 
{    
    margin: "10px",
    // height: "140px",
    padding: "10px",
    backgroundColor: "#000000",
}


var MessageImageStyle = 
{    
    height: "90px",
    backgroundImage: "url(/assets/images/Orientation.png)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    marginBottom: "10px",
}

var MessageTextStyle = 
{    
    // fontSize: "larger",
    // fontWeight: "600",
    color: "white",
    textAlign: "center",
}

class LandscapeMessage extends Component {
    static contextType = FirebaseContext;

    constructor(props) {
        super(props);
        this.state = 
        {
            showMessage: false,
            showMessageExperience: false
        }
        this.activeMenu = this.props.activeMenu;
    };

    componentDidUpdate() {
    }

    componentDidMount() {
        // console.log("componet Did mount");
        this.checkOrientation();
        var self = this;
        window.addEventListener('resize', function(){
            self.checkOrientation();
        });
        window.addEventListener('orientationchange', function(){
            self.checkOrientation();
        });

    }

    componentWillUnmount() {
        // console.log("componet Did unmount");
    }

    checkOrientation()
    {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if(width > height)
        {
            this.setState({
                showMessage: true,
                showMessageExperience: false
            });
        }else
        {
            
            this.setState({
                showMessage: false,
                showMessageExperience: false
            });
        }
    }

    render() {
        return (
            <>
            {this.state.showMessage? (
                <>
                    {/* <div style={LandscapeMessageStyle} >
                        <div style={LandscapeMessageImageStyle}>
                        </div>
                        <div style={LandscapeMessageTextStyle}>
                        please rotate your device to portrait orientation
                        </div>
                    </div> */}

                    <div id="LandscapeMessageContainer">
                                        
                            <div className="LandscapeMessage">
                                <div className="centerP"><img src={LSImage} height="200" alt="LS"></img></div>
                                <p className="whitep">Please rotate your device to Portrait Orientation</p>
                            </div>
                            
                    </div>
                </>
            ):(null)}

            {this.state.showMessageExperience ?(
                <>
                    <div style={MessageStyle} >
                        {/* <div style={MessageImageStyle}>
                        </div> */}
                        <div style={MessageTextStyle}>
                        please view in landscape mode<br></br>for a better experience
                        </div>
                    </div>
                </>
            ):(null)}
            </>
        );
    }
}

export default LandscapeMessage;
