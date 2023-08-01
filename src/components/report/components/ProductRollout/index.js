import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import ModelLanding from "./ModelLanding";
import StageOfParts from "./StageOfParts";
import CostMovement from "./CostMovement";
import PartUsage from "./PartUsage";
import DisplayCharts from "./DisplayCharts";
import MasterUserage from "./MasterUsage";

const ProductRollout = () => {
    const [showData, setShowData] = useState(false)
    const fetchData = () => {
        setShowData(true)
    }
    return (
        <div className="product-rollout-container">
            <h1>Detailed Model/Assy Report</h1>
            <Row>
                <Col md="6">
                    <ModelLanding fetchData={fetchData} />
                </Col>
                {showData && <>
                    <Col md="6">
                        <StageOfParts />
                    </Col>
                    <Col md="12">
                        <CostMovement />
                    </Col>
                    <Col md="6">
                        <PartUsage />
                        <DisplayCharts />
                    </Col>
                    <Col md="6">
                        <MasterUserage />
                    </Col>
                </>}

            </Row>
        </div>
    )
}
export default ProductRollout;