import React, { Component } from 'react';
import AboutUsCommon from '../common/AboutUsCommon'
import { connect } from 'react-redux';
import { Loader } from "../common/Loader";
import { Row, Container, Col, Button } from "reactstrap";

class Dashboard extends Component {

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
            <Container className="top-margin">
            {/* {(this.props.loading || this.state.showLoader) && <Loader />} */}
            <Row>
                <Col>
                    <h3>Dashboard </h3>
                </Col>
               
            </Row>
            <hr />
        </Container >
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
)(Dashboard);

