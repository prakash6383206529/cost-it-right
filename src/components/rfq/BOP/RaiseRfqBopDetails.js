import React, { useState } from 'react';
import { Row, Col, Tooltip, FormGroup, Label, Input, Form } from 'reactstrap';
import DatePicker from 'react-datepicker'
import { useForm, Controller } from "react-hook-form";
import HeaderTitle from '../../common/HeaderTitle';
import ProcessDrawer from '../ProcessDrawer';
import { AsyncSearchableSelectHookForm, RadioHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import Button from '../../layout/Button';

const RaiseRfqBopDetails = () => {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewQuotationPart, setViewQuotationPart] = useState(false)
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            radioOption: false, // Initialize default value for the radio button
        }
    });

    const DrawerToggle = () => {
        // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setDrawerOpen(true)
    }
    const closeDrawer = () => {
        setDrawerOpen(false);

    }


    const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    return (
        <div className='bop-details-wrapper'>
            <HeaderTitle title={'BOP:'} />
            <Row className="part-detail-wrapper">
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"PR NO."}
                        name={"PRno"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={options}
                        mandatory={true}
                        handleChange={""}
                        errors={errors.Part}

                    />
                </Col>
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"Plant"}
                        name={"plant"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={options}
                        mandatory={true}
                        handleChange={""}
                        errors={errors.Part}

                    />
                </Col>
                <Col md="3">
                    <div className="inputbox date-section">
                        <div className="form-group">
                            <label>Last Submission Date<span className="asterisk-required">*</span></label>
                            <div id="addRFQDate_container" className="inputbox date-section">
                                <DatePicker
                                    name={'RequirementDate'}
                                    placeholder={'Select'}
                                    //selected={submissionDate}
                                    selected={""}
                                    onChange={""}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode='select'
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select date"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    mandatory={true}
                                    errors={errors.RequirementDate}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                // disabled={dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)}
                                />

                            </div>
                        </div>
                    </div>

                </Col>

                <Col md="3" >
                    <TextFieldHookForm
                        label="BOP NO."
                        name={"BOPNo"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            required: false,
                        }}
                        handleChange={(e) => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.MBName}
                        disabled={false}
                    />
                </Col>

                <Col md="3" >
                    <TextFieldHookForm
                        label="BOP Name"
                        name={"BOPName"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            required: false,
                        }}
                        handleChange={(e) => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.MBName}
                        disabled={false}
                    />
                </Col>

                <Col md="3">
                    <div className='d-flex align-items-center'>
                        <TextFieldHookForm
                            label="Category"
                            name={"Category"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                            }}
                            handleChange={(e) => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder w-100"}
                            errors={errors.MBName}
                            disabled={false}
                        />
                        <Button id="addRMSpecificatione" className={"ml-2 mb-2 "}


                            // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}     

                            variant={'plus-icon-square'}
                            title={'Add'} onClick={DrawerToggle} >
                        </Button>
                    </div>

                </Col>
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"UOM"}
                        name={"UOM"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={options}
                        mandatory={true}
                        handleChange={""}
                        errors={errors.Part}

                    />
                </Col>
                <Col md="3">
                    <div className="inputbox date-section">
                        <div className="form-group">
                            <label>Requirement Timeline<span className="asterisk-required">*</span></label>
                            <div id="addRFQDate_container" className="inputbox date-section">
                                <DatePicker
                                    name={'RequirementDate'}
                                    placeholder={'Select'}
                                    //selected={submissionDate}
                                    selected={""}
                                    onChange={""}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode='select'
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select date"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    mandatory={true}
                                    errors={errors.RequirementDate}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                // disabled={dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)}
                                />

                            </div>
                        </div>
                    </div>

                </Col>
                <Col md="3" className='d-flex align-items-center pb-1 mb-3'>
                    <button
                        id="add_part"
                        type="button"
                        className={'user-btn pull-left'}

                    >
                        <div className={'plus'}></div>{"ADD"}
                    </button>
                    <button
                        id="reset_part"
                        type="button"
                        value="CANCEL"
                        className="reset ml-2 mr5"
                    >
                        <div className={''}></div>
                        RESET
                    </button>

                </Col>
            </Row>

            <div className='rfq-part-list'>
                {
                    drawerOpen &&
                    (
                        <ProcessDrawer
                            isOpen={drawerOpen}
                            anchor={"right"}
                            closeDrawer={closeDrawer}
                            partType={'BOP'}
                            setViewQuotationPart={setViewQuotationPart}
                        />
                    )
                }
            </div>
        </div>

    )
}

export default RaiseRfqBopDetails;
