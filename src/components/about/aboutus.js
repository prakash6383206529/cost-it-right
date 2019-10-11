import React, { Component } from 'react';
import AboutUsCommon from '../common/AboutUsCommon'
import { connect } from 'react-redux';
import { Loader } from "../common/Loader";
import './about.scss';

class AboutUs extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div className=" maincontiner-profiles">
                <div className="container aboutus-section">
                    {this.props.loading && <Loader />}
                    <AboutUsCommon
                    />
                </div>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { userData, loading } = auth;
    return {
        userData, loading
    };
}


export default connect(
    mapStateToProps, null
)(AboutUs);

