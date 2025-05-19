import React, { useEffect, useState, } from 'react';
import { Row, Col, Label, Table } from 'reactstrap';
import { Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabelsClass } from '../../../helper/core';
import { MESSAGES } from '../../../config/message';
import NoContentFound from '../../common/NoContentFound';
import { reactLocalStorage } from 'reactjs-localstorage';
import DayTime from '../../common/DayTimeWrapper';
import { useTranslation } from 'react-i18next';
import { required, number, checkWhiteSpaces, percentageLimitValidation, showDataOnHover, getConfigurationKey, checkForNull, maxLength7 } from "../../../helper";
import { CBCTypeId, EMPTY_DATA, OVERHEADMASTER, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import { SearchableSelectHookForm, TextFieldHookForm, DatePickerHookForm, AsyncSearchableSelectHookForm } from '../../layout/HookFormInputs';
import { fetchApplicabilityList, getVendorNameByVendorSelectList, fetchSpecificationDataAPI } from '../../../actions/Common';
import { autoCompleteDropdown, getCostingConditionTypes, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material'



const AddOverheadMasterDetails = (props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation("MasterLabels");
    const { costingTypeId, conditionTypeId, state, setState, inputLoader, register, control, setValue, getValues, errors, trigger, clearErrors, isShowApplicabilitySection = true} = props
    const [isEditIndex, setIsEditIndex] = useState(false)
    const [editItemId, setEditItemId] = useState("")
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const plantSelectList = useSelector((state) => state.comman.plantSelectList)
    const partFamilySelectList = useSelector((state) => state.part.partFamilySelectList)
    const modelTypes = useSelector((state) => state.comman.modelTypes)
    const costingHead = useSelector((state) => state.comman.applicabilityList)
    const { rawMaterialNameSelectList, gradeSelectList } = useSelector((state) => state.material);
    // const conditionTypeId = getCostingConditionTypes(OVERHEADMASTER);
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    useEffect(() => {
        // let isRequestForMultiTechnology = !state.isAssemblyCheckbox ? true : false
        dispatch(fetchApplicabilityList(null, conditionTypeId, state.isAssemblyCheckbox, res => { }));
        // setState(prev => ({ ...prev, isAssemblyCheckbox: !state.isAssemblyCheckbox, ApplicabilityDetails: [], OverheadApplicability: {}, OverheadPercentage: "" }));
    }, [state.isAssemblyCheckbox])

    const renderListing = (label) => {
        const temp = [];
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
            if (!costingHead) return [];
            let excludeFixed = false;
            let includeOnlyFixed = false;
            if (state.ApplicabilityDetails && state.ApplicabilityDetails.length > 0) {
                const fixedExists = state.ApplicabilityDetails.some(
                    ap => ap.Applicability?.toLowerCase() === "fixed"
                );
                includeOnlyFixed = fixedExists;
                excludeFixed = !fixedExists;
            }
            const filtered = costingHead.filter(item => {
                const isFixed = item.Text?.toLowerCase() === "fixed";
                const isAlreadyUsed = state.ApplicabilityDetails?.some(
                    ap => ap.ApplicabilityId == item.Value
                );
                if (Number(item.Value) === 0) return false;
                if (includeOnlyFixed && !isFixed) return false;
                if (excludeFixed && isFixed) return false;
                return !isAlreadyUsed;
            });
            return filtered.map(item => ({
                label: item.Text,
                value: item.Value
            }));
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

        if (label === 'PartFamily') {
            partFamilySelectList && partFamilySelectList.map((item) => {
              if (item.Value === '--0--') return false
              temp.push({ label: item.Text, value: item.Value })
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

    const handleApplicabilityChange = (e) => {
        setState(prev => ({ ...prev, OverheadApplicability: e, IsFinancialDataChanged: true }));
        setValue("OverheadApplicability", e)
    }

    const handleModelTypeChange = (newValue, actionMeta=null) => {
        if (newValue && newValue !== '') {
          setState(prev => ({ ...prev, ModelType: newValue }));
        } else {
          setState(prev => ({ ...prev, ModelType: [] }));
        }
        let modelTypeValue = (props?.applicabilityLabel === "ICC") ? newValue.value : Number(newValue.value)
        if (state.ModelType.value === modelTypeValue) {
          setState(prev => ({ ...prev, DropdownNotChanged: true, IsFinancialDataChanged: false }));
        } else {
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

    const handleAddApplicability = async () => {
        const applicability = getValues("OverheadApplicability");
        const isApplicabilityValid = await trigger("OverheadApplicability");
        if (!applicability?.label || !isApplicabilityValid) return;
        const percentage = getValues("OverheadPercentage");

        const repaymentPeriod = getValues("RepaymentPeriod");
        
        if (applicability?.label !== "Fixed") {
            const isPercentageValid = await trigger("OverheadPercentage");
            if (!isPercentageValid) return;
        }
        if(!checkForNull(percentage) && state?.OverheadApplicability?.label != "Fixed"){ 
            setValue("OverheadPercentage", "")
            return false
        }      
        if((state?.OverheadApplicability?.label === "Fixed" || percentage) && applicability){
            let prevApplicability = [...state.ApplicabilityDetails]
            let obj = {
                "ApplicabilityId": applicability.value,
                "Applicability" : applicability.label,
                "Percentage": percentage,
                ...(state?.IsPaymentTermsRecord && { RepaymentPeriod: repaymentPeriod })
            }
            if(editItemId){
                prevApplicability = [...state.ApplicabilityDetails]
                const ind = prevApplicability.findIndex((item) => item.ApplicabilityId === editItemId)
                prevApplicability[ind] = obj
                setEditItemId("");
            }else{
                prevApplicability = [...state.ApplicabilityDetails, obj]
            }           
            setState(prev => ({ ...prev, ApplicabilityDetails: prevApplicability, OverheadApplicability: {}, OverheadPercentage: "", RepaymentPeriod: "" }));
            setValue("OverheadPercentage", "");
            setValue("OverheadApplicability", "");
            setValue("RepaymentPeriod", "");
            clearErrors(["OverheadApplicability", "OverheadPercentage"]);
        }
    }

    const handleResetApplicability = () => {
        setState(prev => ({ ...prev, OverheadApplicability: {}, OverheadPercentage: "" }));
        setValue("OverheadPercentage", "");
        setValue("OverheadApplicability", "");
        setValue("RepaymentPeriod", "");
        clearErrors(["OverheadApplicability", "OverheadPercentage"]);
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
        setState(prev => ({ ...prev, OverheadApplicability: obj, OverheadPercentage: editItem?.Percentage,  ...(state?.IsPaymentTermsRecord && { RepaymentPeriod: editItem?.RepaymentPeriod }) }));
        setValue("OverheadPercentage", editItem?.Percentage);
        setValue("OverheadApplicability", obj);
        if(state?.IsPaymentTermsRecord){
            setValue("RepaymentPeriod", editItem?.RepaymentPeriod);
        }
    }

    const onPressAssemblyCheckbox = () => {
        // let isRequestForMultiTechnology = !state.isAssemblyCheckbox ? true : false
        // dispatch(fetchApplicabilityList(null, conditionTypeId, isRequestForMultiTechnology, res => { }));
        setState(prev => ({ ...prev, isAssemblyCheckbox: !state.isAssemblyCheckbox, ApplicabilityDetails: [], OverheadApplicability: {}, OverheadPercentage: "" }));
        setValue("OverheadApplicability", {});
        setValue("OverheadPercentage", "");
    };

    const handlePlant = (e) => {
        setState(prev => ({ ...prev, selectedPlants: e, DropdownNotChanged: false }));
        setValue("Plant", e);
    }

    const handlePartFamily = (e) => {
        setState(prev => ({ ...prev, selectedPartFamily: e }));
        setValue("PartFamily", e);
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
        } else {
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
          setState(prev => ({...prev, RawMaterial: newValue, RMGrade: [] }));
          fetch(getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => {}));
        } else {
          setState(prev => ({...prev, RMGrade: [], RMSpec: [], RawMaterial: [], }));
          fetch(getRMGradeSelectListByRawMaterial('', false, (res) => {}));
          fetch(fetchSpecificationDataAPI(0, () => {}));
        }
    };

    const handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
          setState(prev => ({...prev, RMGrade: newValue}));
        } else {
          setState(prev => ({...prev, RMGrade: []}));
        }
    }

    const handleEffectiveDate = (value) => {
        setState(prev => ({...prev, EffectiveDate: value, IsFinancialDataChanged: true}));
        setValue("EffectiveDate", value);
    }

    const handleChangeRepaymentPeriod = (value) => {
        setValue("RepaymentPeriod", value);
        setState(prev => ({...prev, RepaymentPeriod: value, IsFinancialDataChanged: true}));
    };


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
                                            options={renderListing("material")}
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
                                            handleChange={handleGradeChange}
                                            className="fullinput-icon"
                                        />
                                    </div>
                                </div>
                            </Col>
                        </>
                    }

                    {!state.isHideModelType && 
                        <Col md="3">
                            <SearchableSelectHookForm
                                label={`Model Type`}
                                name={'ModelType'}
                                placeholder={'Select'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={!state.isHideModelType}
                                rules={{ required: !state.isHideModelType }}
                                options={renderListing("ModelType")}
                                handleChange={handleModelTypeChange}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ModelType}
                                disabled={state?.isEditFlag || state?.isViewMode}
                            />
                        </Col>
                    }

                    {costingTypeId === VBCTypeId && (
                        <Col md="3">
                            <AsyncSearchableSelectHookForm
                                // label={"Supplier (Code)"}
                                label={`${VendorLabel} (Code)`}
                                name={"vendorName"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: true }}
                                mandatory={true}
                                asyncOptions={filterList}
                                isLoading={inputLoader}
                                handleChange={handleVendorName}
                                errors={errors.vendorName}
                                disabled={state?.isEditFlag || state?.isViewMode}
                                NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                            />
                        </Col>
                    )}

                    {((costingTypeId === ZBCTypeId) && (
                        <Col md="3">
                            <div className='d-flex align-items-center'>
                                <SearchableSelectHookForm
                                    label={`Plant (Code)`}
                                    name={'Plant'}
                                    placeholder={'Select'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    rules={{ required: true }}
                                    mandatory={true}
                                    options={renderListing("Plant")}
                                    handleChange={handlePlant}
                                    // isMulti={true}
                                    isMulti={(state?.isEditFlag || state?.isViewMode) ? false : true}
                                    selection={state.selectedPlants == null || state.selectedPlants.length === 0 ? [] : state.selectedPlants}
                                    // className="multiselect-with-border"
                                    // customClassName={'withBorder'}
                                    errors={errors.Plant}
                                    disabled={state?.isEditFlag || state?.isViewMode}
                                />
                            </div>
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
                                disabled={state?.isEditFlag || state?.isViewMode}
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
                                options={renderListing("ClientList")}
                                handleChange={handleClient}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.clientName}
                                disabled={state?.isEditFlag || state?.isViewMode}
                            />
                        </Col>
                    ) }

                    {props?.isShowPartFamily && getConfigurationKey()?.PartAdditionalMasterFields?.IsShowPartFamily &&
                        <Col md="3">
                            <SearchableSelectHookForm
                                label={`Part Family (Code)`}
                                name={'PartFamily'}
                                placeholder={'Select'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: true }}
                                mandatory={true}
                                options={renderListing("PartFamily")}
                                handleChange={handlePartFamily}
                                // defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.PartFamily}
                                disabled={state?.isEditFlag || state?.isViewMode}
                            />
                        </Col>
                    }

                    <Col md="3" className="st-operation mt-4 pt-2">
                        <label id="AddOverhead_ApplyPartCheckbox"
                            className={`custom-checkbox ${state?.isEditFlag ? "disabled" : ""}`}
                            onChange={onPressAssemblyCheckbox}
                        >
                        Manage Applicabilities For Multi Technology Assembly
                        <input
                            type="checkbox"
                            readOnly
                            checked={state.isAssemblyCheckbox}
                            disabled={state?.isEditFlag ? true : false}
                        />
                        <span
                            className=" before-box"
                            checked={state.isAssemblyCheckbox}
                            onChange={onPressAssemblyCheckbox}
                        />
                        </label>
                    </Col>

                    <Col md="3">
                        <div  id="EffectiveDate_Container" className="form-group date-section">
                            <DatePickerHookForm
                                name={`EffectiveDate`}
                                label={'Effective Date'}
                                handleChange={(date) => {
                                    handleEffectiveDate(date);
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
                                minDate={state?.isEditFlag ? new Date(state.minEffectiveDate) : getEffectiveDateMinDate()}
                                // maxDate={getEffectiveDateMinDate()}
                                errors={errors && errors.EffectiveDate}
                                disabled={state?.isViewMode}
                            />
                        </div>
                    </Col>
                </Row>

                {props?.children}

                {isShowApplicabilitySection &&
                    <Row>
                        <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                                <h5>{"Applicability:"}</h5>
                            </div>
                        </Col>

                        <Col md="3">
                            <SearchableSelectHookForm
                                // label={`${props?.isOverHeadMaster ? "Overhead" : "Profit"} Applicability`}
                                label={`${props?.applicabilityLabel ?? ''} Applicability`}
                                name={"OverheadApplicability"}
                                tooltipId={"RawMaterial"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: !(state?.ApplicabilityDetails?.length > 0) && true }}
                                register={register}
                                defaultValue={""}
                                mandatory={!(state?.ApplicabilityDetails?.length > 0) && true}
                                options={renderListing('OverheadApplicability')}
                                isMulti={false}
                                handleChange={handleApplicabilityChange}
                                errors={errors.OverheadApplicability}
                                disabled={state?.isViewMode}
                            />
                        </Col>


                        {(state?.OverheadApplicability?.label !== 'Fixed' && state?.IsPaymentTermsRecord) && (
                            <>
                                <Col md="3">
                                        <TextFieldHookForm
                                            name="RepaymentPeriod"
                                            label="Repayment Period (Days)"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            type="text"
                                            placeholder={state.isViewMode ? '-' : "Enter"}
                                            value={state.RepaymentPeriod}
                                            handleChange={(e) => handleChangeRepaymentPeriod(e.target.value)}
                                            disabled={state.isViewMode}
                                            rules={{
                                                validate: { number, checkWhiteSpaces, maxLength7 }
                                            }}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RepaymentPeriod}
                                        />
                                </Col>
                            </>
                        )}
                        
                        {state?.OverheadApplicability?.label != "Fixed" &&
                            <Col md="3">
                                <TextFieldHookForm
                                    label={`${props?.applicabilityLabel ?? ''} (%)`}
                                    name={'OverheadPercentage'}
                                    Controller={Controller}
                                    id={'overhead-percentage'}
                                    control={control}
                                    register={register}
                                    rules={{
                                        required: !!state?.OverheadApplicability && (Object.keys(state?.OverheadApplicability).length > 0) && state?.OverheadApplicability?.label && state?.OverheadApplicability?.label !== "Fixed",
                                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                        max: {
                                            value: 100,
                                            message: 'Percentage cannot be greater than 100'
                                        },
                                    }}
                                    mandatory={!!state?.OverheadApplicability && (Object.keys(state?.OverheadApplicability).length > 0) && state?.OverheadApplicability?.label && state?.OverheadApplicability?.label !== "Fixed"}
                                    handleChange={handleOverheadPercentageChange}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.OverheadPercentage}
                                    disabled={ !!state?.OverheadApplicability && !(Object.keys(state?.OverheadApplicability).length > 0) || state?.isViewMode}
                                />
                            </Col>
                        }

                        <Col md="3">
                            <div className={`pt-2 mt-4 pr-0 mb-3`}>
                                {editItemId ? (
                                <>
                                    <button type="button" className={"btn btn-primary pull-left mr5"} 
                                        onClick={handleAddApplicability}
                                    >Update</button>
                                    <button
                                        type="button"
                                        className={"mr15 ml-1 add-cancel-btn cancel-btn my-0"}
                                        disabled={state?.isViewMode}
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
                                        disabled={state?.isViewMode}
                                        onClick={handleAddApplicability}
                                        >
                                        <div className={"plus"}></div>ADD
                                    </button>
                                    <button
                                        type="button"
                                        className={"mr15 ml-1 reset-btn"}
                                        disabled={state?.isViewMode}
                                        onClick={handleResetApplicability}
                                    >
                                    Reset
                                    </button>
                                </>
                                )}
                            </div>
                        </Col>
                    </Row>
                }
            </Col>

            {isShowApplicabilitySection &&
                <Col md="12">
                    <Table className="table border" size="sm">
                        <thead>
                            <tr>
                                <th>{`Applicability`}</th>
                                {state?.IsPaymentTermsRecord &&
                                    <th>{`Repayment Period`}</th>
                                }
                                <th>{`Percentage`}</th>
                                <th>{`Action`}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {state?.ApplicabilityDetails && state?.ApplicabilityDetails.length > 0 &&
                            state.ApplicabilityDetails.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{item?.Applicability}</td>
                                    {state?.IsPaymentTermsRecord && 
                                        <td>{item?.RepaymentPeriod}</td>
                                    }
                                    <td>{item?.Percentage}</td>
                                    <td>
                                        <button
                                            className="Edit mr-2"
                                            title='Edit'
                                            type={"button"}
                                            disabled={state?.isViewMode || item?.IsAssociated}
                                            onClick={() =>
                                                editApplicability(item)
                                            }
                                        />
                                        <button
                                            className="Delete"
                                            title='Delete'
                                            type={"button"}
                                            disabled={state?.isViewMode || item?.IsAssociated}
                                            onClick={() =>
                                                deleteApplicability(item?.ApplicabilityId)
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                            })}
                        </tbody>

                        {state?.ApplicabilityDetails?.length === 0 && (
                            <tbody className='border'>
                                <tr>
                                    <td colSpan={"10"}> <NoContentFound title={EMPTY_DATA} /></td>
                                </tr>
                            </tbody>
                        )}
                    </Table>
                </Col>
            }
        </Row >
    );
}


export default React.memo(AddOverheadMasterDetails);