import React, { useEffect, useState } from 'react';
import { Row, Col, Label, Table, FormGroup, Input } from 'reactstrap';
import { Controller, useWatch, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { LabelsClass } from '../../../helper/core';
import { MESSAGES } from '../../../config/message';
import { reactLocalStorage } from 'reactjs-localstorage';
import DayTime from '../../common/DayTimeWrapper';
import { useTranslation } from 'react-i18next';
// import { required, number, checkWhiteSpaces, percentageLimitValidation, showDataOnHover, getConfigurationKey, checkForNull } from "../../../helper";
import { CBCTypeId, EMPTY_DATA, ICCANDPAYMENTMASTER, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import { SearchableSelectHookForm, TextFieldHookForm, DatePickerHookForm, AsyncSearchableSelectHookForm } from '../../layout/HookFormInputs';
import { fetchApplicabilityList, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { autoCompleteDropdown, getCostingConditionTypes, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material';
import { updateInterestRate, createInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, getInterestRateData, getWipCompositionMethodList, getInventoryDayTypeSelectList, getInterestRateDataList, getICCMethodSelectList } from '../actions/InterestRateMaster';
import { getClientSelectList } from '../actions/Client';
import { getPartFamilySelectList } from '../actions/Part';
import { fetchCostingHeadsAPI, fetchModelTypeAPI, getPlantSelectListByType } from '../../../actions/Common';
import { ASSEMBLY } from '../../../config/masterData';
import WarningMessage from '../../common/WarningMessage';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster';
import { debounce } from 'lodash';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import { checkEffectiveDate } from '../masterUtil';
import { required, postiveNumber, maxLength10, nonZero, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, checkForNull, maxLength7 } from "../../../helper/validation";
import { fetchSpecificationDataAPI } from '../../../actions/Common';
import AddOverheadMasterDetails from '../overhead-profit-master/AddOverheadMasterDetails';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';




const AddPaymentTerms = (props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation("MasterLabels");

    const { register, handleSubmit, control, setValue, getValues, reset, trigger, clearErrors, formState: { errors }, } = useForm({
                mode: 'onChange',
                reValidateMode: 'onChange',
                // defaultValues: defaultValues,
        })
    
    // State management
    const [state, setState] = useState({
        vendorName: [],
        ICCApplicability: [],
        PaymentTermsApplicability: [],
        singlePlantSelected: [],
        selectedPlants: [],
        isEditFlag: false,
        isViewMode: props?.data?.isViewMode ? true : false,
        isVendorNameNotSelected: false,
        InterestRateId: '',
        EffectiveDate: '',
        Data: [],
        selectedPartFamily: [],
        selectedICCMethod: [],
        InventoryDayType: [],
        ModelType: [],
        DropdownNotChanged: true,
        updatedObj: {},
        setDisable: false,
        inputLoader: false,
        isDataChanged: props.data.isEditFlag,
        minEffectiveDate: '',
        showErrorOnFocus: false,
        costingTypeId: ZBCTypeId,
        // client: [],
        clientName: [],
        showPopup: false,
        vendorFilterList: [],
        RawMaterial: [],
        RMGrade: [],
        isRawMaterialSelected: false,
        isGradeSelected: false,
        isEitherSectionFilled: false,
        // isWarningVisible: true,
        isWarningVisible: false,
        IsFinancialDataChanged: true,
        isAssemblyCheckbox: false,
        isApplyInventoryDays: false,
        iccApplicability: [],
        inventoryDayType: [],
        ApplicabilityBasedInventoryDayType: "",
        paymentTermsApplicability: [],
        Applicability: [],
        applicabilityPercent: "",
        editItemId: "",
        ApplicabilityDetails: [],
        selectedApplicabilities: [],
        selectedInventoryDayType: [],
        selectedWIPMethods: [],
        WIPMethod: [],
        ICCMethods: [],
        isShowApplicabilitySection: true,
        CreditBasedAnnualICCPercent: 0,
        IsPaymentTermsRecord: true,
        RepaymentPeriod: "",
        isHideModelType: true
    });

    // Selectors
    const costingHead = useSelector((state) => state.comman.costingHead);
    const { rawMaterialNameSelectList, gradeSelectList } = useSelector((state) => state.material);
    const { iccApplicabilitySelectList, interestRateData, iccMethodSelectList, inventoryDayTypeSelectList, wipCompositionMethodSelectList } = useSelector((state) => state.interestRate);
    const conditionTypeId = getCostingConditionTypes(ICCANDPAYMENTMASTER);
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;


    // Effects
    useEffect(() => {
        if (!(props.data.isEditFlag || state.isViewMode)) {
            dispatch(getClientSelectList(() => {}));
            dispatch(getPartFamilySelectList(() => {}));
            dispatch(fetchModelTypeAPI('--Model Types--', (res) => {}));
        }
        dispatch(getWipCompositionMethodList(() => {}));
        dispatch(getInventoryDayTypeSelectList(() => {}));
        dispatch(getICCMethodSelectList(() => {}));

        const isRequestForMultiTechnology = state.isAssemblyCheckbox;
        dispatch(fetchApplicabilityList(null, conditionTypeId, isRequestForMultiTechnology, () => {}));
        dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => {}));
        getDetail();
        dispatch(getICCAppliSelectList(() => {}));
        dispatch(fetchCostingHeadsAPI('payment terms', false, false, res => {
            const temp = [];
            res?.data?.SelectList?.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            setState(prev => ({ ...prev, paymentTermsApplicability: temp }));
            
            dispatch(fetchCostingHeadsAPI('ICC', false, false, res => {
                const temp = [];
                res?.data?.SelectList?.map((item) => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value });
                    return null;
                });
                setState(prev => ({ ...prev, iccApplicability: temp }));
            }));
        }));

        if (getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC) {
            dispatch(getRawMaterialNameChild(() => {}));
        }
    }, []);


    const getDetail = () => {
        const { data } = props;
        if (data && data.isEditFlag) {
            setState(prev => ({
                ...prev,
                isLoader: true,
                isEditFlag: true,
                InterestRateId: data.Id,
            }));

            dispatch(getInterestRateData(data.Id, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    setState(prev => ({
                        ...prev,
                        Data: Data,
                    }));

                    // setValue("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '');
                    setValue("EffectiveDate", DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '')
                    setState(prev => ({ ...prev, minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' }));
                    setValue("ModelType", Data.ICCModelType !== undefined ? { label: Data?.ICCModelType, value: Data?.ICCModelTypeId } : [])
                    setValue("costingTypeId", Data?.CostingTypeId)
                    setValue("clientName", Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [])
                    setValue("vendorName", Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [])
                    setValue("PartFamily", Data.PartFamily !== undefined ? { label: Data.PartFamily, value: Data.PartFamilyId } : []);
                    setValue("Plant", Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [])
                    setValue("DestinationPlant", Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {})
                    setValue("ICCMethod", Data.ICCMethod !== undefined ? { label: Data.ICCMethod, value: Data.ICCMethod } : [])

                    setTimeout(() => {
                        const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability);
                        const paymentObj = costingHead && costingHead.find(item => item.Text === Data.PaymentTermApplicability);
                        
                        setState(prev => ({
                            ...prev,
                            isEditFlag: true,
                            costingTypeId: Data.CostingTypeId,
                            client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
                            vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorIdRef } : [],
                            selectedPlants: Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [],
                            singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {},
                            ApplicabilityDetails: Data?.PaymentTermsApplicabilityDetails !== undefined ? Data.PaymentTermsApplicabilityDetails : [],

                            // ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
                            PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
                            EffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
                            RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
                            RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
                            isAssemblyCheckbox: Data?.TechnologyId === ASSEMBLY ? true : false ,
                            selectedPartFamily: Data?.PartFamily !== undefined ? { label: Data?.PartFamily, value: Data?.PartFamilyId } : [],
                            // ApplicabilityDetails: Data?.PaymentTermsApplicabilityDetails !== undefined ? Data.PaymentTermsApplicabilityDetails : [],
                            // ModelType: Data.ICCModelType !== undefined ? { label: Data?.ICCModelType, value: Data?.ICCModelTypeId } : [],
                            isLoader: false
                        }));
                    }, 500);
                }
            }));
        } else {
            setState(prev => ({ ...prev, isLoader: false }));
            dispatch(getInterestRateData('', () => { }));
        }
    };

    const cancel = (type) => {
        reset();
        setState(prev => ({
            ...prev,
            vendorName: [],
            isEditFlag: false,
        }));
        dispatch(getInterestRateData('', () => { }));
        props.hideForm(type);
    };

    const cancelHandler = () => {
        if (state.isViewMode) {
            cancel('cancel');
        } else {
            setState(prev => ({ ...prev, showPopup: true }));
        }
    };

    const onPopupConfirm = () => {
        cancel('cancel');
        setState(prev => ({ ...prev, showPopup: false }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    // Form submission
    const onSubmit = debounce((values) => {
        const { Data, vendorName, costingTypeId, client, ICCApplicability, singlePlantSelected, selectedPlants, PaymentTermsApplicability, InterestRateId, EffectiveDate, DropdownNotChanged, RMGrade, RawMaterial, selectedPartFamily } = state;
        const { data } = props;
        const userDetail = userDetails();
        const userDetailsInterest = JSON.parse(localStorage.getItem('userDetail'));

        let plantArray = [];
        if (costingTypeId === VBCTypeId) {
            plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value });
        } else {
            selectedPlants && selectedPlants.map((item) => {
                plantArray.push({ PlantName: item.label, PlantId: item.value });
                return plantArray;
            });
        }

        let cbcPlantArray = [];
        if (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) {
            cbcPlantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value });
        } else {
            userDetailsInterest?.Plants.map((item) => {
                cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode });
                return cbcPlantArray;
            });
        }

        if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
            if (costingTypeId === VBCTypeId) {
                setState(prev => ({ ...prev, isVendorNameNotSelected: true, setDisable: false }));
                return false;
            }
        }
        setState(prev => ({ ...prev, isVendorNameNotSelected: false }));

        let formData = {
            "VendorInterestRateId": state.isEditFlag ? InterestRateId : null,
            "ModifiedBy": state.isEditFlag ? loggedInUserId() : null,
            "VendorName": state.isEditFlag ? costingTypeId === VBCTypeId ? vendorName.label : userDetail.ZBCSupplierInfo.VendorName : null,
            "ICCApplicability": ICCApplicability.label,
            "PaymentTermApplicability": PaymentTermsApplicability.label,
            "CostingTypeId": costingTypeId,
            "VendorIdRef": costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
            "ICCPercent": values.ICCPercent,
            "PaymentTermPercent": values.PaymentTermPercent,
            "RepaymentPeriod": values.RepaymentPeriod,
            "EffectiveDate": DayTime(EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            "IsActive": true,
            "CreatedDate": '',
            "CreatedBy": loggedInUserId(),
            "Plants": costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
            "CustomerId": costingTypeId === CBCTypeId ? client.value : '',
            "RawMaterialChildId": RawMaterial?.value,
            "RawMaterialName": RawMaterial?.label,
            "RawMaterialGradeId": RMGrade?.value,
            "RawMaterialGrade": RMGrade?.label,
            "PartFamilyId": selectedPartFamily?.value,
            "PartFamily": selectedPartFamily?.label,
            "ICCApplicabilityDetails": null,
            "InterestRateInventoryTypeDetails": null,
            "InterestRateWIPCompositionMethodDetails": null,
            "PaymentTermsApplicabilityDetails": state?.ApplicabilityDetails,
            "IsPaymentTermsRecord": true,
            "ICCModelType": "",
            "ICCModelTypeId": 0,
            "ICCMethod": "",
            "ICCMethodId": 0,
            "ApplicabilityBasedInventoryDayType": "",
            "CreditBasedAnnualICCPercent": 0,
            "IsApplyInventoryDay": state?.isApplyInventoryDays,
            "TechnologyId": state.isAssemblyCheckbox ? ASSEMBLY : null,
        };

        if (state.isEditFlag) {
            if (Data.ICCApplicability === ICCApplicability.label && 
                Data.ICCPercent === values.ICCPercent &&
                Data.PaymentTermApplicability === PaymentTermsApplicability.label &&
                Data.PaymentTermPercent === values.PaymentTermPercent &&
                Data.RepaymentPeriod === values.RepaymentPeriod && 
                DropdownNotChanged) {
                Toaster.warning('Please change the data to save Interest Rate Details');
                return false;
            }

            let financialDataChanged = (Number(Data?.ICCPercent) !== Number(values?.ICCPercent)) || 
                (Number(Data?.PaymentTermPercent) !== Number(values?.PaymentTermPercent)) || 
                (Number(Data?.RepaymentPeriod) !== Number(values?.RepaymentPeriod)) ||
                ((Data?.ICCApplicability) !== (ICCApplicability.label)) || 
                ((Data?.PaymentTermApplicability) !== (PaymentTermsApplicability.label));

            if (financialDataChanged && checkEffectiveDate(EffectiveDate, Data?.EffectiveDate) && props?.IsAssociatedData) {
                setState(prev => ({ ...prev, setDisable: false }));
                Toaster.warning('Please update the Effective date.');
                return false;
            }

            formData.IsFinancialDataChanged = financialDataChanged ? true : false;

            dispatch(updateInterestRate(formData, (res) => {
                setState(prev => ({ ...prev, setDisable: false }));
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
                    cancel('submit');
                }
            }));
        } else {
            setState(prev => ({ ...prev, setDisable: true }));
            dispatch(createInterestRate(formData, (res) => {
                setState(prev => ({ ...prev, setDisable: false }));
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
                    cancel('submit');
                }
            }));
        }
    }, 500);


    const onPressVendor = (costingHeadFlag) => {
        setState(prev => ({
            ...prev,
            vendorName: [],
            costingTypeId: costingHeadFlag
        }));
        if (costingHeadFlag === CBCTypeId) {
            dispatch(getClientSelectList(() => {}));
        }
    };


    return (
        <>
        <div className="container-fluid">
            {state.isLoader && <LoaderCustom />}
            <div className="login-container signup-form">
                <div className="row">
                    <div className="col-md-12">
                        <div className="shadow-lgg login-formg">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-heading mb-0">
                                        <h1>
                                            {state.isViewMode ? "View" : state.isEditFlag ? "Update" : "Add"} Payment Terms
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <form
                                noValidate
                                // className="form"
                                onSubmit={handleSubmit(onSubmit)}
                                onKeyDown={handleKeyDown}
                            >
                                <div className="add-min-height">
                                    <Row>
                                        <Col md="12">
                                            {reactLocalStorage.getObject('CostingTypePermission').zbc && (
                                                <Label id='AddInterestRate_ZeroBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={state.costingTypeId === ZBCTypeId}
                                                        onClick={() => onPressVendor(ZBCTypeId)}
                                                        disabled={state.isEditFlag}
                                                    />
                                                    <span>Zero Based</span>
                                                </Label>
                                            )}
                                            {reactLocalStorage.getObject('CostingTypePermission').vbc && (
                                                <Label id='AddInterestRate_VendorBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={state.costingTypeId === VBCTypeId}
                                                        onClick={() => onPressVendor(VBCTypeId)}
                                                        disabled={state.isEditFlag}
                                                    />
                                                    <span>{VendorLabel} Based</span>
                                                </Label>
                                            )}
                                            {reactLocalStorage.getObject('CostingTypePermission').cbc && (
                                                <Label id="AddInterestRate_CustomerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={state.costingTypeId === CBCTypeId}
                                                        onClick={() => onPressVendor(CBCTypeId)}
                                                        disabled={state.isEditFlag}
                                                    />
                                                    <span>Customer Based</span>
                                                </Label>
                                            )}
                                        </Col>
                                    </Row>

                                    <AddOverheadMasterDetails 
                                        // costingTypeId={costingTypeId}
                                        costingTypeId={state.costingTypeId}
                                        conditionTypeId={conditionTypeId}
                                        state={state}
                                        setState={setState}
                                        setValue={setValue}
                                        register={register}
                                        trigger={trigger}
                                        clearErrors={clearErrors}
                                        control={control}
                                        getValues={getValues}
                                        errors={errors}
                                        // isOverHeadMaster={true}
                                        isOverHeadMaster={false}
                                        isShowPartFamily={true}
                                        applicabilityLabel="Payment Terms"
                                        isShowApplicabilitySection= {state.isShowApplicabilitySection}
                                    >
                                    </AddOverheadMasterDetails>
                                </div>

                                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                    <div className="col-sm-12 text-right bluefooter-butn">
                                        {(!state.isViewMode && !state.isEditFlag && state.isWarningVisible) && (
                                            <WarningMessage
                                                dClass="col-md-12 pr-0 justify-content-end"
                                                message="Either ICC or Payment Term should be filled!"
                                            />
                                        )}
                                        <button
                                            id='AddInterestRate_Cancel'
                                            type="button"
                                            className="mr15 cancel-btn"
                                            onClick={cancelHandler}
                                            disabled={state.setDisable}
                                        >
                                            <div className="cancel-icon"></div>
                                            Cancel
                                        </button>
                                        {!state.isViewMode && (
                                            <button
                                                type="submit"
                                                id='AddInterestRate_Save'
                                                disabled={state.isViewMode || state.setDisable || (state.isWarningVisible && !state.isEditFlag)}
                                                className="user-btn mr5 save-btn"
                                            >
                                                <div className="save-icon"></div>
                                                {state.isEditFlag ? "Update" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {state.showPopup && (
            <PopupMsgWrapper
                isOpen={state.showPopup}
                closePopUp={() => setState(prev => ({ ...prev, showPopup: false }))}
                confirmPopup={onPopupConfirm}
                message={MESSAGES.CANCEL_MASTER_ALERT}
            />
        )}
    </>
   
    );
};

export default AddPaymentTerms; 


