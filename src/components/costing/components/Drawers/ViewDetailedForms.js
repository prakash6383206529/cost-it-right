import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "@material-ui/core";
import { Col, Container, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import { getOperationDataAPI } from "../../../masters/actions/OtherOperation";
import AddOperation from "../../../masters/operation/AddOperation";
import AddMachineRate from "../../../masters/machine-master/AddMachineRate";
import AddMoreDetails from "../../../masters/machine-master/AddMoreDetails";

const ViewDetailedForms = (props) => {
    const dispatch = useDispatch()
    const { formName, data, cancel } = props
    const [state, setState] = useState({})
    useEffect(() => {
        if (formName === 'Machine') {
            setState((prevState) => ({ ...prevState, isMachineRateForm: true }))
        }
    }, [data.id, formName])
    const renderForms = useMemo(() => {
        switch (formName) {
            case 'Operation':
                return <AddOperation
                    data={{ isViewMode: true, isEditFlag: true, ID: data.id, toggleForm: true, isCostingDrawer: true }}
                    hideForm={() => { }}
                    isOperationAssociated={true}
                />
            case 'Machine':
                const setData = (data = {}) => {

                    setState((prevState) => ({ ...prevState, data: data }));
                };

                const hideForm = (type) => {
                    setState((prevState) => ({ ...prevState, isMachineRateForm: false, data: {}, editDetails: {}, stopApiCallOnCancel: false, }));
                    if (type === "cancel") {
                        setState((prevState) => ({ ...prevState, stopApiCallOnCancel: true }));
                    }
                };

                const displayMoreDetailsForm = (data = {}) => {

                    setState((prevState) => ({ ...prevState, isAddMoreDetails: true, isMachineRateForm: false, editDetails: data, }));
                };

                const hideMoreDetailsForm = (data = {}, editDetails = {}) => {
                    setState((prevState) => ({ ...prevState, isAddMoreDetails: false, isMachineRateForm: true, data: data, editDetails: editDetails, }));
                };

                const { isMachineRateForm, isAddMoreDetails } = state;

                if (isMachineRateForm === true) {
                    return (
                        <AddMachineRate
                            editDetails={{ Id: data.id, isViewMode: true, isViewFlag: true, isEditFlag: true }}
                            setData={setData} hideForm={hideForm} displayMoreDetailsForm={displayMoreDetailsForm} AddAccessibility={state.AddAccessibility} EditAccessibility={true} isMachineAssociated={state.isMachineAssociated}
                            data={{ isViewFlag: true, isCostingDrawer: true }}
                        />
                    );
                }

                if (isAddMoreDetails === true) {
                    return (
                        <AddMoreDetails editDetails={state.editDetails}
                            data={{ isViewFlag: true, isCostingDrawer: true }}
                            hideMoreDetailsForm={hideMoreDetailsForm} isMachineAssociated={state.isMachineAssociated} />
                    );
                }
                break;
            default:
                break;
        }
    }, [data.id, state])
    return <>
        <div>
            <Drawer
                anchor={"right"}
                open={data.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper drawer-1500px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{`View ${formName}`}</h3>
                                </div>
                                <div
                                    onClick={cancel}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>
                        <div>
                            {renderForms}
                        </div>
                    </div>
                </Container>
            </Drawer>
        </div>
    </>
}
export default ViewDetailedForms;