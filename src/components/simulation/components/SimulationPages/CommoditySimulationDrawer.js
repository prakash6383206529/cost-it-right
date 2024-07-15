import React, { useState, useEffect } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import NoContentFound from "../../../common/NoContentFound";
import { EMPTY_DATA } from "../../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../../config/message';
import Button from '../../../layout/Button';
import {
    getIndexSelectList, getCommodityNameInIndexSelectList, getCommodityCustomNameSelectListByType,
    getStandardizedCommodityListAPI, updateCommodityStandardization,
    createCommodityStandardization,
} from '../../../masters/actions/Indexation'
import { debounce, values } from 'lodash';
import Toaster from '../../../common/Toaster';
import { loggedInUserId } from "../../../../helper/auth";
import AddIndexationMaterialListing from "../../../masters/material-master/AddIndexationMaterialListing";

const CommoditySimulationDrawer = (props) => {
    const { isEditFlag, isOpen, closeDrawer, anchor } = props;
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [state, setState] = useState({
        isShowForm: false,
        ///MaterialTypeId: '',
        DataToChange: [],
        setDisable: false,
        showPopup: false,
    });
    const { register, formState: { errors, isDirty }, control, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const { indexCommodityData } = useSelector((state) => state.indexation);
    const { commodityInIndex } = useSelector((state) => state.indexation);
    const { customNameCommodityData } = useSelector((state) => state.indexation);
    //const { standardizedCommodityDataList } = useSelector((state) => state.indexation);


    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        CommodityExchangeName: '',
        CommodityName: '',
        CustomMaterialName: ''

    });


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
        // if (isEdit) {
        //     setState(prevState => ({ ...prevState, setDisable: true }));

        //     //   const updateData = {
        //     //     Index: values.Index,
        //     //     ModifiedBy: loggedInUserId(),            
        //     //     MaterialName: values.MaterialName,
        //     //     MaterialNameCustom: values.MaterialNameCustom,
        //     //     IsActive: true,
        //     //   };
        //     const updateData = {
        //         CommodityExchangeName: values.CommodityExchangeName,
        //         ModifiedBy: loggedInUserId(),
        //         CommodityName: values.CommodityName,
        //         CustomMaterialName: values.CustomMaterialName,
        //         IsActive: true,
        //     };

        //     dispatch(updateCommodityStandardization(updateData, res => {
        //         setState(prevState => ({ ...prevState, setDisable: false }));
        //         if (res?.data?.Result) {
        //             Toaster.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
        //             dispatch(getStandardizedCommodityListAPI('', res => { }));
        //             reset();
        //             toggleDrawer('', updateData, 'submit');
        //         }
        //     }));
        // } else {
        //     setState(prevState => ({ ...prevState, setDisable: true }));

        //     // const formData = {
        //     //     Index: values.Index,
        //     //     MaterialName: values.MaterialName,
        //     //     MaterialNameCustom: values.MaterialNameCustom,
        //     //     // MaterialType: values.MaterialType,
        //     //     // CalculatedDensityValue: values.CalculatedDensityValue,
        //     //     CreatedBy: loggedInUserId(),
        //     //     IsActive: true,
        //     // };

        //     const formDataToSubmit = {

        //         CommodityExchangeName: values.CommodityExchangeName,
        //         CommodityName: values.CommodityName,
        //         CustomMaterialName: values.CustomMaterialName,
        //         CreatedBy: loggedInUserId(),
        //         IsActive: true,
        //     };
        //     dispatch(createCommodityStandardization(formDataToSubmit, res => {

        //         setState(prevState => ({ ...prevState, setDisable: false }));

        //         if (res?.data?.Result) {
        //             Toaster.success(MESSAGES.COMMODITYNAME_ADD_SUCCESS);
        //             dispatch(getStandardizedCommodityListAPI('', res => { }));
        //             reset();
        //             toggleDrawer('', formDataToSubmit, 'submit');
        //         }
        //     }));
        // }
    }, 500);

    const updateRow = () => {
        const obj = {
            CommodityExchangeName: formData.CommodityExchangeName,
            CommodityName: formData.CommodityName,
            CustomMaterialName: formData.CustomMaterialName
        }

        const updatedGridData = gridData.map((item, index) =>
            index === editIndex ? obj : item
        );
        setGridData(updatedGridData);

        setIsEdit(false);
        resetData();
    };


    const addRow = () => {

        const obj = {

            CommodityExchangeName: formData.CommodityExchangeName,
            CommodityName: formData.CommodityName,
            CustomMaterialName: formData.CustomMaterialName
        };
        const newGridData = [...gridData, obj];

        setGridData(newGridData);

        resetData();
    };


    // const toggleDrawer = (event, formData, type) => {
    //     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    //         return;
    //     }
    // };
    const cancel = (type) => {
        console.log('type: ', type);
        reset();
        props.closeDrawer(type)
    };



    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper layout-min-width-820px'}>
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
                                    commodityDetails={[]}
                                    // isViewFlag={isViewFlag}
                                    setTotalBasicRate={() => { }}
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