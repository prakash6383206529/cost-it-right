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

const AddDelegation = (props) => {
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
        fromDate: '',
        toDate: '',
        remarks: '',
        allApprovalType: [{ label: 'Costing', value: '1' },
            { label: 'Simulation', value: '2' },
            { label: 'Master', value: '3' },
            { label: 'Onboarding & Management', value: '4' }],
        selectedApprovalType: []    
    });
    const { register, formState: { errors, isDirty }, control, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    useEffect(() => {
    }, [])

    const [gridData, setGridData] = useState([]);
    const renderListing = (label) => {
        const temp = [  { label: 'Select All', value: '0' },
            { label: 'Costing', value: '1' },
            { label: 'Simulation', value: '2' },
            { label: 'Master', value: '3' },
            { label: 'Onboarding & Management', value: '4' },]
        if (label === 'ApprovalType') {
            // indexCommodityData && indexCommodityData.map((item) => {
            //     if (item.Value === '--0--') return false
            //     temp.push({ label: item.Text, value: item.Value })
            //     return null
            // })
            // return temp
            const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";

			if (isSelectAllOnly) {
				return [];
			} else {
				return temp;
			}
        }
    };

    const handleApprovalType = (newValue) => {
        console.log(newValue)
		if (newValue?.filter(element => element?.Value === '0')?.length > 0) {
            setState(prevState => ({ ...prevState, selectedApprovalType: state.allApprovalType }))
		} else {
            setState(prevState => ({ ...prevState, selectedApprovalType: newValue }))
		}
	}
    const resetData = () => {
        setIsEdit(false)
        setEditIndex('')
    }

    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setIsEdit(false);
        resetData();
    };

    const onSubmit = debounce(values => {
        if (isEdit) {
            setState(prevState => ({ ...prevState, setDisable: true }));
        
        } else {
            setState(prevState => ({ ...prevState, setDisable: true }));

        }
    }, 500);

    const updateRow = () => {
        const obj = {
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

        };
        const newGridData = [...gridData, obj];

        setGridData(newGridData);

        resetData();
    };

    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setEditIndex(index)
        setIsEdit(true)
    }

    const handleAddUpdateButtonClick = () => {
        if (isEdit) {
            updateRow();
        } else {
            addRow();
        }
        resetData();
    };

    const toggleDrawer = (event, formData, type) => {
        props.hideForm()
    };
    const cancel = (type) => {
        reset();
        toggleDrawer('', '', type);
    };

    const cancelHandler = () => {
        props.hideForm()
    };
    const onPopupConfirm = () => {
        cancel('cancel');
        setState(prevState => ({ ...prevState, showPopup: false }));
    };

    const closePopUp = () => {
        props.hideForm()
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
                    <div className={'drawer-wrapper layout-min-width-600px'}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            Add Temporary Delegation
                                        </h3>
                                    </div>
                                    <div
                                        onClick={e => toggleDrawer(e)}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row className="pl-3">
                            <Col md="6">
                                    <div className="inputbox date-section">
                                        <DatePickerHookForm
                                            name={`fromDate`}
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
                                            disabled={false}
                                            mandatory={true}
                                            errors={errors && errors.fromDate}
                                        />
                                    </div>
                                </Col>
                                <Col md="6">
                                    <div className="inputbox h-auto date-section">
                                        <DatePickerHookForm
                                            name={`toDate`}
                                            label={'To Date'}
                                            handleChange={(date) => {
                                                handleToEffectiveDateChange(date);
                                            }}
                                            rules={{ required: false }}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            showMonthDropdown
                                            showYearDropdown
                                            dateFormat="DD/MM/YYYY"
                                            placeholder={ "Select date" }
                                            customClassName="withBorder"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                            disabled={false}
                                            mandatory={false}
                                            errors={errors && errors.toDate}
                                            minDate={state.fromDate}
                                        />
                                    </div>
                                </Col>
                                </Row>
                                <Row className="pl-3">
                                 
                                </Row>
                                <Row className="pl-3">
                                <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                    <div className="w-100">
                                        <SearchableSelectHookForm
                                            label={'Approval Type'}
                                            name={'ApprovalType'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={''}
                                            options={renderListing('ApprovalType')}
                                            mandatory={true}
                                            handleChange={(option) => handleApprovalType(option)}
                                            errors={errors.ApprovalType}
                                            isMulti={true}
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
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={''}
                                            options={renderListing('ApprovalType')}
                                            mandatory={true}
                                            handleChange={(option) => handleApprovalType(option)}
                                            errors={errors.ApprovalType}
                                        />
                                    </div>
                                </Col>
                                <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
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
                                            <th>{`Approval Type`}</th>
                                            <th>{`Users`}</th>
                                            <th className='text-right'>{`Action`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {gridData.length > 0 ? (
                                            <>
                                                {gridData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.ApprovalType}</td>
                                                        <td>{item.Users}</td>
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
                            <Col md="12" className="mb-2 pl-2 pr-3">
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
                    disabled={false}
                />
            </Col>
                            <Row className=" no-gutters justify-content-between">
                                <div className="col-md-12">
                                    <div className="text-right ">
                                        <button
                                            id="AddDelegation_Cancel"
                                            type="button"
                                            onClick={cancelHandler}
                                            value="CANCEL"
                                            className="mr15 cancel-btn"
                                        >
                                            <div className={"cancel-icon"}></div>
                                            CANCEL
                                        </button>
                                        <button
                                            id="AddDelegation_Save"
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
                  
            {state.showPopup && (
                <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            )}
        </div>

    )
};
export default AddDelegation;