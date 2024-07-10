import React, { useState } from 'react';
import { Row, Col, Tooltip, FormGroup, Label, Input, Form } from 'reactstrap';
import { DatePickerHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import HeaderTitle from '../../common/HeaderTitle';
import DatePicker from 'react-datepicker';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import ProcessDrawer from '../ProcessDrawer';
import Button from '../../layout/Button';



const AddRfqRmDetails = () => {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            radioOption: false, // Initialize default value for the radio button
        }
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewQuotationPart, setViewQuotationPart] = useState(false)
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

        <>
            <HeaderTitle title={'RM:'} />
            <Row className="part-detail-wrapper">
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"RM Name"}
                        name={"RmName"}
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
                        label={"Grade"}
                        name={"Grade"}
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
                        label={"Specifications"}
                        name={"Specifications"}
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
                <Col md="3" className='d-flex align-items-center col-md-3'>
                    <SearchableSelectHookForm
                        label={"Code"}
                        name={"Code"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={options}
                        mandatory={true}
                        handleChange={""}
                        errors={errors.Part}

                    />
                    <Button id="addRMSpecificatione" className={"ml-2 mb-2 "}


                        // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}     

                        variant={'plus-icon-square'}
                        title={'Add'} onClick={DrawerToggle} >
                    </Button>
                </Col>

                {/* <Col md="3">
                    <SearchableSelectHookForm
                        label={"UOM"}
                        name={'UOM'}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        customClassName="costing-version"
                        options={options}
                        mandatory={false}
                        errors={errors?.UOM}

                    />
                </Col>
                <Col md="3">
                    <TextFieldHookForm
                        // title={titleObj.descriptionTitle}
                        label="Target Price"
                        name={'TargetPrice'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.TargetPrice}
                        disabled={true}
                        placeholder="-"
                    />
                </Col>
                {
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
                }
                <Col md="3" className='d-flex align-items-center pb-1'>
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

                </Col> */}
            </Row>

            <div className=''>
                {
                    drawerOpen &&
                    (
                        <ProcessDrawer
                            isOpen={drawerOpen}
                            anchor={"right"}
                            closeDrawer={closeDrawer}
                            partType={'RM'}
                            quationType={'RM'}
                            
                            setViewQuotationPart={setViewQuotationPart}
                        />
                    )
                }
            </div>
        </>
    )

}

export default AddRfqRmDetails;
