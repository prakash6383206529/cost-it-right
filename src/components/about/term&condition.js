import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader } from "../common/Loader";
import TermsConditions from '../common/TermsConditions';
import './about.scss';

class termsConditions extends Component {

    constructor(props) {
        super(props);
        
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
                    <TermsConditions />
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
)(termsConditions);

