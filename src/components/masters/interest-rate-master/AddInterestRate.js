import React, { useEffect, useState } from 'react';
import { Row, Col, Label, Table, FormGroup, Input } from 'reactstrap';
import { Controller, useWatch, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { LabelsClass } from '../../../helper/core';
import { MESSAGES } from '../../../config/message';
import NoContentFound from '../../common/NoContentFound';
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
// import { ICCMethods } from '../../../config/constants';
import { ICC_METHODS } from '../../../config/constants';
import { required, postiveNumber, maxLength10, nonZero, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, checkForNull, maxLength7 } from "../../../helper/validation";
import { fetchSpecificationDataAPI } from '../../../actions/Common';
import AddOverheadMasterDetails from '../overhead-profit-master/AddOverheadMasterDetails';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import TableRenderer from '../../common/TableRenderer';




const AddInterestRate = (props) => {
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
        ICCSectionFilled: {
            ICCApplicability: false,
            ICCPercent: false
        },
        PaymentSectionFilled: {
            PaymentTermsApplicability: false,
            RepaymentPeriod: false,
        },
        isAssemblyCheckboxIcc: false,
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
        CreditBasedAnnualICCPercent: 0
    });

    // Selectors
    const clientSelectList = useSelector((state) => state.client.clientSelectList);
    const plantSelectList = useSelector((state) => state.comman.plantSelectList);
    const partFamilySelectList = useSelector((state) => state.part.partFamilySelectList);
    const modelTypes = useSelector((state) => state.comman.modelTypes);
    const costingHead = useSelector((state) => state.comman.costingHead);
    const { rawMaterialNameSelectList, gradeSelectList } = useSelector((state) => state.material);
    const { iccApplicabilitySelectList, interestRateData, iccMethodSelectList, inventoryDayTypeSelectList, wipCompositionMethodSelectList } = useSelector((state) => state.interestRate);
    console.log(inventoryDayTypeSelectList,'inventoryDayTypeSelectList')
    const { applicabilityList } = useSelector((state) => state.comman);
    const vendorSelectList = useSelector((state) => state.comman.vendorSelectList);

    const conditionTypeId = getCostingConditionTypes(ICCANDPAYMENTMASTER);
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;



    const columns = [
      { columnHead: "WIP Head", key: "InventoryType" },
      {
        columnHead: "Inventory Days",
        key: "NumberOfDays",
        type: "textField",
        fieldKey: "inventoryDay",
        valueKey: "NumberOfDays",
        mandatory: true,
        validate: {number, checkWhiteSpaces, maxLength7},
        handleChangeFn: handleWipInventoryDayChange
      },
      {
        columnHead: "Supplier Credit Days",
        key: "CreditDays",
        type: "textField",
        fieldKey: "SupplierCreditDays",
        valueKey: "CreditDays",
        mandatory: true,
        validate: {number, checkWhiteSpaces, maxLength7},
        handleChangeFn: handleSupplierDayChange
      },
      { columnHead: "Interest Days", key: "InterestDays" },
      { columnHead: "Action", key: "action" }
  ];


  const Inventory_Day_Columns = [
    {
      columnHead: "Inventory Day Types",
      key: "InventoryType"
    },
    {
      columnHead: "No. Of Days",
      key: "NumberOfDays",
      type: "textField",
      fieldKey: "InventoryDays",
      valueKey: "NumberOfDays",
      mandatory: true,
      validate: { number, checkWhiteSpaces, maxLength7 },
      handleChangeFn: handleInventoryDayChange
    },
    {
      columnHead: "Action",
      key: "action"
    }
  ];

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

        // const isRequestForMultiTechnology = !state.isAssemblyCheckboxIcc ? true : false;
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
        if (state.Data.length !== 0) {
            checkFilledSections();
        }
    }, []);

    // Helper functions
    const renderListing = (label) => {
        const temp = [];
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'vendor') {
            vendorSelectList && vendorSelectList.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'ICCApplicability') {
            if (!applicabilityList) return [];
            let excludeFixed = false;
            let includeOnlyFixed = false;
            if ((state?.ApplicabilityDetails && state?.ApplicabilityDetails.length > 0) || (state?.selectedApplicabilities && state?.selectedApplicabilities.length > 0)) {
                const hasFixedInApplicabilityDetails = state?.ApplicabilityDetails.some(
                    ap => ap.Applicability?.toLowerCase() === "fixed"
                );
                const hasFixedInSelectedApplicabilities = state?.selectedApplicabilities?.some(
                    ap => ap.Applicability?.toLowerCase() === "fixed" || ap.label?.toLowerCase() === "fixed"
                );
                const fixedExists = hasFixedInApplicabilityDetails || hasFixedInSelectedApplicabilities;
                includeOnlyFixed = fixedExists;
                excludeFixed = !fixedExists;
            }
            const filtered = applicabilityList.filter(item => {
                const isFixed = item.Text?.toLowerCase() === "fixed";
                const isAlreadyUsed = state?.ApplicabilityDetails?.some(
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
        if (label === 'PartFamily') {
            partFamilySelectList && partFamilySelectList.map((item) => {
                if (item.Value === '--0--') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'ModelType') {
            modelTypes && modelTypes.map(item => {
                if (item.Value === '0') return false;
                // temp.push({ label: item.Text, value: item.Value });
                temp.push({ label: item.Text, value: item.Text });
                return null;
            });
            return temp;
        }
        if (label === 'RMGrade' || label === 'grade') {
            gradeSelectList && gradeSelectList.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'ICCMethod') {
            iccMethodSelectList && iccMethodSelectList.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'InventoryDayType') {
            const existingTypes = state?.selectedInventoryDayType?.map(item => item.InventoryType);
            inventoryDayTypeSelectList && inventoryDayTypeSelectList.map((item) => {
                if (item.Value === '0') return false;
                if (!existingTypes.includes(item.Text)) {
                    temp.push({ label: item.Text, value: item.Value });
                }
                return null;
            });
            return temp;
        }
        if (label === 'ApplicabilityBasedInventoryDayType') {
            inventoryDayTypeSelectList && inventoryDayTypeSelectList.map((item) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Text });
                return null;
            });
            return temp;
        }
        if (label === 'WIPMethod') {
            const existingWipMethods = state?.selectedWIPMethods?.map(item => item.InventoryType);
            wipCompositionMethodSelectList && wipCompositionMethodSelectList.map((item) => {
                if (item.Value === '0') return false;
                if (!existingWipMethods.includes(item.Text)) {
                    temp.push({ label: item.Text, value: item.Value });
                }
                return null;
            });
            return temp;
        }
        if (label === 'ICC') {
            let modifiedArray = iccApplicabilitySelectList;
            if (state.isRawMaterialSelected || state.isGradeSelected) {
                modifiedArray = iccApplicabilitySelectList.filter(item => {
                    return !(item.Text.startsWith("Part"));
                });
            }
            modifiedArray?.map((item) => {
                if (item.Value !== '0' && item.Text !== 'Net Cost' && item.Text !== 'Total Cost + Other Cost - Discount') {
                    temp.push({ label: item.Text, value: item.Value });
                }
            });
            return temp;
        }
        if (label === 'PaymentTerms') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0' || item.Text === 'Net Cost') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false;
                temp.push({ Text: item.PlantNameCode, Value: item.PlantId });
                return null;
            });
            return temp;
        }
        if (label === 'singlePlant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false;
                temp.push({ label: item.PlantNameCode, value: item.PlantId });
                return null;
            });
            return temp;
        }
        if (label === 'ClientList') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
    };

    // Event handlers
    const handleICCApplicability = (newValue) => {
        const ICCSectionFilled = { ...state.ICCSectionFilled };
        ICCSectionFilled.ICCApplicability = newValue ? true : false;
        setValue("ICCPercent", '');

        if (newValue && newValue !== '') {
            setState(prev => ({ ...prev, ICCApplicability: newValue, ICCSectionFilled }), () => { checkFilledSections(); });
        } else {
            setState(prev => ({ ...prev, ICCApplicability: [], ICCSectionFilled }));
        }
        
        if (state.ICCApplicability.value === newValue.value) {
            setState(prev => ({ ...prev, isDataChanged: true, DropdownNotChanged: true, ICCFilled: true, ICCSectionFilled }));
        } else {
            setState(prev => ({ ...prev, isDataChanged: false, DropdownNotChanged: false, ICCFilled: false, ICCSectionFilled }));
        }
    };

    const handlePaymentApplicability = (newValue) => {
        const PaymentSectionFilled = { ...state.PaymentSectionFilled };
        PaymentSectionFilled.PaymentTermsApplicability = newValue ? true : false;

        setValue("RepaymentPeriod", '');
        setValue("PaymentTermPercent", '');

        if (newValue && newValue !== '') {
            setState(prev => ({
                ...prev,
                PaymentTermsApplicability: newValue,
                PaymentSectionFilled
            }), () => {
                checkFilledSections();
            });
        } else {
            setState(prev => ({ ...prev, PaymentTermsApplicability: [], PaymentSectionFilled }));
        }

        if (state.PaymentTermsApplicability.value === newValue.value) {
            setState(prev => ({ ...prev, isDataChanged: true, DropdownNotChanged: true, PaymentSectionFilled }));
        } else {
            setState(prev => ({ ...prev, isDataChanged: false, DropdownNotChanged: false, PaymentSectionFilled }));
        }
    };

    const handleChangeAnnualIccPercentage = (newValue) => {
        const ICCSectionFilled = { ...state.ICCSectionFilled };
        ICCSectionFilled.ICCPercent = newValue ? true : false;

        if (state.isEditFlag) {
            if (String(newValue) === String(state.Data.ICCPercent) &&
                String(state.ICCApplicability.label) === String(state.Data.ICCApplicability)) {
                setState(prev => ({ ...prev, isDataChanged: true, ICCSectionFilled }), () => { checkFilledSections(); });
            } else {
                setState(prev => ({ ...prev, isDataChanged: false, ICCSectionFilled }), () => { checkFilledSections(); });
            }
        } else {
            setState(prev => ({ ...prev, ICCSectionFilled }), () => { checkFilledSections(); });
        }
    };

    const handlePercentChange = (e) => {
        const val = e.target.value;
        setState(prev => ({ ...prev, applicabilityPercent: val }));
    };

    const handleChangeRepaymentPeriod = (newValue) => {
        const PaymentSectionFilled = { ...state.PaymentSectionFilled };
        PaymentSectionFilled.RepaymentPeriod = newValue ? true : false;

        if (state.isEditFlag) {
            if (String(newValue) === String(state.Data.RepaymentPeriod) && 
                String(state.PaymentTermsApplicability.label) === String(state.Data.PaymentTermApplicability)) {
                setState(prev => ({ ...prev, isDataChanged: true, PaymentSectionFilled }), () => { checkFilledSections(); });
            } else {
                setState(prev => ({ ...prev, isDataChanged: false, PaymentSectionFilled }), () => { checkFilledSections(); });
            }
        } else {
            setState(prev => ({ ...prev, PaymentSectionFilled }), () => { checkFilledSections(); });
        }
    };

    const handleChangePaymentTermPercentage = (newValue) => {
        if (state.isEditFlag) {
            if (String(newValue) === String(state.Data.PaymentTermPercent) && 
                String(state.PaymentTermsApplicability.label) === String(state.Data.PaymentTermApplicability)) {
                setState(prev => ({ ...prev, isDataChanged: true }));
            } else {
                setState(prev => ({ ...prev, isDataChanged: false }));
            }
        }
    };

    const checkFilledSections = () => {
        const { ICCSectionFilled, PaymentSectionFilled, ICCApplicability, PaymentTermsApplicability } = state;
        let isICCFilled, isPaymentFilled;

        if ((ICCApplicability && ICCApplicability.value !== "Fixed" && ICCApplicability.value !== undefined) ||
            (PaymentTermsApplicability && PaymentTermsApplicability.value !== "Fixed" && PaymentTermsApplicability.value !== undefined)) {
            isICCFilled = Object.values(ICCSectionFilled).some(value => value === false);
            isPaymentFilled = Object.values(PaymentSectionFilled).some(value => value === false);
        } else {
            isICCFilled = ICCSectionFilled.ICCApplicability === false;
            isPaymentFilled = PaymentSectionFilled.PaymentTermsApplicability === false;
        }

        isICCFilled = state.ApplicabilityDetails.length > 0;
        const isWarningVisible = isICCFilled && isPaymentFilled;
        setState(prev => ({ ...prev, isWarningVisible }));
    };

    const handleEffectiveDateChange = (date) => {
        setState(prev => ({ 
            ...prev, 
            EffectiveDate: DayTime(date).isValid() ? DayTime(date) : '',
            DropdownNotChanged: false 
        }));
    };

    const handlePlant = (e) => {
        setState(prev => ({ 
            ...prev, 
            selectedPlants: e,
            DropdownNotChanged: false 
        }));
    };

    const handleApplicability = (e) => {
        setState(prev => ({ ...prev, selectedApplicabilities: e }));
    };

    const handleSinglePlant = (newValue) => {
        setState(prev => ({ ...prev, singlePlantSelected: newValue }));
    };

    const handleClient = (newValue) => {
        if (newValue && newValue !== '') {
            setState(prev => ({ ...prev, client: newValue }));
        } else {
            setState(prev => ({ ...prev, client: [] }));
        }
    };

    const handleRMChange = (newValue) => {
        setState(prev => ({ ...prev, isRawMaterialSelected: true }));

        if (newValue && newValue !== '') {
            setState(prev => ({ ...prev, RawMaterial: newValue, RMGrade: [] }), () => {
                dispatch(getRMGradeSelectListByRawMaterial(
                    newValue.value,
                    false,
                    (res) => { },
                ));
            });
        } else {
            setState(prev => ({ ...prev, RMGrade: [], RMSpec: [], RawMaterial: [] }));
            dispatch(getRMGradeSelectListByRawMaterial('', false, (res) => { }));
            dispatch(fetchSpecificationDataAPI(0, () => { }));
        }
    };

    const handleGradeChange = (newValue) => {
        setState(prev => ({ ...prev, isGradeSelected: true }));

        if (newValue && newValue !== '') {
            setState(prev => ({ ...prev, RMGrade: newValue }));
        } else {
            setState(prev => ({ ...prev, RMGrade: [] }));
        }
    };

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
                        ICCSectionFilled: {
                            ICCApplicability: Data?.ICCApplicability != null,
                            ICCPercent: Data?.ICCPercent != null,
                        },
                        PaymentSectionFilled: {
                            PaymentTermsApplicability: Data.PaymentTermApplicability != null,
                            RepaymentPeriod: Data?.RepaymentPeriod != null,
                        }
                    }));

                    // setValue("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '');
                    setValue("EffectiveDate", DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '')
                    setState(prev => ({ ...prev, minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' }));

                    setValue("ModelType", Data.ICCModelType !== undefined ? { label: Data?.ICCModelType, value: Data?.ICCModelTypeId } : [])
                    setValue("costingTypeId", Data?.CostingTypeId)
                    setValue("clientName", Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [])
                    setValue("vendorName", Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [])
                    setValue("PartFamily", Data.PartFamily !== undefined ? { label: Data.PartFamily, value: Data.PartFamilyId } : []);
                    // setValue("Plant", Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [])
                    // setValue("DestinationPlant", Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {})
                    setValue("Plant", Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [])
                    setValue("DestinationPlant", Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {})
                    setValue("ICCMethod", Data.ICCMethod !== undefined ? { label: Data.ICCMethod, value: Data.ICCMethod } : [])
                    setValue("CreditBasedAnnualICCPercent", Data?.CreditBasedAnnualICCPercent)
                    setValue("ApplicabilityBasedInventoryDayType", Data?.ApplicabilityBasedInventoryDayType !== undefined ? { label: Data?.ApplicabilityBasedInventoryDayType, value: Data?.ApplicabilityBasedInventoryDayType } : [])

                    setTimeout(() => {
                        const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability);
                        const paymentObj = costingHead && costingHead.find(item => item.Text === Data.PaymentTermApplicability);
                        
                        setState(prev => ({
                            ...prev,
                            isEditFlag: true,
                            costingTypeId: Data.CostingTypeId,
                            client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
                            vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorIdRef } : [],
                            // selectedPlants: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0]?.PlantId }] : [],
                            // singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0].PlantId ? { label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId } : {},
                            selectedPlants: Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [],
                            singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {},
                            ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
                            PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
                            EffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
                            RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
                            RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
                            isAssemblyCheckboxIcc: Data?.TechnologyId === ASSEMBLY ? true : false,
                            isAssemblyCheckbox: Data.TechnologyId === ASSEMBLY ? true : false ,
                            selectedPartFamily: Data.PartFamily !== undefined ? { label: Data.PartFamily, value: Data.PartFamilyId } : [],

                            ApplicabilityDetails: Data?.ICCApplicabilityDetails !== undefined ? Data.ICCApplicabilityDetails : [],
                            selectedInventoryDayType: Data?.InterestRateInventoryTypeDetails ? Data?.InterestRateInventoryTypeDetails : [],
                            selectedWIPMethods: Data?.InterestRateWIPCompositionMethodDetails ? Data?.InterestRateWIPCompositionMethodDetails : [],
                            // IsPaymentTermsRecord: Data?.IsPaymentTermsRecord,
                            ModelType: Data.ICCModelType !== undefined ? { label: Data?.ICCModelType, value: Data?.ICCModelTypeId } : [],
                            ApplicabilityBasedInventoryDayType: Data?.ApplicabilityBasedInventoryDayType !== undefined ? { label: Data?.ApplicabilityBasedInventoryDayType, value: Data?.ApplicabilityBasedInventoryDayType } : [],
                            CreditBasedAnnualICCPercent: Data?.CreditBasedAnnualICCPercent,
                            selectedICCMethod: Data.ICCMethod !== undefined ? { label: Data.ICCMethod, value: Data.ICCMethodId } : [],
                            isApplyInventoryDays: Data?.IsApplyInventoryDay,
                            // isShowApplicabilitySection: Data.ICCMethod === "Credit Based" ? false : true,
                            isShowApplicabilitySection: Data?.ICCMethodId == ICC_METHODS.CreditBased ? false : true,

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
            "ICCApplicabilityDetails": state?.ApplicabilityDetails,
            "InterestRateInventoryTypeDetails": state.selectedInventoryDayType,
            "InterestRateWIPCompositionMethodDetails": state.selectedWIPMethods,
            "PaymentTermsApplicabilityDetails": null,
            "IsPaymentTermsRecord": false,
            "ICCModelType": state?.ModelType?.label,
            "ICCModelTypeId": state?.ModelType?.value,
            "ICCMethod": state?.selectedICCMethod?.label,
            "ICCMethodId": state?.selectedICCMethod?.value,
            "ApplicabilityBasedInventoryDayType": state?.ApplicabilityBasedInventoryDayType?.value,
            "CreditBasedAnnualICCPercent": state?.CreditBasedAnnualICCPercent,
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


    const ICCMethodChange = (newValue) => {
        let updatedState = {
            selectedICCMethod: newValue,
            // InventoryDayType: [],
            ApplicabilityBasedInventoryDayType: [],            
            selectedInventoryDayType: [],
            isShowApplicabilitySection: false,
            isApplyInventoryDays: false
        };
        if (newValue?.value === ICC_METHODS.CreditBased) {
            updatedState.isApplyInventoryDays = true;
        } else if (newValue?.value === ICC_METHODS.ApplicabilityBased) {
            updatedState.isShowApplicabilitySection = true;
            if (state?.isApplyInventoryDays) {
                // If inventory days already applying, set default InventoryDayType
                const obj = inventoryDayTypeSelectList?.find(item => item.Value === "5");
                if (obj) {
                    updatedState.ApplicabilityBasedInventoryDayType = { label: obj.Text, value: obj.Text };
                    updatedState.isApplyInventoryDays = true;
                    setValue("ApplicabilityBasedInventoryDayType", { label: obj.Text, value: obj.Text })
                }
            } else {
                updatedState.isApplyInventoryDays = false;
            }
        }
        setState(prev => ({
            ...prev,
            ...updatedState
        }));
    };

    const inventoryDayTypeChange = (newValue) => {
        setState(prev => ({ ...prev, InventoryDayType: newValue }));
    };

    const applicabilityInventoryDayTypeChange = (newValue) => {
        console.log(newValue,'newValue')
        setState(prev => ({ ...prev, ApplicabilityBasedInventoryDayType: newValue }));
    };
    const handleChangeCreditBasePercentage = (e) => {
        const val = Number(e.target.value);
        setState(prev => ({ ...prev, CreditBasedAnnualICCPercent: val }));
    };

    function handleInventoryDayChange(e, data, ind, col){
        let val = Number(e.target.value);
        const updatedInventoryDayType = state.selectedInventoryDayType.map(item => {
            if (item.InventoryType === data?.InventoryType) {
                return { ...item, NumberOfDays: val };
            }
            return item;
        });
        setState(prev => ({ ...prev, selectedInventoryDayType: updatedInventoryDayType }));
    };
    // const handleInventoryDayChange = (e, InventoryType) => {
    //     const updatedInventoryDayType = state.selectedInventoryDayType.map(item => {
    //         if (item.InventoryType === InventoryType) {
    //             return { ...item, NumberOfDays: e.target.value };
    //         }
    //         return item;
    //     });
    //     setState(prev => ({ ...prev, selectedInventoryDayType: updatedInventoryDayType }));
    // };

    const handleAddInventory = async () => {
        const isInventoryDayTypeValid = await trigger("InventoryDayType");
        if (!isInventoryDayTypeValid) {
            return;
        }
        const newInventoryDayType = state.InventoryDayType.map(item => ({
            InventoryType: item.label,
            InventoryTypeId: item.value,
            NumberOfDays: '',
        }));

        setState(prev => ({
            ...prev,
            selectedInventoryDayType: [...prev.selectedInventoryDayType, ...newInventoryDayType],
            InventoryDayType: []
        }));
        setValue("InventoryDayType", []);
        clearErrors("InventoryDayType");
        await trigger("InventoryDayType");
    };

    const deleteInventory = (data) => {
        const updatedInventoryDayType = state.selectedInventoryDayType.filter(
            item => item.InventoryType !== data?.InventoryType
        );
        setState(prev => ({ ...prev, selectedInventoryDayType: updatedInventoryDayType }));
    };

    const onPressInventoryDays = () => {
        // const isApplicabilityBased = state?.selectedICCMethod?.label === ICC_METHODS.ApplicabilityBased;
        const isApplicabilityBased = state?.selectedICCMethod?.value === ICC_METHODS.ApplicabilityBased;
        const isInventoryChecked = !state.isApplyInventoryDays;
        let newInventoryDayType = [];
        if (isApplicabilityBased) {
            if(isInventoryChecked){
                const obj = inventoryDayTypeSelectList?.find(item => item.Value === "5");
                if (obj) {
                    newInventoryDayType = { label: obj.Text, value: obj.Text };
                    setValue("ApplicabilityBasedInventoryDayType", { label: obj.Text, value: obj.Text })
                }
            }else{
                newInventoryDayType = [];
                setValue("ApplicabilityBasedInventoryDayType", [])
            }
        }
        setState(prev => ({
            ...prev,
            isApplyInventoryDays: isInventoryChecked,
            ApplicabilityBasedInventoryDayType: newInventoryDayType
        }));
    };


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

    const wipMethodChange = (e) => {
        setState(prev => ({ ...prev, WIPMethod: e }));
    };

    const handleAddWipMethod = () => {
        let arr = [];
        state.WIPMethod.forEach((item) => {
            let obj = { InventoryType: item.label, InventoryTypeId: item?.value, NumberOfDays: 0, CreditDays: 0, InterestDays: 0 };
            arr.push(obj);
        });
        setState(prev => ({
            ...prev,
            selectedWIPMethods: [...prev.selectedWIPMethods, ...arr],
            WIPMethod: []
        }));
        setValue("WIPMethod", [])
    };

    // function handleWipInventoryDayChange(e, InventoryType) {
    //     let prevArray = [...state.selectedWIPMethods];
    //     let obj = prevArray.find((item) => item.InventoryType === InventoryType);
    //     let index = prevArray.findIndex((item) => item.InventoryType === InventoryType);
    //     obj.NumberOfDays = e.target.value;
    //     obj.InterestDays = checkForNull(e.target.value) - checkForNull(obj.CreditDays);
    //     prevArray[index] = obj;
    //     setState(prev => ({ ...prev, selectedWIPMethods: prevArray }));
    // };
    function handleWipInventoryDayChange(e, data, ind, col) {
        let val = Number(e.target.value)
        let prevArray = [...state.selectedWIPMethods];
        let obj = prevArray.find((item) => item.InventoryType === data?.InventoryType);
        let index = prevArray.findIndex((item) => item.InventoryType === data?.InventoryType);
        obj.NumberOfDays = val;
        obj.InterestDays = checkForNull(val) - checkForNull(obj.CreditDays);
        prevArray[index] = obj;
        setState(prev => ({ ...prev, selectedWIPMethods: prevArray }));
    };

    function handleSupplierDayChange(e, data, ind, col) {
        let val = Number(e.target.value)
        let prevArray = [...state.selectedWIPMethods];
        let obj = prevArray.find((item) => item.InventoryType === data?.InventoryType);
        let index = prevArray.findIndex((item) => item.InventoryType === data?.InventoryType);
        obj.CreditDays = val;
        obj.InterestDays = checkForNull(obj.NumberOfDays) - checkForNull(val);
        prevArray[index] = obj;
        setState(prev => ({ ...prev, selectedWIPMethods: prevArray }));
    };

    const deleteWIPMethod = (data) => {
        const filteredWIPMethods = state.selectedWIPMethods.filter((item) => item.InventoryType !== data?.InventoryType);
        setState(prev => ({ ...prev, selectedWIPMethods: filteredWIPMethods }));
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
                                            {state.isViewMode ? "View" : state.isEditFlag ? "Update" : "Add"} Interest Rate
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
                                        applicabilityLabel="ICC"
                                        isShowApplicabilitySection= {state.isShowApplicabilitySection}
                                    >
                                        <Row>
                                            <Col md="12">
                                                <div className="left-border">{"ICC:"}</div>
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="ICCMethod"
                                                    label="ICC Method"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    placeholder="Select"
                                                    options={renderListing("ICCMethod")}
                                                    rules={state.selectedICCMethod == null || state.selectedICCMethod.length === 0 ? { required: true } : {}}
                                                    mandatory={true}
                                                    handleChange={ICCMethodChange}
                                                    errors={errors.ICCMethod}
                                                    disabled={state.isEditFlag || state.isViewMode}
                                                    value={state.selectedICCMethod}
                                                />
                                            </Col>

                                            <Col md="2" className="st-operation mt-4 pt-2">
                                                <label id="AddInterestRate_ApplyPartCheckbox"
                                                    // className={`custom-checkbox ${(state.isEditFlag || state?.selectedICCMethod?.label === "Credit Based") ? "disabled" : ""}`}
                                                    className={`custom-checkbox ${(state.isEditFlag || state?.selectedICCMethod?.value === ICC_METHODS.CreditBased) ? "disabled" : ""}`}
                                                    onChange={onPressInventoryDays}
                                                >
                                                    Apply Inventory Days
                                                    <input
                                                        type="checkbox"
                                                        checked={state.isApplyInventoryDays}
                                                        // disabled={(state.isEditFlag || state?.selectedICCMethod?.label === "Credit Based")}
                                                        disabled={(state.isEditFlag || state?.selectedICCMethod?.value === ICC_METHODS.CreditBased)}
                                                    />
                                                    <span className="before-box" checked={state.isApplyInventoryDays} />
                                                </label>
                                            </Col>

                                            {state.selectedICCMethod?.value === ICC_METHODS.CreditBased &&
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        label={`Credit Based Annual ICC (%)`}
                                                        name={'CreditBasedAnnualICCPercent'}
                                                        Controller={Controller}
                                                        id={'credit-icc-percentage'}
                                                        control={control}
                                                        register={register}
                                                        rules={{
                                                            required: state.selectedICCMethod?.value === ICC_METHODS.CreditBased,
                                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                            max: {
                                                                value: 100,
                                                                message: 'Percentage cannot be greater than 100'
                                                            },
                                                        }}
                                                        mandatory={state.selectedICCMethod?.value === ICC_METHODS.CreditBased}
                                                        handleChange={handleChangeCreditBasePercentage}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.CreditBasedAnnualICCPercent}
                                                        disabled={state?.isViewMode}
                                                    />
                                                </Col>
                                            }

                                            {state.selectedICCMethod?.value == ICC_METHODS.ApplicabilityBased && state.isApplyInventoryDays && (
                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        name="ApplicabilityBasedInventoryDayType"
                                                        label="Inventory Day Type"
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        placeholder="Select"
                                                        options={renderListing("ApplicabilityBasedInventoryDayType")}
                                                        handleChange={applicabilityInventoryDayTypeChange}
                                                        errors={errors.ApplicabilityBasedInventoryDayType}
                                                        disabled={state.isEditFlag || state.isViewMode || (state?.selectedICCMethod?.value === ICC_METHODS.ApplicabilityBased && state?.isApplyInventoryDays)}
                                                        value={state.ApplicabilityBasedInventoryDayType}
                                                    />
                                                </Col>
                                            )}
                                        </Row>

                                        {state?.selectedICCMethod?.value == ICC_METHODS.CreditBased && (
                                            <>
                                                <Row>
                                                    <Col md="12" className="filter-block">
                                                        <div className="flex-fills mb-2 pl-0">
                                                            <h5>{"Credit Base Inventory Head:"}</h5>
                                                        </div>
                                                    </Col>

                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            name="InventoryDayType"
                                                            label="Inventory Day Types"
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            placeholder="Select"
                                                            options={renderListing("InventoryDayType")}
                                                            // rules={(!(state?.selectedInventoryDayType?.length > 0) && !state?.InventoryDayType?.length) ? { required: true } : {}}
                                                            rules={{ required: !(state?.selectedInventoryDayType?.length > 0) }}
                                                            mandatory={!(state?.selectedInventoryDayType?.length > 0)}
                                                            handleChange={inventoryDayTypeChange}
                                                            errors={errors.InventoryDayType}
                                                            // disabled={state.isEditFlag || state.isViewMode || state.editItemId}
                                                            disabled={state.isViewMode || state.editItemId}
                                                            value={state.InventoryDayType}
                                                            isMulti={true}
                                                        />
                                                    </Col>

                                                    <Col md="3">
                                                        <div className={`pt-2 mt-4 pr-0 mb-3`}>
                                                            <button id="AddFuel_AddData" type="button" className="user-btn pull-left mr10"
                                                                disabled={state.isViewMode}
                                                                onClick={handleAddInventory}>
                                                                <div className="plus"></div>ADD
                                                            </button>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md="12">

                                                      <TableRenderer
                                                        data={state.selectedInventoryDayType}
                                                        columns={Inventory_Day_Columns}
                                                        register={register}
                                                        Controller={Controller}
                                                        control={control}
                                                        errors={errors}
                                                        isViewMode={state.isViewMode}
                                                        handleDelete={deleteInventory}
                                                        setValue={setValue}
                                                      />

                                                        {/* <Table className="table border" size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>{"Inventory Day Types"}</th>
                                                                    <th>{"No. Of Days"}</th>
                                                                    <th>{"Action"}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {state.selectedInventoryDayType?.length > 0 ? (
                                                                    state.selectedInventoryDayType.map((item, index) => (
                                                                        <tr key={index}>
                                                                            <td>{item?.InventoryType}</td>
                                                                            <td>
                                                                                <TextFieldHookForm
                                                                                    label={false}
                                                                                    id={`InventoryDays${item?.InventoryType}`}
                                                                                    name={`InventoryDays${item?.InventoryType}`}
                                                                                    Controller={Controller}
                                                                                    control={control}
                                                                                    register={register}
                                                                                    // type="text"
                                                                                    rules={{
                                                                                        validate: { number, checkWhiteSpaces, maxLength7 },
                                                                                    }}
                                                                                    handleChange={(e) => handleInventoryDayChange(e, item?.InventoryType)}
                                                                                    defaultValue={item?.NumberOfDays}
                                                                                    customClassName={'withBorder mb-0 min-h-auto'}
                                                                                    className="w-auto min-h-auto"
                                                                                    errors={errors[`InventoryDays${item?.InventoryType}`]}
                                                                                    disabled={state.isViewMode}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <button className="Delete" title='Delete' type="button"
                                                                                    disabled={state.isViewMode || item?.IsAssociated}
                                                                                    onClick={() => deleteInventory(item?.InventoryType)} />
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="10"><NoContentFound title={EMPTY_DATA} /></td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </Table> */}
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md="12" className="filter-block">
                                                        <div className="flex-fills mb-2 pl-0">
                                                            <h5>{"Configure Days & Credit Terms (for WIP Heads):"}</h5>
                                                        </div>
                                                    </Col>

                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            name="WIPMethod"
                                                            label="WIP Composition Method"
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            placeholder="Select"
                                                            options={renderListing("WIPMethod")}
                                                            // rules={(!(state?.selectedWIPMethods?.length > 0) && !state?.WIPMethod?.length) ? { required: true } : {}}
                                                            rules={{ required: !(state?.selectedWIPMethods?.length > 0) }}
                                                            mandatory={!(state?.selectedWIPMethods?.length > 0)}
                                                            handleChange={wipMethodChange}
                                                            errors={errors.WIPMethod}
                                                            // disabled={state.isEditFlag || state.isViewMode || state.editItemId}
                                                            disabled={state.isViewMode || state.editItemId}
                                                            value={state.WIPMethod}
                                                            isMulti={true}
                                                        />
                                                    </Col>

                                                    <Col md="3">
                                                        <div className={`pt-2 mt-4 pr-0 mb-3`}>
                                                            <button id="AddFuel_AddData" type="button" className="user-btn pull-left mr10"
                                                                disabled={state.isViewMode}
                                                                onClick={handleAddWipMethod}>
                                                                <div className="plus"></div>ADD
                                                            </button>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md="12">
                                                      <TableRenderer
                                                        data={state.selectedWIPMethods}
                                                        columns={columns}
                                                        register={register}
                                                        Controller={Controller}
                                                        control={control}
                                                        errors={errors}
                                                        isViewMode={state.isViewMode}
                                                        handleDelete={deleteWIPMethod}
                                                        setValue={setValue}
                                                      />


                                                        {/* <Table className="table border" size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>{"WIP Head"}</th>
                                                                    <th>{"Inventory Days"}</th>
                                                                    <th>{"Supplier Credit Days"}</th>
                                                                    <th>{"Interest Days"}</th>
                                                                    <th>{"Action"}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {state.selectedWIPMethods?.length > 0 ? (
                                                                    state.selectedWIPMethods.map((item, index) => (
                                                                        <tr key={index}>
                                                                            <td>{item?.InventoryType}</td>
                                                                            <td>
                                                                                <TextFieldHookForm
                                                                                    label={false}
                                                                                    name={`WIPMethod_${item?.InventoryType}_inventoryDay`}
                                                                                    Controller={Controller}
                                                                                    control={control}
                                                                                    register={register}
                                                                                    type="text"
                                                                                    placeholder={state.isViewMode ? '-' : "Enter"}
                                                                                    rules={{
                                                                                        validate: { number, checkWhiteSpaces, maxLength7 },
                                                                                    }}
                                                                                    value={item?.NumberOfDays}
                                                                                    defaultValue={item?.NumberOfDays}
                                                                                    handleChange={(e) => handleWipInventoryDayChange(e, item?.InventoryType)}
                                                                                    customClassName={'withBorder mb-0 min-h-auto'}
                                                                                    className="w-auto min-h-auto"
                                                                                    disabled={state.isViewMode}
                                                                                    errors={errors[`WIPMethod_${item?.InventoryType}_inventoryDay`]}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextFieldHookForm
                                                                                    label={false}
                                                                                    name={`WIPMethod_${item?.InventoryType}_SupplierCreditDays`}
                                                                                    Controller={Controller}
                                                                                    control={control}
                                                                                    register={register}
                                                                                    type="text"
                                                                                    placeholder={state.isViewMode ? '-' : "Enter"}
                                                                                    value={item?.CreditDays}
                                                                                    rules={{
                                                                                        validate: { number, checkWhiteSpaces, maxLength7 },
                                                                                    }}
                                                                                    defaultValue={item?.CreditDays}
                                                                                    handleChange={(e) => handleSupplierDayChange(e, item?.InventoryType)}
                                                                                    customClassName={'withBorder mb-0 min-h-auto'}
                                                                                    className="w-auto min-h-auto"
                                                                                    disabled={state.isViewMode}
                                                                                    errors={errors[`WIPMethod_${item?.InventoryType}_SupplierCreditDays`]}
                                                                                />
                                                                            </td>
                                                                            <td>{item?.InterestDays ?? "-"}</td>
                                                                            <td>
                                                                                <button className="Delete" title='Delete' type="button"
                                                                                    disabled={state.isViewMode || item?.IsAssociated}
                                                                                    onClick={() => deleteWIPMethod(item?.InventoryType)} />
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="10"><NoContentFound title={EMPTY_DATA} /></td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </Table> */}



                                                    </Col>
                                                </Row>
                                            </>
                                        )}

                                    </AddOverheadMasterDetails>

                                    {/* <Row>
                                        <Col md="12">
                                            <div className="left-border">{"Payment Terms:"}</div>
                                        </Col>
                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                name="PaymentTermsApplicability"
                                                label="Payment Terms Applicability"
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                placeholder={state.isViewMode ? '-' : "Select"}
                                                options={renderListing("PaymentTerms")}
                                                handleChange={handlePaymentApplicability}
                                                errors={errors.PaymentTermsApplicability}
                                                disabled={state.isViewMode}
                                                value={state.PaymentTermsApplicability}
                                            />
                                        </Col>
                                        {state.PaymentTermsApplicability.label !== 'Fixed' && (
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
                                                                validate: {
                                                                    postiveNumber: value => !value || postiveNumber(value),
                                                                    maxLength10: value => !value || maxLength10(value),
                                                                    nonZero: value => !value || nonZero(value),
                                                                    number: value => !value || number(value)
                                                                }
                                                            }}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            errors={errors.RepaymentPeriod}
                                                        />
                                                </Col>
                                                <Col md="3">
                                                        <TextFieldHookForm
                                                            name="PaymentTermPercent"
                                                            label="Payment Term (%)"
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            type="text"
                                                            placeholder={state.isViewMode ? '-' : "Enter"}
                                                            value={state.PaymentTermPercent}
                                                            handleChange={(e) => handleChangePaymentTermPercentage(e.target.value)}
                                                            disabled={state.isViewMode}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            rules={{
                                                                validate: {
                                                                    number: value => !value || number(value),
                                                                    maxPercentValue: value => !value || maxPercentValue(value),
                                                                    checkWhiteSpaces: value => !value || checkWhiteSpaces(value),
                                                                    percentageLimitValidation: value => !value || percentageLimitValidation(value),
                                                                    nonZero: value => !value || nonZero(value)
                                                                }
                                                            }}
                                                            errors={errors.PaymentTermPercent}
                                                        />
                                                </Col>
                                            </>
                                        )}
                                    </Row> */}
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

export default AddInterestRate; 


