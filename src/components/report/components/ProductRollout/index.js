import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import ModelLanding from "./ModelLanding";
import StageOfParts from "./StageOfParts";
import CostMovement from "./CostMovement";
import PartUsage from "./PartUsage";
import DisplayCharts from "./DisplayCharts";
import MasterUsage from "./MasterUsage";
import { useMemo } from "react";

const ProductRollout = () => {
    const [modelLandingData, setModelLandingData] = useState({})
    const fetchData = (value) => {
        setModelLandingData(value)
    }
    const StageOfPartUI = useMemo(() => <StageOfParts productId={modelLandingData.productId} />, [modelLandingData.productId])
    const CostMovementUI = useMemo(() => <CostMovement partId={modelLandingData.partId} />, [modelLandingData.partId])
    const PartUsageUI = useMemo(() => <PartUsage productId={modelLandingData.productId} />, [modelLandingData.productId])
    const DisplayChartsUI = useMemo(() => <DisplayCharts productId={modelLandingData.productId} />, [modelLandingData.productId])
    const MasterUsageUI = useMemo(() => <MasterUsage productId={modelLandingData.productId} />, [modelLandingData.productId])
    return (
        <div className="product-rollout-container">
            <h1>Detailed Model/Assy Report</h1>
            <Row>
                <Col md="6">
                    <ModelLanding fetchData={fetchData} />
                </Col>
                {modelLandingData.showData && <>
                    <Col md="6">
                        {StageOfPartUI}
                    </Col>
                    <Col md="12">
                        {CostMovementUI}
                    </Col>
                    <Col md="6">
                        {PartUsageUI}
                        {DisplayChartsUI}
                    </Col>
                    <Col md="6">
                        {MasterUsageUI}
                    </Col>
                </>}

            </Row>
        </div>
    )
}
export default ProductRollout;