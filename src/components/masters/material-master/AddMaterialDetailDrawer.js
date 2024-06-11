import React, { useState, useEffect } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import AddGrade from "./AddGrade";
import Button from '../../layout/Button';
import {
    getCommoditySelectListByType, getCommodityNameSelectListByType, getCommodityCustomNameSelectListByType,
    getStandardizedCommodityListAPI, createCommodityStandardizationData, updateCommodityStandardization,
} from '../../masters/actions/Indexation'
import { debounce, values } from 'lodash';
import Toaster from '../../common/Toaster';
import { loggedInUserId } from "../../../helper/auth";

const AddMaterialDetailDrawer = (props) => {
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
    const { nameCommodityData } = useSelector((state) => state.indexation);
    const { customNameCommodityData } = useSelector((state) => state.indexation);
    //const { standardizedCommodityDataList } = useSelector((state) => state.indexation);
    useEffect(() => {
        dispatch(getStandardizedCommodityListAPI(() => { }))
        dispatch(getCommoditySelectListByType(() => { }))
        dispatch(getCommodityNameSelectListByType(() => { }))
        dispatch(getCommodityCustomNameSelectListByType((res) => { }))

    }, [])

    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        CommodityExchangeName: '',
        CommodityName: '',
        CustomMaterialName: ''

    });



    const renderListing = (label) => {
        const temp = []
        if (label === 'CommodityExchangeName') {
            indexCommodityData && indexCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'CommodityName') {
            nameCommodityData && nameCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'CustomMaterialName') {
            customNameCommodityData && customNameCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        // if (label === 'Applicability') {
        //     return [
        //         { label: 'Option 1', value: 'Option1' },
        //         { label: 'Option 2', value: 'Option2' },
        //         { label: 'Option 3', value: 'Option3' },
        //     ];
        // }
    };

    const handleInputChange = (selectedOption, name) => {
        const updatedFormData = { ...formData, [name]: selectedOption.value };
        setFormData(updatedFormData);
    };
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

    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setIsEdit(false);
        resetData();
    };

    // const onSubmit = () => {
    //     if (isEdit) {
    //         updateRow()
    //     } else {
    //         addRow()
    //     }
    // };

    const onSubmit = debounce(values => {
        console.log('onssavebutton: ', values);
        if (isEdit) {          
            setState(prevState => ({ ...prevState, setDisable: true }));

            //   const updateData = {
            //     Index: values.Index,
            //     ModifiedBy: loggedInUserId(),            
            //     MaterialName: values.MaterialName,
            //     MaterialNameCustom: values.MaterialNameCustom,
            //     IsActive: true,
            //   };
            const updateData = {
                CommodityExchangeName: values.CommodityExchangeName,
                ModifiedBy: loggedInUserId(),
                CommodityName: values.CommodityName,
                CustomMaterialName: values.CustomMaterialName,
                IsActive: true,
            };

            dispatch(updateCommodityStandardization(updateData, res => {
                setState(prevState => ({ ...prevState, setDisable: false }));
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
                    dispatch(getStandardizedCommodityListAPI('', res => { }));
                    reset();
                    toggleDrawer('', updateData, 'submit');
                }
            }));
        } else {
            setState(prevState => ({ ...prevState, setDisable: true }));

            // const formData = {
            //     Index: values.Index,
            //     MaterialName: values.MaterialName,
            //     MaterialNameCustom: values.MaterialNameCustom,
            //     // MaterialType: values.MaterialType,
            //     // CalculatedDensityValue: values.CalculatedDensityValue,
            //     CreatedBy: loggedInUserId(),
            //     IsActive: true,
            // };

            const formDataToSubmit = {

                CommodityExchangeName: values.CommodityExchangeName,
                CommodityName: values.CommodityName,
                CustomMaterialName: values.CustomMaterialName,
                CreatedBy: loggedInUserId(),
                IsActive: true,
            };
            dispatch(createCommodityStandardizationData(formDataToSubmit, res => {

                setState(prevState => ({ ...prevState, setDisable: false }));

                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.COMMODITYNAME_ADD_SUCCESS);
                    dispatch(getStandardizedCommodityListAPI('', res => { }));
                    reset();
                    toggleDrawer('', formDataToSubmit, 'submit');
                }
            }));
        }
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
        //console.log('formData: ', formData);
        const newGridData = [...gridData, obj];
        setGridData(newGridData);

        resetData();
    };

    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setFormData({
            CommodityExchangeName: editObj.CommodityExchangeName,
            CommodityName: editObj.CommodityName,
            CustomMaterialName: editObj.CustomMaterialName
        });
        setValue('CommodityExchangeName', { label: editObj.CommodityExchangeName, value: editObj.CommodityExchangeName })
        setValue('CommodityName', { label: editObj.CommodityName, value: editObj.CommodityName })
        setValue('CustomMaterialName', { label: editObj.CustomMaterialName, value: editObj.CustomMaterialName })
        setEditIndex(index)
        setIsEdit(true)
    }

    const handleAddUpdateButtonClick = () => {
        if (!formData.CommodityExchangeName || !formData.CommodityName || !formData.CustomMaterialName) {
            return;
        }
        if (isEdit) {
            updateRow();
        } else {
            addRow();
        }
        resetData();
    };

    const toggleDrawer = (event, formData, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('', formData, type);
    };
    const cancel = (type) => {
        reset();
        dispatch(getStandardizedCommodityListAPI('', res => { }));
        toggleDrawer('', '', type);
    };

    const cancelHandler = () => {
        if (isDirty) {
            setState(prevState => ({ ...prevState, showPopup: true }));
        } else {
            cancel('cancel');
        }
    };
    const onPopupConfirm = () => {
        cancel('cancel');
        setState(prevState => ({ ...prevState, showPopup: false }));
    };

    const closePopUp = () => {
        setState(prevState => ({ ...prevState, showPopup: false }));
    };
    const indexToggler = (Id = '') => {
        setState(prevState => ({ ...prevState, isOpenIndex: true }));
    }
    const closeIndex = () => {
        setState(prevState => ({ ...prevState, isOpenIndex: false }));
    }
    // const closeFuelDrawer = (e = '', reqData = {}) => {
    //     console.log('reqData: ', reqData);
    //     setState(prevState => ({ ...prevState, isOpenIndex: false }));
    //     setTimeout(() => {
    //         dispatch(getCommodityCustomNameSelectListByType((res) => {
    //             console.log('res: ', res);

    //             //let obj = customNameCommodityData.find(item => item.CommodityStandardName === reqData.MaterialName)
    //                 /*TO SHOW FUEL NAME VALUE PRE FILLED FROM DRAWER*/
    //                 if (Object.keys(reqData).length > 0) {
    //                     let obj = customNameCommodityData.find(item => item.CustomMaterialName === reqData.CommodityStandardName)


    //                 //     setValue({ CustomMaterialName: obj ? { label: obj.CustomMaterialName, value: obj.CustomMaterialName } : [] });
    //                 //     // setValue({ CustomMaterialName: fuelObj && fuelObj !== undefined ? { label: fuelObj.CustomMaterialName, value: fuelObj.CustomMaterialName } : [] })
    //                 //     //setValue('CustomMaterialName', { label: editObj.CustomMaterialName, value: editObj.CustomMaterialName })
    //                 setValue({ CustomMaterialName: obj ? { label: obj.CustomMaterialName, value: obj.CustomMaterialName } : [] });
    //                  }
    //                // setValue({ CustomMaterialName: obj ? { label: obj.CustomMaterialName, value: obj.CustomMaterialName } : [] });
    //         })
    // )}, 500);

    // }

    const closeFuelDrawer = (e = '', reqData = {}) => {
        console.log('reqData: ', reqData);
        setState(prevState => ({ ...prevState, isOpenIndex: false }));

        // dispatch(getCommodityCustomNameSelectListByType((res) => {
        //     console.log('res: ', res);

        //     const customNameCommodityData = res.data; // Assuming res.data contains your data
        //     console.log('customNameCommodityData: ', customNameCommodityData);

        //     // if (Object.keys(reqData).length > 0) {
        //     //     let obj = customNameCommodityData.find(item => item.CustomMaterialName === reqData.CommodityStandardName);

        //     //     setValue({ CustomMaterialName: obj ? { label: obj.CustomMaterialName, value: obj.CustomMaterialName } : [] });

        //     // }
        //     // if (Object.keys(reqData).length > 0) {
        //     //     let obj = customNameCommodityData.find(item => item.CustomMaterialName === reqData.CommodityStandardName);
        //     //     console.log('obj: ', obj);

        //     //     if (obj) {
        //     //         setValue('CustomMaterialName', { label: obj.CustomMaterialName, value: obj.CustomMaterialName });
        //     //     }
        //     // }
        //     let obj = customNameCommodityData.find(item => item.CustomMaterialName === reqData.CommodityStandardName);
        //     console.log('obj: ', obj);

        //     if (obj) {
        //         setValue('CustomMaterialName', { label: obj.CustomMaterialName, value: obj.CustomMaterialName });
        //     }
        // }));
        dispatch(getCommodityCustomNameSelectListByType())
        .then((res) => {
            console.log('res: ', res);

            const customNameCommodityData = res.data; // Assuming res.data contains your data
            console.log('customNameCommodityData: ', customNameCommodityData);

            const obj = customNameCommodityData.find(item => item.CustomMaterialName === reqData.CommodityStandardName);
            console.log('obj: ', obj);

            if (obj) {
                setValue('CustomMaterialName', { label: obj.CustomMaterialName, value: obj.CustomMaterialName });
            }
        })
        .catch((error) => {
            console.error('Error fetching custom name commodity data:', error);
            // Handle the error accordingly
        });
    }
    
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
                                            Commodity Standardization
                                        </h3>
                                    </div>
                                    <div
                                        onClick={e => toggleDrawer(e)}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row className="pl-3">
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={'Index'}
                                        name={'CommodityExchangeName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        //options={renderListing('Applicability')}
                                        options={renderListing("CommodityExchangeName")}
                                        mandatory={true}
                                        handleChange={(option) => handleInputChange(option, 'CommodityExchangeName')}
                                        errors={errors.Index}
                                    ///handleChangeDescription={handleRMChange}
                                    />
                                </Col>
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={'Commodity Name (In Index)'}
                                        name={'CommodityName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        //options={renderListing('Applicability')}
                                        options={renderListing('CommodityName')}
                                        mandatory={true}
                                        handleChange={(option) => handleInputChange(option, 'CommodityName')}
                                        errors={errors.MaterialName}
                                    />
                                </Col>
                                <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                    <div className="w-100">
                                        <SearchableSelectHookForm
                                            label={'Commodity Name (In CIR)'}
                                            name={'CustomMaterialName'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={''}
                                            //options={renderListing('Applicability')}
                                            options={renderListing('CustomMaterialName')}
                                            mandatory={true}
                                            handleChange={(option) => handleInputChange(option, 'CustomMaterialName')}
                                            errors={errors.MaterialNameCustom}
                                        />
                                    </div>
                                    <Button
                                        id="GradeId-add"
                                        className={"right mt-4 mb"}
                                        variant={"plus-icon-square"}
                                        onClick={() => indexToggler("")}
                                    />
                                </Col>

                                <Col md="12" className={`d-flex justify-content-end  `}>
                                    {isEdit ? (
                                        <>
                                            <button
                                                type="button"
                                                className={"btn btn-primary pull-left mr5"}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr5 ml-1 mt-0 add-cancel-btn cancel-btn"}
                                                onClick={() => resetData()}
                                            >
                                                <div className={"cancel-icon"}></div>Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className={`user-btn ${initialConfiguration.IsShowCRMHead ? '' : ''} pull-left`}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                <div className={"plus"}></div>ADD

                                            </button>
                                            <button
                                                type="button"
                                                className={`ml-1 ${initialConfiguration.IsShowCRMHead ? '' : ''} reset-btn`}
                                                onClick={() => resetData()}
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </Col>
                            </Row >
                            <br />
                            <Col md="12" className="mb-2 pl-2 pr-3">
                                <Table className="table mb-0 forging-cal-table" size="sm">
                                    <thead>
                                        <tr>
                                            <th>{`Index`}</th>
                                            <th>{`Commodity Name (In index)`}</th>
                                            <th>{`Commodity Name (In CIR)`}</th>
                                            <th className='text-right'>{`Action`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {gridData.length > 0 ? (
                                            <>
                                                {gridData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.CommodityExchangeName}</td>
                                                        <td>{item.CommodityName}</td>
                                                        <td>{item.CustomMaterialName}</td>
                                                        <td className='text-right'>
                                                            <button
                                                                className="Edit"
                                                                title='Edit'
                                                                type={"button"}
                                                                onClick={() => editItemDetails(index)}
                                                            />
                                                            <button
                                                                className="Delete ml-1"
                                                                title='Delete'
                                                                type={"button"}
                                                                onClick={() => deleteItem(index)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={4}>
                                                    <NoContentFound title={EMPTY_DATA} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Col>

                            <Row className=" no-gutters justify-content-between">
                                <div className="col-md-12">
                                    <div className="text-right ">
                                        <button
                                            id="AddMaterialType_Cancel"
                                            type="button"
                                            onClick={cancelHandler}
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
            {state.isOpenIndex && (
                <AddGrade
                    isOpen={state.isOpenIndex}
                    // closeDrawer={closeIndex}
                    closeDrawer={closeFuelDrawer}
                    isEditFlag={isEditFlag}
                    //CustomMaterialName={state.CustomMaterialName}
                    //commodityCustom_Id={commodityCustom_Id}
                    // RawMaterial={this.state.RawMaterial}
                    // ID={this.state.Id}
                    anchor={"right"}
                    // specificationId={this.state.specificationId}
                    isShowIndex={true}

                />
            )}            {state.showPopup && (
                <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            )}
        </div>

    )
};
export default AddMaterialDetailDrawer;