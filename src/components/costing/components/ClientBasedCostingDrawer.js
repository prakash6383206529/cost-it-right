import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';

export function Clientbasedcostingdrawer(props) {
    const toggleDrawer = () => {
        props.closeDrawer('')
    };
    return (
        <>
            <Drawer anchor={props.anchor} open={props.isOpen}>
                <Container>
                    <div className={"drawer-wrapper drawer-1500px"}>
                    <Row className="drawer-heading">
                        <Col>
                            <div className={"header-wrapper left"}>
                                <h3>{"Add Costing"}</h3>
                            </div>
                            <div onClick={(e) => toggleDrawer(e)}className={"close-button right"}></div>
                        </Col>
                    </Row>
                    </div>
                </Container>
            </Drawer>
        </>
    )
}

export default Clientbasedcostingdrawer;