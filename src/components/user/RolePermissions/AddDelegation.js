import React, { useState, useEffect } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { DatePickerHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import Button from '../../layout/Button';
import { debounce } from 'lodash';
import Toaster from '../../common/Toaster';
import { loggedInUserId } from "../../../helper/auth";
import { acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength512 } from "../../../helper";
import { reactLocalStorage } from "reactjs-localstorage";
import { createDelegation, getDelegateeUserList, getDelegationHistory, getUserDelegationDetails } from "../../../actions/auth/AuthActions";
import DayTime from "../../common/DayTimeWrapper";

const AddDelegation = (props) => {
    const { isOpen, closeDrawer, anchor, data } = props;
    const isView = data?.isView
    const isEditMode = data?.isEdit
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [state, setState] = useState({
        isShowForm: false,
        ///MaterialTypeId: '',
        DataToChange: [],
        setDisable: false,
        showPopup: false,
        fromDate: '',
        toDate: '',
        remarks: '',
        allApprovalType: [],
        selectedApprovalType: [],
        selectedUsers: [],
        disableField: true,
        disableDates: false // This will be set to true when gridData.length > 0
    });
    const [gridData, setGridData] = useState([]);
    
    const { register, formState: { errors, isDirty }, control, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const {
        register: registerTableForm,
        handleSubmit: handleSubmitTableForm,
        control: controlTableForm,
        setValue: setValueTableForm,
        getValues: getValuesTableForm,
        formState: { errors: errorsTableForm },
        reset: resetTableForm,
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const moduleType = reactLocalStorage.getObject('moduleType')
    const delegateeUserList = useSelector(state => state.auth.delegateeUserList)
    useEffect(() => {
        if (!isView) {
            const allApprovalType = Object.entries(moduleType).map(([key, value]) => ({
                label: key,
                value: value
            }));
            setState(prevState => ({ ...prevState, allApprovalType: allApprovalType }));
        }
    }, [isView])

    useEffect(() => {
        if ((isView||isEditMode) && props?.data?.UserId) {
            dispatch(getUserDelegationDetails(props?.data?.UserId, (res) => {
                if (res?.data?.DataList?.length) {
                    const data = res.data.DataList;
                    const firstRecord = data?.[0];

                    // Update state using functional updates
                    setValue('Remarks', firstRecord?.Reason || '');
                    setValue('fromDate', DayTime(firstRecord?.DelegationStartDate).$d || '');
                    setValue('toDate', DayTime(firstRecord?.DelegationEndDate).$d || '');
                    setGridData(data.map(item => ({...item, isShowAction: false})))
                    setState(prevState => ({
                        ...prevState,
                        fromDate: firstRecord?.DelegationStartDate || '',
                        toDate: firstRecord?.DelegationEndDate || '',
                        remarks: firstRecord?.Reason || ''
                    }));
                }
            }));
        }
        if (props?.data?.isShowHistory) {
            dispatch(getDelegationHistory(props?.data?.UserId, (res) => {
                if (res?.data?.DataList?.length) {
                    const data = res.data.DataList;
                    setGridData(data)
                }
            }));
        }
    }, []);

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            disableDates: gridData.length > 0
        }));
    }, [gridData]);
    const renderListing = (label) => {
        const temp = []
        if (label === 'ApprovalType') {
            const moduleTypeArray = Object.entries(moduleType).map(([key, value]) => ({
                label: key,
                value: value
            }));
            if (!isEdit) {
                moduleTypeArray.unshift({ label: 'Select All', value: '0' });
            }
            temp.push(...moduleTypeArray)
            const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";

            if (isSelectAllOnly) {
                return [];
            } else {
                return temp;
            }
        }
        if (label === 'Users') {
            delegateeUserList && delegateeUserList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    };
    useEffect(() => {
        if (!isView) {
            getDelegateeUsers()
        }
    }, [state?.fromDate, state?.toDate])

    const getDelegateeUsers = () => {
        if (state?.fromDate && state?.toDate) {
            setState(prevState => ({ ...prevState, disableField: false }))
            let data = {
                delegatorUserId: props?.data?.UserId,
                startDate: DayTime(state?.fromDate).format('YYYY-MM-DD'),
                endDate: DayTime(state?.toDate).format('YYYY-MM-DD')
            }
            dispatch(getDelegateeUserList(data, () => { }));
        }
    };

    const handleApprovalType = (newValue) => {
        if(isEdit){
            setState(prevState => ({ ...prevState, selectedApprovalType: newValue }))
            setValueTableForm('ApprovalType', newValue)
        }
       else if (newValue&&newValue?.filter(element => element?.value === '0')?.length > 0) {
            setState(prevState => ({ ...prevState, selectedApprovalType: state.allApprovalType }))
            setTimeout(() => {
                setValueTableForm('ApprovalType', state.allApprovalType)
            }, 50);
        } else{
            setState(prevState => ({ ...prevState, selectedApprovalType: newValue }))
            setValueTableForm('ApprovalType', newValue)
        }
    }
    const handleUsers = (newValue) => {
        setState(prevState => ({ ...prevState, selectedUsers: newValue }))
    }
    const resetData = () => {
        setValueTableForm('ApprovalType', [])
        setValueTableForm('Users', [])
        delete errorsTableForm.ApprovalType
        delete errorsTableForm.Users
        setIsEdit(false)
        setEditIndex('')
        setState(prevState => ({ ...prevState, selectedApprovalType: [], selectedUsers: [] }));
    }


    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setIsEdit(false);
        resetData();
    };

    const onSubmit = debounce(values => {
        let formData = {
            "DelegatorUserId": props?.data?.UserId,
            "LoggedInUserId": loggedInUserId(),
            "Reason": values?.Remarks,
            "DelegationRequestDetails": gridData
        }
        dispatch(createDelegation(formData, (res) => {
            if (res.data?.Result) {
                Toaster.success('Delegation created successfully')
                props.hideForm('Save')
            }
        }));

    }, 500);

    const addRow = () => {
        // Create array of objects for approval types
        let newRows = [];
        if (isEdit) {
            // Handle single object case when editing
            const editedRow = {
                "DelegateeUserId": state?.selectedUsers?.value,
                "DelegateeUser": state?.selectedUsers?.label,
                "DelegationStartDate": DayTime(state?.fromDate).format('YYYY-MM-DD'),
                "DelegationEndDate": DayTime(state?.toDate).format('YYYY-MM-DD'),
                "ModuleId": state?.selectedApprovalType?.value,
                "ModuleName": state?.selectedApprovalType?.label,
                "isShowAction": true
            };

            // Check if anything changed
            const existingRow = gridData[editIndex];
            if (existingRow.DelegateeUserId === editedRow.DelegateeUserId &&
                String(existingRow.ModuleId) === String(editedRow.ModuleId) &&
                existingRow.DelegationStartDate === editedRow.DelegationStartDate &&
                existingRow.DelegationEndDate === editedRow.DelegationEndDate) {
                resetData();
                return;
            }

            newRows = [editedRow];
        } else {
            // Handle array case when adding new
            newRows = state?.selectedApprovalType?.map(type => ({
                "DelegateeUserId": state?.selectedUsers?.value,
                "DelegateeUser": state?.selectedUsers?.label,
                "DelegationStartDate": DayTime(state?.fromDate).format('YYYY-MM-DD'),
                "DelegationEndDate": DayTime(state?.toDate).format('YYYY-MM-DD'),
                "ModuleId": type.value,
                "ModuleName": type.label,
                "isShowAction": true
            }));
        }

        // Check for duplicates
        let isDuplicate = false;
        newRows.forEach(newRow => {
            gridData.forEach((existingRow, index) => {
                // Skip checking against self when editing
                if (isEdit && index === editIndex) {
                    return;
                }

                // Check for duplicates in both edit and normal modes
                if (String(existingRow.ModuleId) === String(newRow.ModuleId) &&
                    existingRow.DelegateeUserId === newRow.DelegateeUserId) {
                    isDuplicate = true;
                }
            });
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        // Add all new rows to grid data
        if (isEdit) {
            const updatedGridData = [...gridData];
            updatedGridData[editIndex] = newRows[0];
            setGridData(updatedGridData);
        } else {
            setGridData([...gridData, ...newRows]);
        }
        resetData();
    };
    const editItemDetails = (index) => {
        setEditIndex(index)
        setIsEdit(true)

        const editObj = gridData[index]
        setValueTableForm('ApprovalType', { label: editObj?.ModuleName, value: editObj?.ModuleId });
        setValueTableForm('Users', { label: editObj?.DelegateeUser, value: editObj?.DelegateeUserId });
        setState(prevState => ({ ...prevState, selectedApprovalType: { label: editObj?.ModuleName, value: editObj?.ModuleId }, selectedUsers: { label: editObj?.DelegateeUser, value: editObj?.DelegateeUserId } }));
    }

    const toggleDrawer = (event, type) => {
        props.hideForm(type)
    };

    const handleFromEffectiveDateChange = (date) => {
        setState(prevState => ({
            ...prevState,
            fromDate: date,
        }));
    };
    const handleToEffectiveDateChange = (date) => {
        setState(prevState => ({
            ...prevState,
            toDate: date,
        }));
    };
    /**
* @method handleMessageChange
* @description used remarks handler
*/
    const handleMessageChange = (e) => {
        setState(prevState => ({
            ...prevState,
            remarks: e?.target?.value,
        }))
    }
    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper layout-min-width-820px'}>
                        <form>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            {props?.data?.isShowHistory ? "Delegation History" : "Add Temporary Delegation"}
                                        </h3>
                                    </div>
                                    <div
                                        onClick={e => toggleDrawer(e, 'Cancel')}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            {!props?.data?.isShowHistory && <Row className="pl-3">
                                <Col md="6">
                                    <div className="inputbox date-section">
                                        <DatePickerHookForm
                                            name={`fromDate`}
                                            selected={state?.fromDate !== "" ? DayTime(state?.fromDate).format('DD/MM/YYYY') : ""}
                                            label={'From Date'}
                                            handleChange={(date) => {
                                                handleFromEffectiveDateChange(date);
                                            }}
                                            rules={{ required: true }}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            showMonthDropdown
                                            showYearDropdown
                                            dateFormat="DD/MM/YYYY"
                                            placeholder="Select date"
                                            customClassName="withBorder"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                            disabled={isView||state?.disableDates}
                                            mandatory={true}
                                            errors={errors && errors.fromDate}
                                            minDate={new Date()}
                                        />
                                    </div>
                                </Col>
                                <Col md="6">
                                    <div className="inputbox h-auto date-section">
                                        <DatePickerHookForm
                                            name={`toDate`}
                                            selected={state?.toDate !== "" ? DayTime(state?.toDate).format('DD/MM/YYYY') : ""}
                                            label={'To Date'}
                                            handleChange={(date) => {
                                                handleToEffectiveDateChange(date);
                                            }}
                                            rules={{ required: true }}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            showMonthDropdown
                                            showYearDropdown
                                            dateFormat="DD/MM/YYYY"
                                            placeholder={"Select date"}
                                            customClassName="withBorder"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                            disabled={isView||state?.disableDates}
                                            mandatory={true}
                                            errors={errors && errors.toDate}
                                            minDate={state.fromDate}
                                        />
                                    </div>
                                </Col>
                            </Row>}

                            {!props?.data?.isShowHistory && <form>
                                <Row className="pl-3">
                                    <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                        <div className="w-100">
                                            <SearchableSelectHookForm
                                                label={'Approval Type'}
                                                name={'ApprovalType'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={controlTableForm}
                                                rules={{ required: true }}
                                                register={registerTableForm}
                                                defaultValue={state.selectedApprovalType}
                                                options={renderListing('ApprovalType')}
                                                mandatory={true}
                                                handleChange={handleApprovalType}
                                                errors={errorsTableForm.ApprovalType}
                                                isMulti={isEdit ? false : true}
                                                selected={state.selectedApprovalType}
                                                disabled={state.disableField || isView}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                        <div className="w-100">
                                            <SearchableSelectHookForm
                                                label={'Users'}
                                                name={'Users'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={controlTableForm}
                                                rules={{ required: true }}
                                                register={registerTableForm}
                                                defaultValue={state.selectedUsers}
                                                options={renderListing('Users')}
                                                mandatory={true}
                                                handleChange={handleUsers}
                                                selected={state.selectedUsers}
                                                errors={errorsTableForm.Users}
                                                disabled={state.disableField || isView}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">

                                        <>
                                            <button
                                                type="button"
                                                className={"btn btn-primary pull-left mr5"}
                                                onClick={handleSubmitTableForm(addRow)}
                                            >
                                                {isEdit ? 'Update' : 'Add'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr5 ml-1 mt-0 add-cancel-btn cancel-btn"}
                                                onClick={() => resetData()}
                                            >
                                                <div className={"cancel-icon"}></div>Reset
                                            </button>
                                        </>

                                    </Col>
                                </Row >
                            </form>}
                            <br />
                            <Col md="12" className="mb-2 pl-2 pr-3">
                                <Table className="table mb-0 forging-cal-table" size="sm">
                                    <thead>
                                        <tr>
                                            {props?.data?.isShowHistory && <th>{`Start Date`}</th>}
                                            {props?.data?.isShowHistory && <th>{`End Date`}</th>}
                                            <th>{`Approval Type`}</th>
                                            <th>{`Users`}</th>
                                            {props?.data?.isShowHistory && <th>{`Remarks`}</th>}
                                            {!props?.data?.isShowHistory  && <th className='text-right'>{`Action`}</th>}
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {gridData && gridData?.length > 0 ? (
                                            <>
                                                {gridData.map((item, index) => (
                                                    <tr key={index}>
                                                        {props?.data?.isShowHistory && <td>{DayTime(item?.DelegationStartDate).format('DD/MM/YYYY')}</td>}
                                                        {props?.data?.isShowHistory && <td>{DayTime(item?.DelegationEndDate).format('DD/MM/YYYY')}</td>}
                                                        <td>{item?.ModuleName}</td>
                                                        <td>{item?.DelegateeUser}</td>
                                                        {props?.data?.isShowHistory && <td>{item?.Reason}</td>}
                                                        {!props?.data?.isShowHistory && <td className='text-right'>
                                                            <button
                                                                className="Edit"
                                                                title='Edit'
                                                                type={"button"}
                                                                onClick={() => editItemDetails(index)}
                                                                disabled={!item?.isShowAction || isView}
                                                            />
                                                            <button
                                                                className="Delete ml-1"
                                                                title='Delete'
                                                                type={"button"}
                                                                onClick={() => deleteItem(index)}
                                                                disabled={!item?.isShowAction || isView}
                                                            />
                                                        </td>}
                                                    </tr>
                                                ))}
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={props?.data?.isShowHistory ? 6 : 5}>
                                                    <NoContentFound title={EMPTY_DATA} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Col>
                            {!props?.data?.isShowHistory && <Col md="12" className="mb-2 pl-2 pr-3">
                                <TextAreaHookForm
                                    label={`Remarks`}
                                    name={"Remarks"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    rowHeight={6}
                                    mandatory={false}
                                    rules={{
                                        validate: { maxLength20, acceptAllExceptSingleSpecialCharacter },
                                        maxLength: {
                                            value: 20,
                                            message: "Remark should be less than 20 words"
                                        },
                                    }}
                                    handleChange={handleMessageChange}
                                    defaultValue={""}
                                    className=""
                                    customClassName={"textAreaWithBorder"}
                                    errors={errors.Remarks}
                                    disabled={isView}
                                />
                            </Col>}
                            <Row className=" no-gutters justify-content-between">
                                <div className="col-md-12">
                                    <div className="text-right ">
                                        <button
                                            id="AddDelegation_Cancel"
                                            type="button"
                                            onClick={(e) => toggleDrawer(e, 'Cancel')}
                                            value="CANCEL"
                                            className="mr15 cancel-btn"
                                        >
                                            <div className={"cancel-icon"}></div>
                                            CANCEL
                                        </button>
                                        {!props?.data?.isShowHistory && <button
                                            id="AddDelegation_Save"
                                            type="button"
                                            className="user-btn save-btn"
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isView}
                                        >
                                            <div className={"save-icon"}></div>
                                            SAVE
                                        </button>}
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
export default AddDelegation;