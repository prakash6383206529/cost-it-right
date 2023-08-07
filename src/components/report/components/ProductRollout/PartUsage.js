import React from "react";
import { Col, Row } from "reactstrap";

const PartUsage = () => {
    return (
        <div className="seprate-box">
            <Row className="text-center part-usage-container">
                <Col md="3" className="inner-container">
                    <h6>Total Parts </h6>
                    <h1 className="text-center">50</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>Single Sourced Parts</h6>
                    <h1 className="text-center">10</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>Multi Sourced Parts</h6>
                    <h1 className="text-center">40</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>No Costing</h6>
                    <h1 className="text-center">90</h1>
                </Col>
            </Row>
        </div>
    );
}
export default PartUsage;;