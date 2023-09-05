import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import ModelLanding from "./ModelLanding";
import StageOfParts from "./StageOfParts";
import CostMovement from "./CostMovement";
import PartUsage from "./PartUsage";
import DisplayCharts from "./DisplayCharts";
import MasterUsage from "./MasterUsage";
import { useMemo } from "react";
import { useCallback } from "react";

const ProductRollout = () => {
    const [modelLandingData, setModelLandingData] = useState({});

    const fetchData = (value) => {
        setModelLandingData(value);
    };

    return (
        <div className="product-rollout-container">
            <h1>Detailed Model/Assy Report</h1>
            <Row>
                <Col md="6">
                    <ModelLanding fetchData={fetchData} />
                </Col>
                {modelLandingData.showData && (
                    <>
                        <Col md="6">
                            <StageOfParts productId={modelLandingData.productId} />
                        </Col>
                        <Col md="12">
                            <CostMovement partId={modelLandingData.partId} partNumber={modelLandingData.partNumber} partType={modelLandingData.partType} />
                        </Col>
                        <Col md="6">
                            <PartUsage productId={modelLandingData.productId} />
                            <MasterUsage productId={modelLandingData.productId} />
                        </Col>
                        <Col md="6">
                            <DisplayCharts productId={modelLandingData.productId} />
                        </Col>
                    </>
                )}
            </Row>
        </div>
    );
};
export default React.memo(ProductRollout);