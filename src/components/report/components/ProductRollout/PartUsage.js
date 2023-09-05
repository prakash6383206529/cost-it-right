import React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Col, Row } from "reactstrap";
import { getTotalPartsDetails } from "../../actions/ReportListing";
import { useState } from "react";
import LoaderCustom from "../../../common/LoaderCustom";

const PartUsage = ({ productId }) => {
    const dispatch = useDispatch();
    const [totalPartsDetails, setTotalPartsDetails] = useState({});
    const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        dispatch(getTotalPartsDetails(productId, (res) => {
            setIsLoader(false)
            if (res && res.status === 200) {
                setTotalPartsDetails(res.data.Data)
            }
        }));
    }, []);
    return (
        <div className="seprate-box">
            <Row className="text-center part-usage-container">
                {isLoader && <LoaderCustom />}
                <Col md="3" className="inner-container">
                    <h6>Total Parts </h6>
                    <h1 className="text-center">{totalPartsDetails.TotalParts ?? 0}</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>Single Sourced Parts</h6>
                    <h1 className="text-center">{totalPartsDetails.SingleSourcedParts ?? 0}</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>Multi Sourced Parts</h6>
                    <h1 className="text-center">{totalPartsDetails.MultiSourcedParts ?? 0}</h1>
                </Col>
                <Col md="3" className="inner-container">
                    <h6>No Costing</h6>
                    <h1 className="text-center">{totalPartsDetails.NoCosting ?? 0}</h1>
                </Col>
            </Row>
        </div>
    );
}
PartUsage.defualtProps = {
    productId: '0000-0000-0000-0000-00000'
}
export default React.memo(PartUsage);