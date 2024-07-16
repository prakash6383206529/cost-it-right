import React, { useState, useEffect } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";


import { debounce, values } from 'lodash';

import AddIndexationMaterialListing from "../../../masters/material-master/AddIndexationMaterialListing";

const CommoditySimulationDrawer = (props) => {
    console.log('props: ', props);
    const { rowData } = props?.rowData

    const { isEditFlag, isOpen, anchor } = props;
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [state, setState] = useState({
        isShowForm: false,
        ///MaterialTypeId: '',
        DataToChange: [],
        setDisable: false,
        showPopup: false,
    });
    const { formState: { errors }, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()



    const [gridData, setGridData] = useState([]);
    const [basicRate, setBasicRate] = useState('')
    const [formData, setFormData] = useState({
        CommodityExchangeName: '',
        CommodityName: '',
        CustomMaterialName: ''

    });

    const setTotalBasicRate = (basicRateFromDrawer) => {
        setBasicRate(basicRateFromDrawer)
    }

    const resetData = () => {
        setValue('CommodityExchangeName', '');
        setValue('CommodityName', '');
        setValue('CustomMaterialName', '');
        setIsEdit(false)
        setEditIndex('')
        setFormData({
            CommodityExchangeName: '',
            CommodityName: '',
            CustomMaterialName: ''
        });
    }


    const onSubmit = debounce(values => {
        props.closeDrawer('Save', basicRate)

    });




    const saveRow = () => {

        const obj = {
            CommodityExchangeName: formData.CommodityExchangeName,
            CommodityName: formData.CommodityName,
            CustomMaterialName: formData.CustomMaterialName
        };
        const newGridData = [...gridData, obj];

        setGridData(newGridData);

        resetData();
    };


    const cancel = (type) => {

        reset();
        props.closeDrawer(type)
    };



    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper drawer-1500px px-2'}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            Commodity Details
                                        </h3>
                                    </div>
                                    <div
                                        onClick={() => cancel('Close')}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row>
                                <AddIndexationMaterialListing
                                    states={state}
                                    isOpen={true}
                                    commodityDetails={props?.commodityDetails}
                                    isFromSimulation={true}
                                    isViewFlag={props?.isViewFlag}
                                    setTotalBasicRate={setTotalBasicRate}
                                    closeDrawer={cancel}
                                />
                            </Row>

                            <Row className=" no-gutters justify-content-between">
                                <div className="col-md-12">
                                    <div className="text-right ">
                                        <button
                                            id="AddMaterialType_Cancel"
                                            type="button"
                                            onClick={cancel}
                                            value="CANCEL"
                                            className="mr15 cancel-btn"

                                        >
                                            <div className={"cancel-icon"}></div>
                                            CANCEL
                                        </button>
                                        <button
                                            id="AddMaterialType_Save"
                                            type="submit"
                                            className="user-btn save-btn"
                                            disabled={props?.isViewFlag}
                                        >
                                            {" "}
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? "UPDATE" : "SAVE"}
                                        </button>
                                    </div>
                                </div>
                            </Row>

                        </form>
                    </div>
                </Container>
            </Drawer>

        </div>

    )
};
export default CommoditySimulationDrawer;