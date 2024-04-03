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
import TourWrapper from "../../../common/Tour/TourWrapper";
import { Steps } from "../TourMessages";
import { useTranslation } from "react-i18next"
const ProductRollout = () => {
    const [modelLandingData, setModelLandingData] = useState({});
    const { t } = useTranslation("Reports")

    const fetchData = (value) => {
        setModelLandingData(value);
    };

    return (
        <div className="product-rollout-container">
            <h1>Detailed Model/Assy Report
                <TourWrapper
                    buttonSpecificProp={{ id: "Product_Rollout_Form" }}
                    stepsSpecificProp={{
                        steps: Steps(t).ASSYREPORT
                    }} />

            </h1>
            <Row>
                <Col md="6">
                    <ModelLanding fetchData={fetchData} />
                </Col>
                {modelLandingData.showData && (
                    <>
                        <Col md="6">
                            <StageOfParts productId={modelLandingData.partId} />
                        </Col>
                        <Col md="12">
                            <CostMovement partId={modelLandingData.partId} partNumber={modelLandingData.partNumber} partType={modelLandingData.partType} />
                        </Col>
                        <Col md="6">
                            <PartUsage productId={modelLandingData.partId} />
                            <MasterUsage productId={modelLandingData.partId} />
                        </Col>
                        <Col md="6">
                            <DisplayCharts productId={modelLandingData.partId} />
                        </Col>
                    </>
                )}
            </Row>
        </div>
    );
};
export default React.memo(ProductRollout);