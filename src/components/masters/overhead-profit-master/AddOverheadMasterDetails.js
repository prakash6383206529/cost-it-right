import React, { Component, useEffect, useState, } from 'react';
// import { connect } from 'react-redux';
// import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, Table } from 'reactstrap';
import { Field } from "redux-form";
import { required, getCodeBySplitting, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, maxLength512, acceptAllExceptSingleSpecialCharacter, validateFileName, showDataOnHover, getConfigurationKey } from "../../../helper";
import { searchableSelect, renderTextAreaField, renderDatePicker, renderMultiSelectField, renderText, validateForm } from "../../layout/FormInputs";
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { CBCTypeId, EMPTY_DATA, FILE_URL, GUIDE_BUTTON_SHOW, OVERHEADMASTER, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import { SearchableSelectHookForm, DateTimePickerHookForm, TextFieldHookForm, DatePickerHookForm, AsyncSearchableSelectHookForm } from '../../layout/HookFormInputs';
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async';
import { LabelsClass } from '../../../helper/core';
import NoContentFound from '../../common/NoContentFound';
import { useTransition } from 'react';
import { fetchApplicabilityList, getVendorNameByVendorSelectList, fetchSpecificationDataAPI } from '../../../actions/Common';
import { autoCompleteDropdown, getCostingConditionTypes } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material'
import DayTime from '../../common/DayTimeWrapper';



const AddOverheadMasterDetails = (props) => {
    // const { t } = useTransition("MasterLabels");
    // const {isEditFlag, costingTypeId, modelTypes, costingHead} = props
    // const {isEditFlag, costingTypeId, modelTypes, modelType, handleModelTypeChange, handleApplicabilityChange, state, setState, inputLoader} = props
    const {isEditFlag, costingTypeId, modelType, handleApplicabilityChange, state, setState, inputLoader} = props
    const {register, handleSubmit, control, setValue, getValues, errors} = props
    const [isEditIndex, setIsEditIndex] = useState(false)
    const [editItemId, setEditItemId] = useState("")




    const dispatch = useDispatch();
    // const menu = useSelector((state) => state.menu);
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const plantSelectList = useSelector((state) => state.comman.plantSelectList)
    const modelTypes = useSelector((state) => state.comman.modelTypes)
    const costingHead = useSelector((state) => state.comman.applicabilityList)
    // const costingHead = useSelector((state) => state.comman.costingHead);
    const vendorWithVendorCodeSelectList = useSelector((state) => state.supplier.vendorWithVendorCodeSelectList)
    const { rawMaterialNameSelectList, gradeSelectList } = useSelector((state) => state.material);

    const conditionTypeId = getCostingConditionTypes(OVERHEADMASTER);


    // const [costingHead, setcostingHead] = useState([
    //     {
    //         "Text": "RM",
    //         "Value": "1"
    //     },
    //     {
    //         "Text": "CC",
    //         "Value": "2"
    //     },
    //     {
    //         "Text": "BOP",
    //         "Value": "3"
    //     },
    //     {
    //         "Text": "Welding",
    //         "Value": "4"
    //     },
    // ])

    // const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    const values = useWatch({
        control,
        name: ['OverheadApplicability'],
      })

    // const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;


    // const { register, handleSubmit, control, setValue, getValues, reset, trigger, clearErrors, formState: { errors }, } = useForm({
    //         mode: 'onChange',
    //         reValidateMode: 'onChange',
    //         // defaultValues: defaultValues,
    //         defaultValues: {
    //             exampleField: '',
    //         },
    // })

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };


    const onSubmit = debounce(handleSubmit(() => {
        

    }), 500)

    const renderListing = (label) => {
        const temp = [];
        const excludedItems = ['RM', 'RM + CC', 'RM + CC + BOP', 'RM + BOP'];
        if (label === 'material') {
        rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
            if (item.Value === '0') return false
            temp.push({ label: item.Text, value: item.Value })
            return null
        })
        return temp
        }
    
        if (label === 'grade') {
        gradeSelectList && gradeSelectList.map((item) => {
            if (item.Value === '0') return false
            temp.push({ label: item.Text, value: item.Value })
            return null
        })
        return temp
        }

        if (label === 'OverheadApplicability') {
            let temp = [];
            if (state.ApplicabilityDetails && state.ApplicabilityDetails.length > 0) {
              const newCostingHead = costingHead.filter(
                item => !state.ApplicabilityDetails.some(
                  ap => ap.ApplicabilityId == item.Value
                )
              );
              temp = newCostingHead.map(item => ({
                label: item.Text,
                value: item.Value
              }));
            } else {
              costingHead && costingHead.forEach(item => {
                temp.push({ label: item.Text, value: item.Value });
              });
            }
            return temp;
        }

        if (label === 'ModelType') {
            modelTypes && modelTypes.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'Plant') {
            plantSelectList && plantSelectList.map((item) => {
              if (item.PlantId === '0') return false
              temp.push({ label: item.PlantNameCode, value: item.PlantId })
              return null
            })
            return temp
        }

        if (label === 'singlePlant') {
            plantSelectList && plantSelectList.map((item) => {
              if (item.PlantId === '0') return false
              temp.push({ label: item.PlantNameCode, value: item.PlantId })
              return null
            })
            return temp
        }

        if (label === 'ClientList') {
            clientSelectList && clientSelectList.map(item => {
              if (item.Value === '0') return false;
              temp.push({ label: item.Text, value: item.Value })
              return null;
            });
            return temp;
        }
    }

    const handleModelTypeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
          setState(prev => ({ ...prev, ModelType: newValue }));
        } else {
          setState(prev => ({ ...prev, ModelType: [] }));
        }
        if (state.ModelType.value === Number(newValue.value)) {
          setState(prev => ({ ...prev, DropdownNotChanged: true, IsFinancialDataChanged: false }));
        }
        else {
          setState(prev => ({ ...prev, DropdownNotChanged: false, IsFinancialDataChanged: true }));
        }
    };


    const handleOverheadPercentageChange = (e) => {
        const val = e.target.value;
        setState(prev => ({
            ...prev,
            OverheadPercentage: val,
            IsFinancialDataChanged: true
          }));
    }

    const handleAddApplicability = () => {
        const percentage = getValues("OverheadPercentage");
        const applicability = getValues("OverheadApplicability");
        if(percentage && applicability){
            let prevApplicability = [...state.ApplicabilityDetails]
            let obj = {
                "ApplicabilityId": applicability.value,
                "Applicability" : applicability.label,
                "Percentage": percentage
            }
            if(editItemId){
                prevApplicability = [...state.ApplicabilityDetails]
                const ind = prevApplicability.findIndex((item) => item.ApplicabilityId === editItemId)
                prevApplicability[ind] = obj
                setEditItemId("");
            }else{
                prevApplicability = [...state.ApplicabilityDetails, obj]
            }           
            setState(prev => ({ ...prev, ApplicabilityDetails: prevApplicability, OverheadApplicability: {}, OverheadPercentage: "" }));
            setValue("OverheadPercentage", "");
            setValue("OverheadApplicability", "");
        }
    }

    const handleResetApplicability = () => {
        setState(prev => ({ ...prev, OverheadApplicability: {}, OverheadPercentage: "" }));
        setValue("OverheadPercentage", "");
        setValue("OverheadApplicability", "");
    }

    const deleteApplicability = (id) => {
        const filteredApplicability = state.ApplicabilityDetails.filter((item, ind) => item.ApplicabilityId !== id)
        setState(prev => ({ ...prev, ApplicabilityDetails: filteredApplicability }));
    }

    const editApplicability = (editItem) => {
        setEditItemId(editItem?.ApplicabilityId)
        let obj = {
            "label": editItem?.Applicability,
            "value": editItem?.ApplicabilityId
        }
        setState(prev => ({ ...prev, OverheadApplicability: obj, OverheadPercentage: editItem?.Percentage }));
        setValue("OverheadPercentage", editItem?.Percentage);
        setValue("OverheadApplicability", obj);
    }

    const onPressAssemblyCheckbox = () => {
        let isRequestForMultiTechnology = !state.isAssemblyCheckbox ? true : false
        dispatch(fetchApplicabilityList(null, conditionTypeId, isRequestForMultiTechnology, res => { }));
        setState(prev => ({ ...prev, isAssemblyCheckbox: !state.isAssemblyCheckbox, overheadAppli: [], ApplicabilityDetails: [], OverheadApplicability: {}, OverheadPercentage: "" }));
        setValue("OverheadApplicability", {});
        setValue("OverheadPercentage", "");
    };

    const handlePlant = (e) => {
        setState(prev => ({ ...prev, selectedPlants: e, DropdownNotChanged: false }));
        setValue("Plant", e);
    }

    const handleSinglePlant = (newValue) => {
        setState(prev => ({ ...prev, singlePlantSelected: newValue }));
    }

    const filterList = async (inputValue) => {
        const { vendorFilterList } = state
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        setState(prev => ({ ...prev, inputLoader: false }));
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        setState(prev => ({ ...prev, inputLoader: false }));
        setState(prev => ({ ...prev, vendorFilterList: resultInput }));
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
            return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
        } else {
            return vendorDataAPI
        }
        }
        else {
        if (inputValue?.length < searchCount) return false
        else {
            let VendorData = reactLocalStorage?.getObject('Data')
            if (inputValue) {
            return autoCompleteDropdown(inputValue, VendorData, false, [], false)
            } else {
            return VendorData
            }
        }
        }
    };

    const handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
          setState(prev => ({ ...prev, vendorName: newValue, isVendorNameNotSelected: false }));
        } else {
          setState(prev => ({ ...prev, vendorName: [] }));
        }
        setState(prev => ({ ...prev, DropdownNotChanged: false }));
    };

    const handleClient = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
          setState(prev => ({ ...prev, client: newValue }));
        } else {
          setState(prev => ({ ...prev, client: [] }));
        }
    };


    const handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
          setState(prev => ({
            ...prev,
            RawMaterial: newValue,
            RMGrade: [],
          }));
      
          // Trigger after state update
          fetch(getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => {}));
        } else {
          setState(prev => ({
            ...prev,
            RMGrade: [],
            RMSpec: [],
            RawMaterial: [],
          }));
      
          fetch(getRMGradeSelectListByRawMaterial('', false, (res) => {}));
          fetch(fetchSpecificationDataAPI(0, () => {}));
        }
    };

    const handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
        //   this.setState({ RMGrade: newValue })
          setState(prev => ({
            ...prev,
            RMGrade: newValue
          }));
        } else {

          setState(prev => ({
            ...prev,
            RMGrade: [],
          }));
        }
    }


    return (
        <Row>
                    <Col md="12">
                        <Row className={'mt15'}>
                            {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC &&
                                <>
                                <Col md="3">
                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                    <div className="fullinput-icon">
                                    <SearchableSelectHookForm
                                        label={`Raw Material Name`}
                                        name={'RawMaterialId'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        // rules={{
                                        //     required: true,
                                        // }}
                                    
                                        // options={rmDropDownData}
                                        options={renderListing("material")}
                                        // options={modelTypes}
                                        handleChange={handleRMChange}
                                        className="fullinput-icon"
                                    />
                                    </div>
                                </div>
                                </Col>
                                <Col md="3">
                                    <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                    <div className="fullinput-icon">
                                        <SearchableSelectHookForm
                                            label={`Raw Material Grade`}
                                            name={'RawMaterialGradeId'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            options={renderListing("grade")}
                                            // options={modelTypes}
                                            handleChange={handleGradeChange}
                                            className="fullinput-icon"
                                        />
                                    </div>
                                    </div>
                                </Col>
                                </>
                            }

                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={`Model Type`}
                                    name={'ModelType'}
                                    placeholder={'Select'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{ required: true }}
                                    // rules={{
                                    //     required: true,
                                    // }}
                                   
                                    // options={rmDropDownData}
                                    options={renderListing("ModelType")}
                                    // options={modelTypes}
                                    handleChange={handleModelTypeChange}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.ModelType}
                                    disabled={isEditFlag}
                                />
                            </Col>

                            {costingTypeId === VBCTypeId && (
                                <Col md="3">
                                    {/* <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label> */}
                                    <AsyncSearchableSelectHookForm
                                        label={"Supplier (Code)"}
                                        name={"vendorName"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        // rules={{ required: true }}
                                        register={register}
                                        rules={{ required: true }}
                                        mandatory={true}
                                        // defaultValue={part.length !== 0 ? part : ""}
                                        asyncOptions={filterList}
                                        // mandatory={true}
                                        isLoading={inputLoader}
                                        handleChange={handleVendorName}
                                        errors={errors.vendorName}
                                        // disabled={false}
                                        disabled={isEditFlag}
                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                    />
                                </Col>
                            )}

                            {((costingTypeId === ZBCTypeId) && (
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Plant (Code)`}
                                        name={'Plant'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{ required: true }}
                                        mandatory={true}
                                        // mandatory={true}
                                        // options={rmDropDownData}
                                        options={renderListing("Plant")}
                                        // handleChange={handleRMDropDownChange}
                                        handleChange={handlePlant}
                                        isMulti={true}
                                        // rules={{
                                        //     required: true,
                                        // }}
                                        selection={state.selectedPlants == null || state.selectedPlants.length === 0 ? [] : state.selectedPlants}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Plant}
                                        disabled={isEditFlag}
                                    />
                                </Col>)
                            )}
                            {
                                ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Plant (Code)`}
                                        name={'DestinationPlant'}
                                        placeholder={'Select'}
                                        title={showDataOnHover(state.selectedPlants)}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{ required: true }} 
                                        mandatory={true} 
                                        options={renderListing("singlePlant")}
                                        handleChange={handleSinglePlant}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.DestinationPlant}
                                        disabled={isEditFlag}
                                    />
                                </Col>
                            }

                            {costingTypeId === CBCTypeId && (
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Customer (Code)`}
                                        name={'clientName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{ required: true }}
                                        mandatory={true}
                                        // mandatory={true}
                                        // options={rmDropDownData}
                                        options={renderListing("ClientList")}
                                        handleChange={handleClient}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.clientName}
                                        disabled={isEditFlag}
                                    />
                                </Col>
                            ) }

                            <Col md="3" className="st-operation mt-4 pt-2">
                                <label id="AddOverhead_ApplyPartCheckbox"
                                className={`custom-checkbox ${isEditFlag ? "disabled" : ""
                                    }`}
                                onChange={onPressAssemblyCheckbox}
                                >
                                Apply for Part Type
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={state.isAssemblyCheckbox}
                                    // disabled={isEditFlag ? true : false}
                                />
                                <span
                                    className=" before-box"
                                    // checked={this.state.isAssemblyCheckbox}
                                    onChange={onPressAssemblyCheckbox}
                                />
                                </label>
                            </Col>
                            
                            <Col md="3">
                                <div  id="EffectiveDate_Container" className="form-group date-section">
                                    <DatePickerHookForm
                                        name={`EffectiveDate`}
                                        label={'Effective Date'}
                                       //  selected={new Date(state.effectiveDate)}
                                        handleChange={(date) => {
                                            // handleFromDate(date);
                                        }}
                                        rules={{ required: true }}
                                        // selected={DayTime(state.EffectiveDate).isValid() ? new Date(state.EffectiveDate) : ''}
                                        mandatory={true}
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
                                        errors={errors && errors.EffectiveDate}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                        <Col md="12" className="filter-block">
                                <div className=" flex-fills mb-2 pl-0">
                                    <h5>{"Applicability:"}</h5>
                                </div>
                            </Col>

                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Overhead Applicability"}
                                    name={"OverheadApplicability"}
                                    tooltipId={"RawMaterial"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    // control={controlTableForm}
                                    control={control}
                                    // rules={{ required: true }}
                                    rules={{ required: !(state.ApplicabilityDetails.length > 0) && true }}
                                    // register={registerTableForm}
                                    register={register}
                                    defaultValue={""}
                                    mandatory={!(state.ApplicabilityDetails.length > 0) && true}
                                    options={renderListing('OverheadApplicability')}
                                    // options={costingHead}
                                    // mandatory={true}
                                    isMulti={false}
                                    handleChange={handleApplicabilityChange}
                                    errors={errors.OverheadApplicability}
                                />
                            </Col>
                            
                            <Col md="3">
                                <TextFieldHookForm
                                    label={`Overhead (%)`}
                                    name={'OverheadPercentage'}
                                    Controller={Controller}
                                    id={'overhead-percentage'}
                                    control={control}
                                    register={register}
                                    rules={{
                                        required: false,
                                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                        max: {
                                            value: 100,
                                            message: 'Percentage cannot be greater than 100'
                                        },
                                    }}
                                    mandatory={false}
                                    handleChange={handleOverheadPercentageChange}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.OverheadPercentage}
                                    disabled={!(Object.keys(state?.OverheadApplicability).length > 0)}
                                />
                            </Col>

                            <Col md="3">
                                <div className={`pt-2 mt-4 pr-0 mb-3`}>
                                    {editItemId ? (
                                    <>
                                        <button type="button" className={"btn btn-primary pull-left mr5"} 
                                    //   onClick={updateApplicability}
                                        onClick={handleAddApplicability}
                                        >Update</button>
                                        <button
                                        type="button"
                                        className={"mr15 ml-1 add-cancel-btn cancel-btn my-0"}
                                        // disabled={isViewMode}
                                        onClick={handleResetApplicability}
                                        >
                                        <div className={"cancel-icon"}></div>Cancel
                                        </button>
                                    </>
                                    ) : (
                                    <>
                                        <button id="AddFuel_AddData"
                                        type="button"
                                        className={"user-btn pull-left mr10"}
                                        // disabled={isViewMode}
                                        onClick={handleAddApplicability}
                                        >
                                        <div className={"plus"}></div>ADD
                                        </button>
                                        <button
                                        type="button"
                                        className={"mr15 ml-1 reset-btn"}
                                        // disabled={isViewMode}
                                        onClick={handleResetApplicability}
                                        >
                                        Reset
                                        </button>
                                    </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Col>

                    <Col md="12">
                        <Table className="table border" size="sm">
                            <thead>
                            <tr>
                                <th>{`Applicability`}</th>
                                <th>{`Percentage`}</th>
                                <th>{`Action`}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {state.ApplicabilityDetails && state.ApplicabilityDetails.length > 0 &&
                                state.ApplicabilityDetails.map((item, index) => {
                                return (
                                    <tr key={index}>
                                    <td>{item?.Applicability}</td>
                                    <td>{item?.Percentage}</td>
                                    <td>
                                        <button
                                        className="Edit mr-2"
                                        title='Edit'
                                        type={"button"}
                                        // disabled={isViewMode || item?.IsAssociated}
                                        onClick={() =>
                                            editApplicability(item)
                                        }
                                        />
                                        <button
                                        className="Delete"
                                        title='Delete'
                                        type={"button"}
                                        // disabled={isViewMode || item?.IsAssociated || isGridEdit}
                                        onClick={() =>
                                            deleteApplicability(item?.ApplicabilityId)
                                        }
                                        />
                                    </td>
                                    </tr>
                                );
                                })}
                            </tbody>

                            {state.ApplicabilityDetails.length === 0 && (
                            <tbody className='border'>
                                <tr>
                                <td colSpan={"10"}> <NoContentFound title={EMPTY_DATA} /></td>
                                </tr>
                            </tbody>
                            )}
                        </Table>
                    </Col>
        </Row >
    );
}


export default AddOverheadMasterDetails;