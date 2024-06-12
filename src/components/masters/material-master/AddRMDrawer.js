import React, { useState } from "react";
import { Row, Col, Container } from "reactstrap";
import { useSelector } from "react-redux";
import { SearchableSelectHookForm, TextFieldHookForm, DatePickerHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import Toaster from '../../common/Toaster';
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
const AddRMDrawer = ({ isEditFlag, isOpen, closeDrawer, anchor }) => {

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

    const resetData = () => {
        setValue('MaterialName', '');
        setValue('MaterialType', '');
        setIsEdit(false)
        setEditIndex('')
    }

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
                                            Create Material
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
                                        label={'Commodity (In CIR)'}
                                        name={'MaterialIndex'}
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
                                    <SearchableSelectHookForm
                                        label={'Material Name'}
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
                                    <SearchableSelectHookForm
                                        label={'UOM'}
                                        name={'UOM'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        options={renderListing('Applicability')}
                                        handleChange={handleMaterialIndexChange}
                                        mandatory={true}
                                    />
                                </Col>
                                <Col md="6">
                                    <SearchableSelectHookForm
                                        label={'Currency'}
                                        name={'Currency'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        options={renderListing('Applicability')}
                                        handleChange={handleMaterialIndexChange}
                                        mandatory={true}
                                    />
                                </Col>
                                <Col md="6">
                                    <div className="form-group">
                                        <div className="date-section">
                                            <DatePickerHookForm
                                                name={`effectiveDate`}
                                                label={'Effective Date'}
                                                handleChange={() => { }}
                                                rules={{ required: false }}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                showMonthDropdown
                                                showYearDropdown
                                                dateFormat="DD/MM/YYYY"
                                                dropdownMode="select"
                                                placeholder="Select date"
                                                customClassName="withBorder"
                                                className="withBorder"
                                                autoComplete={"off"}
                                                disabledKeyboardNavigation
                                                onChangeRaw={(e) => e.preventDefault()}
                                                mandatory={true}
                                                errors={errors && errors.effectiveDate}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                <Col md="6">
                                    <TextFieldHookForm
                                        label={'Index Rate (Currency)'}
                                        name={'IndexRate'}
                                        placeholder={'Enter'}
                                        customClassName={'withBorder'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        mandatory={true}
                                        handleChange={() => { }}
                                    />
                                </Col>
                                <Col md="6">
                                    <TextFieldHookForm
                                        label={'Premium Currency'}
                                        name={'PremiumCurrency'}
                                        placeholder={'Enter'}
                                        Controller={Controller}
                                        customClassName={'withBorder'}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        mandatory={true}
                                        handleChange={() => { }}
                                    />
                                </Col>
                            </Row >
                        </form>
                    </div>

                    <br />
                    <Row className=" no-gutters justify-content-between">
                        <div className="col-md-12">
                            <div className="text-right ">
                                <button
                                    id="AddMaterialType_Cancel"
                                    onClick={cancelHandler}
                                    type="button"
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
        </div >

    )
};
export default AddRMDrawer;