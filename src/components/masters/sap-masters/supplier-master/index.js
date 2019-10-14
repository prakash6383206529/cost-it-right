import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Button } from "reactstrap";


class SupplierMaster extends Component {
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
                <Row>
                    <Col>
                        <h3>Supplier Master </h3>
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
function mapStateToProps({ }) {
}


export default connect(
    mapStateToProps, null
)(SupplierMaster);

