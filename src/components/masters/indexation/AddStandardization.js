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
import Button from '../../layout/Button';
import {
    getIndexSelectList, getCommodityNameInIndexSelectList, getCommodityCustomNameSelectListByType,
    getStandardizedCommodityListAPI, updateCommodityStandardization,
    createCommodityStandardization,
} from '../../masters/actions/Indexation'
import { debounce, values } from 'lodash';
import Toaster from '../../common/Toaster';
import { loggedInUserId } from "../../../helper/auth";
import AddGrade from "../material-master/AddGrade";

const AddStandardization = (props) => {
    const { isEditFlag, isOpen, closeDrawer, anchor } = props;
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [state, setState] = useState({
        isShowForm: false,
        ///MaterialTypeId: '',
        DataToChange: [],
        setDisable: true,
        showPopup: false,
    });
    const { register, formState: { errors, isDirty }, control, setValue, getValues, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const { indexCommodityData } = useSelector((state) => state.indexation);
    const { commodityInIndex } = useSelector((state) => state.indexation);
    const { customNameCommodityData } = useSelector((state) => state.indexation);
    //const { standardizedCommodityDataList } = useSelector((state) => state.indexation);
    useEffect(() => {
        dispatch(getIndexSelectList(() => { }))
        dispatch(getCommodityCustomNameSelectListByType((res) => { }))
        if (isEditFlag) {
            dispatch(getStandardizedCommodityListAPI(props?.ID, '', '', '', true, (res) => {
                const data = res.data.DataList[0]
                console.log('data: ', data);
                setValue('IndexExchangeName', { label: data.IndexExchangeName, value: data.IndexExchangeId })
                setValue('CommodityName', { label: data.CommodityName, value: data.IndexExchangeCommodityLinkingId })
                setValue('CommodityStandardName', { label: data.CommodityStandardName, value: data.CommodityStandardId })
                setCommodityStandardizationId(data.CommodityStandardizationId)
            }))
        }

    }, [])

    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        IndexExchangeName: '',
        CommodityName: '',
        CommodityStandardName: ''

    });
    const [commodityStandardizationId, setCommodityStandardizationId] = useState('');


    const renderListing = (label) => {
        const temp = []
        if (label === 'IndexExchangeName') {
            indexCommodityData && indexCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'CommodityName') {
            commodityInIndex && commodityInIndex.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'CommodityStandardName') {
            customNameCommodityData && customNameCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    };

    const handleInputChange = (selectedOption, name) => {
        const updatedFormData = { ...formData, [name]: selectedOption.value };
        setFormData(updatedFormData);
        if (name === 'IndexExchangeName') {
            if (selectedOption && selectedOption !== '') {
                setState(prevState => ({ ...prevState, setDisable: false }));
                dispatch(getCommodityNameInIndexSelectList(selectedOption.value, (res) => { }));
                setValue('CommodityName', '')
            } else {
                setState(prevState => ({ ...prevState, setDisable: true }));
                dispatch(getCommodityNameInIndexSelectList('', (res) => { }));
            }
        }
    };

    const onSubmit = debounce((values) => {

        if (!isEditFlag) {
            const formDataToSubmit = gridData.map(item => ({
                ...item,
                LoggedInUserId: loggedInUserId()
            }));
            dispatch(createCommodityStandardization(formDataToSubmit, res => {

                setState(prevState => ({ ...prevState, setDisable: false }));

                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.COMMODITYNAME_ADD_SUCCESS);
                    reset();
                    toggleDrawer('', formDataToSubmit, 'submit');
                }
            }));
        } else {
            const updatedFormData =
            {
                "CommodityStandardizationId": commodityStandardizationId,
                "CommodityStandardId": getValues('CommodityStandardName') ? getValues('CommodityStandardName')?.value : '',
                "IndexExchangeCommodityLinkingId": getValues('CommodityName') ? getValues('CommodityName')?.value : '',
                "LoggedInUserId": loggedInUserId(),
            }

            dispatch(updateCommodityStandardization(updatedFormData, res => {
                Toaster.success(MESSAGES.COMMODITYNAME_UPDATE_SUCCESS);
                reset();
                toggleDrawer('', updatedFormData, 'submit');
            }))
        }
    }, 500);


    const toggleDrawer = (event, formData, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('', formData, type);
    };
    const cancel = (type) => {
        reset();
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
        setState(prevState => ({ ...prevState, isOpenCommodity: true }));
    }
    const closeCommodityDrawer = (e, formData, type) => {
        setState(prevState => ({ ...prevState, isOpenCommodity: false }));
        if (type !== 'cancel')
            dispatch(getCommodityCustomNameSelectListByType((res) => { }))
    }
    const addData = () => {
        if (!getValues('IndexExchangeName') || !getValues('CommodityName') || !getValues('CommodityStandardName')) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        if (errors.IndexExchangeName || errors.CommodityName || errors.CommodityStandardName) return false;

        const newData = {
            IndexExchangeName: getValues('IndexExchangeName') ? getValues('IndexExchangeName').label : '',
            CommodityName: getValues('CommodityName') ? getValues('CommodityName').label : '',
            CommodityStandardName: getValues('CommodityStandardName') ? getValues('CommodityStandardName').label : '',
            IndexExchangeCommodityLinkingId: getValues('CommodityName') ? getValues('CommodityName')?.value : '',
            CommodityStandardId: getValues('CommodityStandardName') ? getValues('CommodityStandardName')?.value : '',
        };

        let isDuplicate = false;
        gridData.map((item, index) => {
            if (index !== editIndex) {
                if (item.IndexExchangeName === newData.IndexExchangeName &&
                    item.CommodityName === newData.CommodityName &&
                    item.CommodityStandardName === newData.CommodityStandardName) {
                    isDuplicate = true;
                }
            }
            return null;
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        if (isEditMode) {
            const updatedGridData = [...gridData];
            updatedGridData[editIndex] = newData;
            setGridData(updatedGridData);
        } else {
            setGridData([...gridData, newData]);
        }

        resetData();
        setIsEditMode(false);
        setEditIndex('');
    };
    const resetData = (type = '') => {
        const commonReset = () => {
            setEditIndex('');
            setIsEditMode(false);
            reset({
                IndexExchangeName: '',
                CommodityName: '',
                CommodityStandardName: '',
            });
        };

        commonReset();
    };
    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            let temp = [];
            gridData && gridData.map((item, index) => {
                if (index !== indexValue) {
                    temp.push(item);
                }
            });
            setGridData(temp);
            resetData();
        }

        if (operation === 'edit') {
            setEditIndex(indexValue);
            setIsEditMode(true);

            let Data = gridData[indexValue];
            setValue('IndexExchangeName', { label: Data.IndexExchangeName, value: Data.IndexExchangeName });
            setValue('CommodityName', { label: Data.CommodityName, value: Data.CommodityName });
            setValue('CommodityStandardName', { label: Data.CommodityStandardName, value: Data.CommodityStandardName });
        }
    };

    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper layout-min-width-820px'}>
                        <form >
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
                                        name={'IndexExchangeName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        //options={renderListing('Applicability')}
                                        options={renderListing("IndexExchangeName")}
                                        mandatory={true}
                                        handleChange={(option) => handleInputChange(option, 'IndexExchangeName')}
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
                                        disabled={isEditFlag ? false : state.setDisable}
                                    />
                                </Col>
                                <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                    <div className="w-100">
                                        <SearchableSelectHookForm
                                            label={'Commodity Name (In CIR)'}
                                            name={'CommodityStandardName'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={''}
                                            //options={renderListing('Applicability')}
                                            options={renderListing('CommodityStandardName')}
                                            mandatory={true}
                                            handleChange={(option) => handleInputChange(option, 'CommodityStandardName')}
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
                                {!isEditFlag &&
                                    <Col md="3" >
                                        <button
                                            type="button"
                                            className={"user-btn  pull-left mt-1"}
                                            onClick={addData}
                                            disabled={props.ViewMode}
                                        >
                                            {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                        </button>
                                        <button
                                            type="button"
                                            className={"reset-btn pull-left mt-1 ml5"}
                                            onClick={() => resetData("reset")}
                                            disabled={props.ViewMode}
                                        >
                                            {isEditMode ? "CANCEL" : 'RESET'}
                                        </button>
                                    </Col >}
                            </Row >
                            <br />
                            {!isEditFlag && <Col md="12" className="mb-2 pl-2 pr-3">
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
                                                        <td>{item.IndexExchangeName}</td>
                                                        <td>{item.CommodityName}</td>
                                                        <td>{item.CommodityStandardName}</td>
                                                        <td className='text-right'>
                                                            <button
                                                                className="Edit"
                                                                title='Edit'
                                                                type={"button"}
                                                                onClick={() => editData(index, 'edit')}
                                                            />
                                                            <button
                                                                className="Delete ml-1"
                                                                title='Delete'
                                                                type={"button"}
                                                                onClick={() => editData(index, 'delete')}
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
                            </Col>}

                            <Row className=" no-gutters justify-content-between">
                                <div className="col-md-12">
                                    <div className="text-right ">

                                        <Button
                                            id="addStandardization_cancel"
                                            className="mr5 mt-0"
                                            onClick={cancelHandler}
                                            disabled={false}
                                            variant="cancel-btn"
                                            icon="cancel-icon"
                                            buttonName="Cancel"
                                        />
                                        <Button
                                            id="addStandardization_updateSave"
                                            type="button"
                                            className="mr5"
                                            onClick={(data, e) => { handleSubmit(onSubmit(data, e)) }}
                                            icon={"save-icon"}
                                            buttonName={isEditFlag ? "Update" : "Save"}
                                        />

                                    </div>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
            {state.isOpenCommodity && (
                <AddGrade
                    isOpen={state.isOpenCommodity}
                    closeDrawer={closeCommodityDrawer}
                    // closeDrawer={closeFuelDrawer}
                    isEditFlag={isEditFlag}
                    //CommodityStandardName={state.CommodityStandardName}
                    //commodityCustom_Id={commodityCustom_Id}
                    // RawMaterial={this.state.RawMaterial}
                    // ID={this.state.Id}
                    anchor={"right"}
                    // specificationId={this.state.specificationId}
                    isShowCommodity={true}

                />
            )}            {state.showPopup && (
                <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            )}
        </div>

    )
};
export default AddStandardization;