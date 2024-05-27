import React, { useState } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';

const AddMaterialDetailDrawer = ({ isEditFlag, isOpen, closeDrawer, anchor }) => {

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [state, setState] = useState({
        isShowForm: false,
        MaterialTypeId: '',
        DataToChange: [],
        setDisable: false,
        showPopup: false,
    });
    const { register, formState: { errors, isDirty }, control, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        MaterialName: '',
        MaterialType: ''
    });

    const handleMaterialIndexChange = (selectedOption) => {
        setFormData({ ...formData, MaterialName: selectedOption.value });
    };

    const renderListing = (label) => {
        if (label === 'Applicability') {
            return [
                { label: 'Option 1', value: 'Option1' },
                { label: 'Option 2', value: 'Option2' },
                { label: 'Option 3', value: 'Option3' },
            ];
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetData = () => {
        setValue('MaterialName', '');
        setValue('MaterialType', '');
        setIsEdit(false)
        setEditIndex('')
    }

    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setIsEdit(false);
        resetData();
    };

    const onSubmit = () => {
        if (isEdit) {
            updateRow()
        } else {
            addRow()
        }
    };

    const updateRow = () => {
        const obj = {
            MaterialName: formData.MaterialName,
            MaterialType: formData.MaterialType
        }

        let tempArr = [...gridData];
        tempArr[editIndex] = obj;
        setGridData(tempArr);

        setIsEdit(false);
        resetData();
    };

    const addRow = () => {

        const obj = {
            MaterialName: formData.MaterialName,
            MaterialType: formData.MaterialType,
        };
        const newGridData = [...gridData, obj];
        setGridData(newGridData);

        resetData();
    };

    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setValue('MaterialName', { label: editObj.MaterialName, value: editObj.MaterialName })
        setValue('MaterialType', editObj.MaterialType)
        setEditIndex(index)
        setIsEdit(true)
    }

    const handleAddUpdateButtonClick = () => {
        if (!formData.MaterialName || !formData.MaterialType) {
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
        // dispatch(getMaterialTypeDataAPI('', res => { }));
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
    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper layout-min-width-720px'}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            Add Material
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
                                    <SearchableSelectHookForm
                                        label={'Material Index'}
                                        name={'MaterialName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        options={renderListing('Applicability')}
                                        mandatory={true}
                                        handleChange={handleMaterialIndexChange}
                                        errors={errors.MaterialIndex}
                                    />
                                </Col>
                                <Col md="6">
                                    <TextFieldHookForm
                                        label="Index Type"
                                        name={"MaterialType"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        handleChange={handleInputChange}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                    />

                                </Col>
                                <Col md="4" className={`${initialConfiguration.IsShowCRMHead ? "mb-3" : "pt-1"} d-flex`}>
                                    {isEdit ? (
                                        <>
                                            <button
                                                type="button"
                                                className={"btn btn-primary mt30 pull-left mr5"}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                                onClick={() => resetData()}
                                            >
                                                <div className={"cancel-icon"}></div>Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className={`user-btn ${initialConfiguration.IsShowCRMHead ? '' : 'mt15'} pull-left`}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                <div className={"plus"}></div>ADD

                                            </button>
                                            <button
                                                type="button"
                                                className={`ml-1 ${initialConfiguration.IsShowCRMHead ? '' : 'mt15'} reset-btn`}
                                                onClick={() => resetData()}
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </Col>
                            </Row >
                        </form>
                    </div>

                    <br />
                    <Col md="12" className="mb-2 pl-2 pr-3">
                        <Table className="table mb-0 forging-cal-table" size="sm">
                            <thead>
                                <tr>
                                    <th>{`Index Name`}</th>
                                    <th>{`Index Type`}</th>
                                    <th className='text-right'>{`Action`}</th>
                                </tr>
                            </thead>
                            <tbody >
                                {gridData.length > 0 ? (
                                    <>
                                        {gridData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.MaterialName}</td>
                                                <td>{item.MaterialType}</td>
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
                </Container>
            </Drawer>
            {state.showPopup && (
                <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            )}
        </div>

    )
};
export default AddMaterialDetailDrawer;