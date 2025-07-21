import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Table, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, fetchRejectionDataFromMaster, filterApplicabilityDetails, getConfigurationKey, removeBOPfromApplicability } from '../../../../../helper';
//MINDA
// import { removeBOPFromList } from '../../../../../helper';
import { fetchApplicabilityList, fetchCostingHeadsAPI, fetchModelTypeAPI } from '../../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { getRejectionDataByModelType, isOverheadProfitDataChange, setOverheadProfitErrors, setPlasticArray, setRejectionRecoveryData } from '../../../actions/Costing';
import { CASTING_NORM, IdForMultiTechnology, REMARKMAXLENGTH, Ferrous_Casting, DIE_CASTING } from '../../../../../config/masterData';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';
import { number, percentageLimitValidation, isNumber, checkWhiteSpaces, NoSignNoDecimalMessage, nonZero, decimalAndNumberValidation, positiveAndDecimalNumber, maxLength10, decimalLengthsix } from "../../../../../helper/validation";
import { CBCTypeId, CRMHeads, EMPTY_DATA, EMPTY_GUID, NFRTypeId, REJECTIONMASTER, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import Popup from 'reactjs-popup';
import Toaster from '../../../../common/Toaster';
import Button from '../../../../layout/Button';
import AddRejectionRecovery from './AddRejectionRecovery';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { getCostingConditionTypes } from '../../../../common/CommonFunctions';
import NoContentFound from '../../../../common/NoContentFound';
import TooltipCustom from '../../../../common/Tooltip';
import _ from 'lodash';


let counter = 0;
function Rejection(props) {
    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingRejectionDetail, clearErrors } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const applicabilityList = useSelector(state => state.comman.applicabilityList)
    const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
    const rejectionObject = (CostingRejectionDetail?.CostingRejectionApplicabilityDetails && CostingRejectionDetail?.CostingRejectionApplicabilityDetails[0]) ?? []
    const [applicability, setApplicability] = useState(rejectionObject ? { label: rejectionObject?.Applicability, value: rejectionObject?.ApplicabilityId } : [])
    const [storedApplicability, setStoredApplicability] = useState(rejectionObject ? { label: rejectionObject?.Applicability, value: rejectionObject?.ApplicabilityId } : [])
    const [IsChangedApplicability, setIsChangedApplicability] = useState(false)
    const [showRejectionPopup, setShowRejectionPopup] = useState(false)
    const [percentageLimit, setPercentageLimit] = useState(false)
    const { IsIncludedSurfaceInRejection, isBreakupBoughtOutPartCostingFromAPI, IsIncludeApplicabilityForChildParts } = useSelector(state => state.costing)
    const { SurfaceTabData, rejectionRecovery, RMCCTabData, CostingEffectiveDate } = useSelector(state => state.costing)
    const { CostingPartDetails, PartType } = RMCCTabData?.[0]
    const [errorMessage, setErrorMessage] = useState('')
    const [isOpenRecoveryDrawer, setIsOpenRecoveryDrawer] = useState(false);
    const conditionTypeId = getCostingConditionTypes(REJECTIONMASTER);
    const [state, setState] = useState({
        gridData: CostingRejectionDetail?.CostingRejectionApplicabilityDetails ?? [],
        isEdit: false,
        editIndex: null,
        modelType: (data?.CostingPartDetails && data?.CostingPartDetails.RejectionModelType !== null) ? { label: data?.CostingPartDetails?.RejectionModelType, value: data?.CostingPartDetails?.RejectionModelTypeId } : [],
        modelTypeList: [],
        rejectionTotalCost: '',
        netRejectionCost: '',
        rejectionRecoveryCost: '',
        rejectionCost: '',
        rejectionRecoveryDetails: {},
        isEditMode: false,
        isViewRejectionRecovery: false
    })
    // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
    const isFixedRecord = CostingRejectionDetail?.CostingRejectionApplicabilityDetails?.some(item => item?.Applicability === 'Fixed')
    const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId || (costData?.PartType === 'Assembly' && IsMultiVendorCosting))
    const dispatch = useDispatch()

    // Function to generate casting norm formula tooltip for both individual parts and assembly
    const getCastingNormFormulaTooltip = () => {
        let tooltipText = ""
        if (partType) {
            tooltipText = `This cost includes all casting parts used in the assembly, calculated as (Gross Weight - Casting Weight) × RM Rate per Kg`
        } else if (costData?.PartType === "Assembly") {
            tooltipText = `This cost includes all parts used in the assembly, calculated as (Gross Weight - Casting Weight) × RM Rate per Kg`
        } else {
            tooltipText = `(Gross Weight- Casting Weight) × RM Rate Per Kg`
        }
        return {
            tooltipText,
            width: '350px'
        };
    };

    const shouldShowCastingNorm = () => {
        // Show casting norm only for ferrous casting and die casting technologies
        const isFerrousOrDieCasting = Number(costData?.TechnologyId) === Number(Ferrous_Casting) || Number(costData?.TechnologyId) === Number(DIE_CASTING) || partType;

        // If partType is false, show casting norm only for ferrous/die casting
        // If partType is true, show only when IsIncludeApplicabilityForChildParts is true AND it's ferrous/die casting

        return isFerrousOrDieCasting 
        // && (!partType || IsIncludeApplicabilityForChildParts);
    };

    // Common utility function to filter Casting Norm applicability
    const filterCastingNormApplicability = (items, textKey = 'Text', applicabilityKey = 'Applicability') => {
        return items.filter(item => {
            const applicabilityText = textKey === 'Text' ? item[textKey] : item[applicabilityKey];
            if (applicabilityText === 'Casting Norm') {
                return shouldShowCastingNorm();
            }
            return true;
        });
    };

    const rejectionFieldValues = useWatch({
        control,
        name: ['RejectionPercentage', 'Applicability'],
    });

    useEffect(() => {
        if (applicability && applicability?.value !== undefined && !CostingViewMode) {
            setApplicability(applicability)
            // checkRejectionModelType(applicability.label)
        }

    }, [headerCosts && headerCosts.NetTotalRMBOPCC, applicability])


    useEffect(() => {
        const isRequestForMultiTechnology = IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData?.PartType === 'Assembly' && IsMultiVendorCosting)
        dispatch(fetchApplicabilityList(null, conditionTypeId, isRequestForMultiTechnology, res => { }));
        if (fetchRejectionDataFromMaster()) {
            dispatch(fetchModelTypeAPI('rejection', (res) => {
                let temp = [];
                res?.data?.SelectList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value });
                    return null;
                });
                setState(prev => ({
                    ...prev,
                    modelTypeList: temp
                }));
            }))
        }
        setValue('crmHeadRejection', rejectionObj && rejectionObj?.RejectionCRMHead && { label: rejectionObj?.RejectionCRMHead, value: 1 })
        setValue('rejectionRemark', rejectionObj && rejectionObj?.Remark ? rejectionObj?.Remark : '')
        const rmApplicability = CostingRejectionDetail?.CostingRejectionApplicabilityDetails?.find(item => item.Applicability === 'RM');
        dispatch(setRejectionRecoveryData(rmApplicability?.CostingRejectionRecoveryDetails ?? rejectionRecovery));
    }, [])
    useEffect(() => {
        if (!CostingViewMode) {
            checkRejectionApplicability(applicability.label)
        }
    }, [rejectionFieldValues, IsIncludedSurfaceInRejection]);
    useEffect(() => {
        if (state.modelType && state.modelType.value !== undefined && !CostingViewMode) {
            checkRejectionModelType(CostingRejectionDetail)
        }
    }, [headerCosts && headerCosts.NetTotalRMBOPCC, IsIncludedSurfaceInRejection])



    useEffect(() => {
        if (!CostingViewMode) {
            // checkRejectionModelType(applicability.label)
        }
    }, [IsIncludedSurfaceInRejection]);
    useEffect(() => {
        callGetRejectionDataByModelType(state?.modelType)
    }, [IsIncludeApplicabilityForChildParts, IsIncludedSurfaceInRejection])

    // useEffect(() => {
    //     setValue('NetRejectionCost', checkForDecimalAndNull(rejectionObj?.RejectionTotalCost - checkForNull(rejectionRecovery.RejectionRecoveryNetCost), initialConfiguration?.NoOfDecimalForPrice))
    //     setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecovery.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice))
    //     
    //     setState(prev => ({
    //         ...prev,
    //         gridData: rejectionObj?.CostingRejectionApplicabilityDetails
    //     }))
    // }, [rejectionObj, rejectionRecovery.RejectionRecoveryNetCost])


    useEffect(() => {
        setTimeout(() => {
            let tempObj = {
                "RejectionId": rejectionObj?.RejectionId ?? null,
                "RejectionDetailId": rejectionObj?.RejectionDetailId ?? null,
                "RejectionCRMHead": getValues('crmHeadRejection') ? getValues('crmHeadRejection').label : '',
                "Remark": rejectionObj?.Remark ? rejectionObj?.Remark : '',
                "CostingRejectionApplicabilityDetails": (partType ? filterApplicabilityDetails(state.gridData, IsIncludeApplicabilityForChildParts) : state.gridData),
            }

            if (!CostingViewMode) {
                props.setRejectionDetail({ RejectionObj: tempObj, modelType: state.modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)
    }, [rejectionObj, rejectionRecovery, state.gridData])


    /**
 * @method renderListing
 * @description RENDER LISTING (NEED TO BREAK THIS)
 */
    const renderListing = (label) => {
        const temp = [];
        let tempList = [];
        if (label === 'Applicability') {
            applicabilityList && applicabilityList.map(item => {
                if (item.Value === '0') return false;

                // Filter "Casting Norm" based on conditions
                if (item.Text === 'Casting Norm') {
                    // Show "Casting Norm" only when partType is true (multi-vendor case) AND IsIncludeApplicabilityForChildParts is true
                    if (shouldShowCastingNorm()) {
                        temp.push({ label: item?.Text, value: item?.Value });
                    }
                } else {
                    temp.push({ label: item?.Text, value: item?.Value });
                }
                return null;
            });
            tempList = [...temp]
            return tempList;
        }
    }

    if (Object.keys(errors).length > 0 && counter < 2) {
        dispatch(setOverheadProfitErrors(errors))
        counter++;
    } else if (Object.keys(errors).length === 0 && counter > 0) {
        dispatch(setOverheadProfitErrors({}))
        counter = 0
    }
    const getRejectionBaseCost = (applicability, data, headerCosts, includeChildParts, SurfaceTabData) => {
        const child = data?.CostingPartDetails || {};
        const header = headerCosts || {};
        const surface = SurfaceTabData?.[0]?.CostingPartDetails;
    
        const baseCosts = {
            'RM': includeChildParts ? checkForNull(child?.NetChildPartsRawMaterialsCost) : checkForNull(header?.NetRawMaterialsCost),
            'BOP': includeChildParts ? checkForNull(child?.NetChildPartsBoughtOutPartCost) + checkForNull(header?.NetBoughtOutPartCost) : checkForNull(header?.NetBoughtOutPartCost),
            'BOP Domestic': includeChildParts ? checkForNull(child?.NetChildPartsBOPDomesticCost) + checkForNull(header?.NetBOPDomesticCost) : checkForNull(header?.NetBOPDomesticCost),
            'BOP CKD': includeChildParts ? checkForNull(child?.NetChildPartsBOPImportCost) + checkForNull(header?.NetBOPImportCost) : checkForNull(header?.NetBOPImportCost),
            'BOP V2V': includeChildParts ? checkForNull(child?.NetChildPartsBOPSourceCost) + checkForNull(header?.NetBOPSourceCost) : checkForNull(header?.NetBOPSourceCost),
            'BOP OSP': includeChildParts ? checkForNull(child?.NetChildPartsBOPOutsourcedCost) + checkForNull(header?.NetBOPOutsourcedCost) : checkForNull(header?.NetBOPOutsourcedCost),
            'BOP Without Handling Charge': includeChildParts ? checkForNull(child?.NetChildPartsBoughtOutPartCostWithOutHandlingCharge) + checkForNull(header?.NetBoughtOutPartCostWithOutHandlingCharge) : checkForNull(header?.NetBoughtOutPartCostWithOutHandlingCharge),
            'BOP Domestic Without Handling Charge': includeChildParts ? checkForNull(child?.NetChildPartsBOPDomesticCostWithOutHandlingCharge) + checkForNull(header?.NetBOPDomesticCostWithOutHandlingCharge) : checkForNull(header?.NetBOPDomesticCostWithOutHandlingCharge),
            'BOP CKD Without Handling Charge': includeChildParts ? checkForNull(child?.NetChildPartsBOPImportCostWithOutHandlingCharge) + checkForNull(header?.NetBOPImportCostWithOutHandlingCharge) : checkForNull(header?.NetBOPImportCostWithOutHandlingCharge),
            'BOP V2V Without Handling Charge': includeChildParts ? checkForNull(child?.NetChildPartsBOPSourceCostWithOutHandlingCharge) + checkForNull(header?.NetBOPSourceCostWithOutHandlingCharge) : checkForNull(header?.NetBOPSourceCostWithOutHandlingCharge),
            'BOP OSP Without Handling Charge': includeChildParts ? checkForNull(child?.NetChildPartsBOPOutsourcedCostWithOutHandlingCharge) + checkForNull(header?.NetBOPOutsourcedCostWithOutHandlingCharge) : checkForNull(header?.NetBOPOutsourcedCostWithOutHandlingCharge),
            'CCForMachining': includeChildParts ? checkForNull(header?.NetCCForOtherTechnologyCost) + checkForNull(child?.NetChildPartsCCForOtherTechnologyCost) : checkForNull(header?.NetCCForOtherTechnologyCost),
            'Casting Norm': checkForNull(child?.NetCastingNormApplicabilityCost),
            'Surface Treatment': checkForNull(surface?.NetSurfaceTreatmentCost),
            'Labour Cost': checkForNull(header?.TotalLabourCost),
            'CC': includeChildParts
                ? checkForNull(child?.NetChildPartsOperationCostForRejection)
                  + checkForNull(child?.NetChildPartsProcessCostForRejection)
                  + checkForNull(child?.NetChildPartsWeldingCostForRejection)
                  - checkForNull(child?.NetChildPartsCCForOtherTechnologyCostForRejection)
                  + checkForNull(header?.NetProcessCostForRejection)
                  + checkForNull(header?.NetOperationCostForRejection)
                  + checkForNull(header?.NetWeldingCostForRejection)
                  - checkForNull(header?.NetCCForOtherTechnologyCostForRejection)
                : checkForNull(header?.NetProcessCostForRejection)
                  + checkForNull(header?.NetOperationCostForRejection)
                  + checkForNull(header?.NetWeldingCostForRejection)
                  - checkForNull(header?.NetCCForOtherTechnologyCostForRejection),
        };
        return baseCosts[applicability] ?? 0;
    };

    /**
      * @method checkRejectionModelType
      * @description REJECTION APPLICABILITY CALCULATION
      */
    const checkRejectionModelType = (dataObj) => {
        const { data } = props
        let prevData = _.cloneDeep(dataObj)
        let newData = [];
        if (!IsIncludedSurfaceInRejection && prevData?.CostingRejectionApplicabilityDetails) {
            prevData.CostingRejectionApplicabilityDetails = prevData?.CostingRejectionApplicabilityDetails?.filter(item => item?.Applicability !== "Surface Treatment");
        }

        if (prevData?.CostingRejectionApplicabilityDetails) {
            prevData.CostingRejectionApplicabilityDetails = filterCastingNormApplicability(prevData?.CostingRejectionApplicabilityDetails, null, 'Applicability');
        }

        if (prevData && prevData?.CostingRejectionApplicabilityDetails && prevData?.CostingRejectionApplicabilityDetails?.length > 0) {
            newData = prevData?.CostingRejectionApplicabilityDetails?.map((item) => {
                const cost = getRejectionBaseCost(item?.Applicability, data, headerCosts, IsIncludeApplicabilityForChildParts, SurfaceTabData);
                const totalCost = cost * calculatePercentage(item?.Percentage);
            
                return {
                    ...item,
                    Cost: cost,
                    TotalCost: totalCost,
                    NetCost: totalCost,
                };
            });
            
            setState(prev => ({
                ...prev,
                gridData: newData,
            }));
            
            dispatch(isOverheadProfitDataChange(true));
        }
    };
    const checkRejectionApplicability = (applicability) => {
        const cost = getRejectionBaseCost(applicability, data, headerCosts, IsIncludeApplicabilityForChildParts, SurfaceTabData);
        const percentage = getValues('RejectionPercentage');
        const totalCost = applicability === "Fixed"
            ? checkForNull(getValues('RejectionPercentage'))
            : cost * calculatePercentage(percentage);
        
        setValue('RejectionCost', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice));
        setValue('RejectionTotalCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice));
        setValue('NetRejectionCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice));
        
        setState(prev => ({
            ...prev,
            rejectionCost: cost,
            rejectionTotalCost: totalCost,
            netRejectionCost: totalCost,
        }));
    }
    const handleChangeRejectionPercentage = (event) => {
        let message = ''
        if (decimalAndNumberValidationBoolean(event.target.value)) {
            setPercentageLimit(true)
            message = MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE
        } if (!isNumber(event.target.value)) {
            setPercentageLimit(true)
            message = NoSignNoDecimalMessage
        }
        setErrorMessage(message)
        dispatch(isOverheadProfitDataChange(true))
    }

    const calculateRecoveryCost = (rejectionPercentage, recoveryPerantage) => {
        const EffectiveRecovery = checkForNull(rejectionPercentage) * checkForNull(recoveryPerantage) / 100
        let CostApplicability = 0
        CostingPartDetails && CostingPartDetails?.CostingRawMaterialsCost?.map(item => {
            CostApplicability += checkForNull(item.ScrapRate) * checkForNull(item.FinishWeight)
        })
        const rejectionRecoveryCost = checkForNull(CostApplicability) * EffectiveRecovery / 100
        setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecoveryCost, initialConfiguration?.NoOfDecimalForPrice))
        dispatch(setRejectionRecoveryData({
            ...rejectionRecovery,
            EffectiveRecoveryPercentage: EffectiveRecovery,
            RejectionRecoveryNetCost: rejectionRecoveryCost
        }))
    }
    const handleRejectionPercentageChangeRef = (newValue) => {
        if (newValue && newValue !== '') {
            setValue('RejectionPercentage', '')
            setApplicability(newValue)
            setStoredApplicability(newValue)
            checkRejectionApplicability(newValue.label)
            setIsChangedApplicability(!IsChangedApplicability)
            clearErrors()
        } else {
            setApplicability([])
            checkRejectionModelType('')
            dispatch(isOverheadProfitDataChange(true))
            setValue('RejectionPercentage', '')
            setValue('RejectionCost', '')
            setValue('Applicability', '')
            setValue('RejectionTotalCost', '')
            setRejectionObj({})
        }
        setPercentageLimit(false)
        dispatch(isOverheadProfitDataChange(true))
    }
    /**
      * @method handleApplicabilityChange
      * @description  USED TO HANDLE APPLICABILITY CHANGE FOR REJECTION
      */
    const handleApplicabilityChange = (newValue) => {
        const { ApplicabilityType } = rejectionRecovery
        if (newValue && !newValue.label.includes('RM') && ((ApplicabilityType && ApplicabilityType !== ''))) {
            setApplicability(newValue ?? {})
            // setShowRejectionPopup(true)
            checkRejectionApplicability(newValue.label)
        } else {
            handleRejectionPercentageChangeRef(newValue)
            if (newValue === null) {
                dispatch(setRejectionRecoveryData({}))
            }
        }

    }
    const onPopupConfirm = () => {
        setShowRejectionPopup(false)
        handleRejectionPercentageChangeRef(applicability)
        setStoredApplicability(applicability)
        dispatch(setRejectionRecoveryData({}))

    }
    const closePopUp = () => {
        setShowRejectionPopup(false)
        setApplicability(storedApplicability)
        setValue('Applicability', storedApplicability)
    }
    const handleCrmHeadChange = (e) => {
        if (e) {
            setRejectionObj({
                ...rejectionObj,
                RejectionCRMHead: e?.label
            })
        }
    }

    const onRemarkPopUpClickRejection = () => {

        if (errors.rejectionRemark !== undefined) {
            return false
        }

        setRejectionObj({
            ...rejectionObj,
            Remark: getValues('rejectionRemark')
        })

        if (getValues(`rejectionRemark`)) {
            Toaster.success('Remark saved successfully')
        }
        var button = document.getElementById(`popUpTriggerRejection`)
        button.click()
    }

    const onRemarkPopUpCloseRejection = () => {
        let button = document.getElementById(`popUpTriggerRejection`)
        setValue(`rejectionRemark`, rejectionObj?.Remark)
        if (errors.rejectionRemark) {
            delete errors.rejectionRemark;
        }
        button.click()
    }
    const handleRejectionRecovery = (isFromMaster) => {
        // if (PartType !== 'Assembly' && !(applicability && applicability.label && applicability.label.includes('RM'))) {
        //     Toaster.warning('Applicability should be RM')isOpenRecoveryDrawer
        //     return false
        // } else
        if (isFromMaster && !fetchRejectionDataFromMaster()) {
            setState(prev => ({
                ...prev,
                isViewRejectionRecovery: true
            }));
        } else {
            setState(prev => ({
                ...prev,
                isViewRejectionRecovery: false
            }));
        }
        if (!isFromMaster && PartType !== 'Assembly' && !getValues('RejectionPercentage')) {
            Toaster.warning('Enter the Rejection Percentage')
            return false
        } else {
            setIsOpenRecoveryDrawer(!isOpenRecoveryDrawer)
        }
    }
    const closeDrawer = (type, cost, rejectionRecoveryObj) => {
        if (type === 'cancel') {
            setIsOpenRecoveryDrawer(false);
        } else if (type === 'submit') {
            setIsOpenRecoveryDrawer(false);
            const isDataFetched = fetchRejectionDataFromMaster();

            if (isDataFetched) {
                // Clone to avoid mutation
                const dataCopy = _.cloneDeep(state.gridData);

                const updatedGridData = dataCopy.map(item => {
                    if (item.Applicability === 'RM') {
                        return {
                            ...item,
                            NetCost: Number(item.TotalCost) - Number(cost),
                            IsRejectionRecoveryApplicable: true,
                            CostingRejectionRecoveryDetails: rejectionRecoveryObj ?? {}
                        };
                    }
                    return item;
                });

                setState(prev => ({
                    ...prev,
                    gridData: updatedGridData,
                    rejectionRecoveryDetails: rejectionRecoveryObj
                }));
            } else {
                let netRejectionCost = checkForNull(state.rejectionTotalCost) - checkForNull(cost)
                setValue('RejectionRecovery', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice));
                setValue('NetRejectionCost', checkForDecimalAndNull(netRejectionCost, initialConfiguration?.NoOfDecimalForPrice))
                setState(prev => ({
                    ...prev,
                    rejectionRecoveryCost: cost,
                    netRejectionCost: netRejectionCost,
                    rejectionRecoveryDetails: rejectionRecoveryObj
                }))
            }
            dispatch(setRejectionRecoveryData(rejectionRecoveryObj))
        }
    };

    const viewAddButtonIcon = (data, type) => {

        let className = ''
        let title = ''
        if (data.length !== 0 || CostingViewMode) {
            className = 'view-icon-primary'
            title = 'View'
        } else {
            className = 'plus-icon-square'
            title = 'Add'
        }
        if (type === "className") {
            return className
        } else if (type === "title") {
            return title
        }
    }
    // const RejectionRecoveryUI = useMemo(() => {
    //     setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecovery.rejectionRecoveryCost, initialConfiguration?.NoOfDecimalForPrice))
    //     return <div className='d-flex align-items-center'>
    //         <TextFieldHookForm
    //             label={false}
    //             name={'RejectionRecovery'}
    //             Controller={Controller}
    //             control={control}
    //             register={register}
    //             mandatory={false}
    //             rules={{}}
    //             handleChange={() => { }}
    //             defaultValue={''}
    //             className=""
    //             customClassName={'withBorder w-100'}
    //             errors={errors.RejectionRecovery}
    //             disabled={true}
    //         />
    //         <Button
    //             id="tabDiscount_otherCost"
    //             onClick={() => handleRejectionRecovery()}
    //             className={"right mb-4 ml-0"}
    //             variant={viewAddButtonIcon([], "className")}
    //             title={viewAddButtonIcon([], "title")}
    //         />
    //     </div>
    // }, [applicability, rejectionRecovery.rejectionRecoveryCost])
    const resetData = () => {
        setValue('Applicability', '')
        setValue('RejectionPercentage', '')
        setValue('RejectionCost', '')
        setValue('RejectionTotalCost', '')
        setValue('RejectionRecovery', '')
        setValue('NetRejectionCost', '')
        setState(prev => ({
            ...prev,
            rejectionCost: '',
            rejectionTotalCost: '',
            netRejectionCost: '',
            editIndex: null,
            isEditMode: false,
        }))
        setApplicability([])
        dispatch(setRejectionRecoveryData({}))
    }
    const editDeleteData = (indexValue, type) => {
        if (type === 'delete') {
            let temp = [] // Create an empty array to hold the updated data
            state.gridData && state.gridData.map((item, index) => {
                if (index !== indexValue) { // If the index being iterated over is not the same as the index to delete, add the item to the temp array
                    temp.push(item)
                }
            })
            setState(prev => ({
                ...prev,
                gridData: temp
            }))
            resetData()
        }
        if (type === 'edit') {
            setState(prev => ({
                ...prev,
                isEditMode: true,
                editIndex: indexValue
            }))

            // Retrieve the data at the specified index from the tableData array, and set the values of various form fields based on the data.
            let Data = state.gridData[indexValue]
            setValue('Applicability', { label: Data.Applicability, value: Data.Applicability })
            setValue('RejectionPercentage', checkForDecimalAndNull(Data.Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('RejectionCost', checkForDecimalAndNull(Data.Cost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('RejectionTotalCost', checkForDecimalAndNull(Data.TotalCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('NetRejectionCost', checkForDecimalAndNull(Data.NetCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('RejectionRecovery', checkForDecimalAndNull(Data.CostingRejectionRecoveryDetails?.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, ApplicabilityCost: Data?.ApplicabilityCost }));
            setApplicability({ label: Data?.Applicability, value: Data?.ApplicabilityId })
            dispatch(setRejectionRecoveryData({
                ...rejectionRecovery,
                ...Data?.CostingRejectionRecoveryDetails
            }))
        }
    }
    const addTableData = () => {
        if (!applicability || !state.netRejectionCost) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        let obj = {
            "CostingRejectionRecoveryDetails": state.rejectionRecoveryDetails ?? null,
            "ApplicabilityDetailsId": null,
            "ApplicabilityId": applicability?.value,
            "Applicability": applicability?.label,
            "Percentage": getValues('RejectionPercentage') ?? null,
            "Cost": state.rejectionCost ?? null,
            "TotalCost": state.rejectionTotalCost,
            "NetCost": state.netRejectionCost,
            "IsRejectionRecoveryApplicable": state.rejectionRecoveryDetails?.RejectionRecoveryNetCost ? true : false
        }

        let isDuplicate = false;
        state.gridData.map((item, index) => {
            if (index !== state.editIndex) {
                if (item?.Applicability === obj?.Applicability) {
                    isDuplicate = true;
                }
            }
            return null;
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        if (state.isEditMode) {
            const updatedGridData = [...state.gridData];
            updatedGridData[state.editIndex] = obj;
            setState(prev => ({
                ...prev,
                gridData: updatedGridData
            }));
        } else {
            setState(prev => ({
                ...prev,
                gridData: [...state.gridData, obj]
            }));
        }
        resetData();
    }
    const callGetRejectionDataByModelType = (modelTypeValues) => {
        if (modelTypeValues && modelTypeValues !== '' && modelTypeValues.value !== undefined) {

            const reqParams = {
                ModelTypeId: modelTypeValues.value,
                VendorId: (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? costData.VendorId : null,
                costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
                EffectiveDate: CostingEffectiveDate,
                plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) || (costData?.CostingTypeId === NFRTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
                customerId: costData.CustomerId,
                technologyId: IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData?.PartType === 'Assembly' && IsMultiVendorCosting) ? costData?.TechnologyId : null,
                partFamilyId: costData?.PartFamilyId,
                IsMultiVendorCosting: IsMultiVendorCosting
            }
            dispatch(getRejectionDataByModelType(reqParams, (res) => {
                let data = res?.data?.Data?.CostingRejectionDetail
                if (data) {
                    setRejectionObj(data)
                    if (!CostingViewMode) {
                        setTimeout(() => {
                            checkRejectionModelType(data)
                        }, 500);
                    }
                } else {
                    setState(prev => ({
                        ...prev,
                        gridData: []
                    }))
                    setRejectionObj({})
                }
            }))
        }
    }
    const handleModelTypeChange = (ModelTypeValues, IsDropdownClicked) => {
        setState(prev => ({
            ...prev,
            modelType: ModelTypeValues
        }))
        if (ModelTypeValues && ModelTypeValues !== '' && ModelTypeValues.value !== undefined) {
            callGetRejectionDataByModelType(ModelTypeValues)
        } else {
            setState(prev => ({
                ...prev,
                modelType: [],
                gridData: []
            }))
        }
    }
    return (
        <>
            <Row>
                <Col md="12" className="pt-3">
                    <div className="left-border">
                        {'Rejection:'}
                    </div>
                </Col>
                {fetchRejectionDataFromMaster() && <Col md="3">
                    <SearchableSelectHookForm
                        label={'Model Type for Rejection'}
                        name={'ModelTypeRejection'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={state.modelType?.length !== 0 ? state.modelType : ''}
                        options={state.modelTypeList}
                        mandatory={false}
                        disabled={CostingViewMode ? true : false}
                        handleChange={(ModelTypeValues) => {
                            handleModelTypeChange(ModelTypeValues, true)
                        }}
                        errors={errors.ModelTypeRejection}
                        isClearable={true}
                    />
                </Col>}
                {initialConfiguration?.IsShowCRMHead && <Col md="3">
                    <SearchableSelectHookForm
                        name={`crmHeadRejection`}
                        type="text"
                        label="CRM Head"
                        errors={errors.crmHeadRejection}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            required: false,
                        }}
                        placeholder={'Select'}
                        options={CRMHeads}
                        required={false}
                        handleChange={handleCrmHeadChange}
                        disabled={CostingViewMode}
                    />
                </Col>}

            </Row>
            <Row>
                {!fetchRejectionDataFromMaster() && <Row className=" costing-border-with-labels pt-3 m-0 overhead-profit-tab-costing w-100">
                    <Col md="2">
                        <SearchableSelectHookForm
                            label={'Applicability'}
                            name={'Applicability'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={applicability.length !== 0 ? applicability : ''}
                            options={renderListing('Applicability')}
                            mandatory={false}
                            disabled={CostingViewMode ? true : false}
                            handleChange={handleApplicabilityChange}
                            errors={errors.Applicability}
                            isClearable={true}
                        />
                    </Col>
                    <Col md="2">
                        {applicability.label !== 'Fixed' ?
                            <TextFieldHookForm
                                label={`Rejection (%)`}
                                name={'RejectionPercentage'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                    required: false,
                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                    max: {
                                        value: 100,
                                        message: 'Percentage cannot be greater than 100'
                                    },
                                }}
                                handleChange={(e) => {
                                    calculateRecoveryCost(e.target.value, rejectionRecovery.Value)
                                    dispatch(isOverheadProfitDataChange(true))
                                }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RejectionPercentage}
                                disabled={CostingViewMode ? true : false}
                            />
                            :
                            //THIS FIELD WILL RENDER WHEN REJECTION TYPE FIXED
                            <div className='p-relative error-wrapper'>
                                <TextFieldHookForm
                                    label={'Rejection'}
                                    name={'RejectionPercentage'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                    }}
                                    handleChange={(e) => handleChangeRejectionPercentage(e)}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    disabled={CostingViewMode ? true : false}
                                />
                                {applicability.label === 'Fixed' && percentageLimit && <WarningMessage dClass={"error-message fixed-error"} message={errorMessage} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                            </div>}
                    </Col>
                    {applicability.label !== 'Fixed' &&
                        <Col md="2">
                            <TextFieldHookForm
                                label={'Rejection Cost'}
                                name={'RejectionCost'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RejectionCost}
                                disabled={true}
                            />
                        </Col>}
                    {applicability.label !== 'Fixed' && <Col>
                        <TextFieldHookForm
                            label={'Rejection'}
                            name={'RejectionTotalCost'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.RejectionTotalCost}
                            disabled={true}
                        />
                    </Col>}
                    {getConfigurationKey().IsRejectionRecoveryApplicable && applicability.label === 'RM' && <Col md="2">
                        {/* {RejectionRecoveryUI} */}
                        <div className='d-flex align-items-center'>
                            <TextFieldHookForm
                                label={'Rejection Recovery Cost'}
                                name={'RejectionRecovery'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{}}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder mr-2'}
                                errors={errors.RejectionRecovery}
                                disabled={true}
                            />
                            <Button
                                id="tabDiscount_otherCost"
                                onClick={() => handleRejectionRecovery(false)}
                                className={"right mb-0 ml-0"}
                                variant={viewAddButtonIcon([], "className")}
                                title={viewAddButtonIcon([], "title")}
                            />
                        </div>
                    </Col>}
                    <Col md="2">
                        <TextFieldHookForm
                            label={'Net Rejection'}
                            name={'NetRejectionCost'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className="w-auto"
                            customClassName={'withBorder'}
                            errors={errors.NetRejectionCost}
                            disabled={true}
                        />
                    </Col>
                    <Col md="2">
                        <div className="d-flex align-items-center h-100">
                            <button
                                type="submit"
                                className={"user-btn pull-left mt-1 mr10"}
                                disabled={CostingViewMode}
                                onClick={() => addTableData()}
                            >
                                <div className={"plus"}></div> ADD
                            </button>
                            <button
                                type="button"
                                className={"reset-btn pull-left mt-1 ml5"}
                                onClick={() => resetData()}
                                disabled={CostingViewMode}
                            >
                                RESET
                            </button>
                        </div>
                    </Col>
                </Row>}

                <Col md="12">
                    <Table className="table mb-0 forging-cal-table mt-2" size="sm">
                        <thead>
                            <tr>
                                <th>Applicability</th>
                                <th>Rejection (%)</th>
                                <th>Cost (Applicability)</th>
                                <th>Rejection</th>
                                {(!IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData?.PartType === 'Assembly' && !IsMultiVendorCosting)) && getConfigurationKey().IsRejectionRecoveryApplicable && applicability.label === 'RM' && <th>Rejection Recovery Cost</th>}
                                <th>Net Rejection</th>
                                {!CostingViewMode && !fetchRejectionDataFromMaster() && <th className='text-right'>Action</th>}
                                <th className='text-center'>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.gridData && state?.gridData?.length > 0 && (partType ? filterApplicabilityDetails(state.gridData, IsIncludeApplicabilityForChildParts) : state.gridData)?.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item?.Applicability ?? '-'}</td>
                                        <td>{item?.Applicability !== 'Fixed' ? item?.Percentage : '-'}</td>
                                        <td>
                                            {item?.Applicability === 'Fixed' && fetchRejectionDataFromMaster() ? (
                                                <TextFieldHookForm
                                                    label=""
                                                    name={`RejectionFixedCost${index}`}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{
                                                        required: false,
                                                        validate: { number, checkWhiteSpaces, positiveAndDecimalNumber, maxLength10, decimalLengthsix },
                                                    }}
                                                    mandatory={false}
                                                    handleChange={(e) => {
                                                        const updatedGridData = [...state?.gridData];
                                                        const value = e?.target?.value;
                                                        const fixedValue = checkForNull(value);
                                                        updatedGridData[index] = {
                                                            ...updatedGridData[index],
                                                            Cost: fixedValue,
                                                            TotalCost: fixedValue,
                                                            NetCost: fixedValue,
                                                            Percentage: '-'
                                                        };
                                                        setState(prev => ({
                                                            ...prev,
                                                            gridData: updatedGridData
                                                        }));
                                                        setValue('RejectionTotalCost', fixedValue);
                                                        setValue('NetRejectionCost', fixedValue);
                                                        dispatch(isOverheadProfitDataChange(true));
                                                    }}
                                                    defaultValue={checkForDecimalAndNull(item?.Cost ?? '-', initialConfiguration.NoOfDecimalForPrice)}
                                                    className=""
                                                    customClassName={'withBorder w-75'}
                                                    errors={errors[`RejectionFixedCost${index}`]}
                                                    disabled={CostingViewMode || !isFixedRecord}
                                                />
                                            ) : (
                                                item?.Applicability === 'Casting Norm' ? (
                                                    <div className="d-flex align-items-center">
                                                        <span>{checkForDecimalAndNull(item?.Cost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</span>
                                                        <TooltipCustom
                                                            id={`casting-norm-cost-tooltip-${index}`}
                                                            tooltipText={getCastingNormFormulaTooltip()?.tooltipText}
                                                            disabledIcon={false}
                                                            placement="top"
                                                            width={getCastingNormFormulaTooltip()?.width}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                    <span>{checkForDecimalAndNull(item?.Cost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</span>
                                                    {(item?.Applicability === 'CC'||item?.Applicability === 'CCForMachining' )&& <TooltipCustom
                                                        id={`rejection-cost-tooltip-${index}`}
                                                        tooltipText={`If the selected applicability includes 'Excluding Int. + Dep.', only costs excluding Interest and Depreciation will be added.`}
                                                        disabledIcon={false}
                                                        placement="top"
                                                        width={getCastingNormFormulaTooltip()?.width}
                                                    />}
                                                </div>
                                                )
                                            )}
                                        </td>
                                        <td>{item?.Applicability === 'Fixed' ? checkForDecimalAndNull(item?.Cost ?? '-', initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(item?.TotalCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                        {(!IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData?.PartType === 'Assembly' && !IsMultiVendorCosting)) && getConfigurationKey().IsRejectionRecoveryApplicable && applicability.label === 'RM' && <td>

                                            <div className='d-flex align-items-center'>
                                                <span>{checkForDecimalAndNull(item?.CostingRejectionRecoveryDetails?.RejectionRecoveryNetCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</span>
                                                {item?.Applicability === 'RM' && <Button
                                                    id="tabDiscount_otherCost"
                                                    onClick={() => handleRejectionRecovery(true)}
                                                    className={"right ml-1 ml-0"}
                                                    variant={!fetchRejectionDataFromMaster() ? viewAddButtonIcon(item?.CostingRejectionRecoveryDetails, "className") : viewAddButtonIcon([], "className")}
                                                    title={viewAddButtonIcon([], "title")}
                                                />}</div></td>}

                                        <td>{checkForDecimalAndNull(item?.NetCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                        {!CostingViewMode && !fetchRejectionDataFromMaster() && <td className='text-right'>
                                            <button
                                                className="Edit"
                                                title='Edit'
                                                type={"button"}
                                                onClick={() => editDeleteData(index, 'edit')}
                                            />
                                            <button
                                                className="Delete ml-1"
                                                title='Delete'
                                                type={"button"}
                                                onClick={() => editDeleteData(index, 'delete')}
                                            />
                                        </td>}
                                        {index === 0 && (
                                            <td className='text-center align-middle border-start' rowSpan={state?.gridData?.length === 0 || state?.gridData === null || state?.gridData === undefined ? 1 : state?.gridData?.length}>
                                                <Popup trigger={<button id={`popUpTriggerRejection`} title="Remark" className="Comment-box" type={'button'} />}
                                                    position="top center">
                                                    <TextAreaHookForm
                                                        label="Remark:"
                                                        name={`rejectionRemark`}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            maxLength: REMARKMAXLENGTH
                                                        }}
                                                        handleChange={() => { }}
                                                        className=""
                                                        customClassName={"withBorder"}
                                                        errors={errors.rejectionRemark}
                                                        disabled={CostingViewMode}
                                                        hidden={false}
                                                        validateWithRemarkValidation={true}
                                                    />
                                                    <Row>
                                                        <Col md="12" className='remark-btn-container'>
                                                            <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickRejection()} > <div className='save-icon'></div> </button>
                                                            <button className='reset' onClick={() => onRemarkPopUpCloseRejection()} > <div className='cancel-icon'></div></button>
                                                        </Col>
                                                    </Row>
                                                </Popup>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}

                            {(state.gridData && state.gridData.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            {showRejectionPopup && <PopupMsgWrapper isOpen={showRejectionPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`If 'RM' is not selected in the applicability, you will loss rejection recovery cost.`} />}
            {isOpenRecoveryDrawer && <AddRejectionRecovery
                isOpen={isOpenRecoveryDrawer}
                rejectionPercentage={!fetchRejectionDataFromMaster() ? getValues('RejectionPercentage') : state.gridData?.find(item => item.Applicability === 'RM')?.Percentage || ''}
                closeDrawer={closeDrawer}
                calculateRecoveryCost={calculateRecoveryCost}
                rejectionTotalCost={!fetchRejectionDataFromMaster() ? getValues('RejectionTotalCost') : state.gridData?.find(item => item.Applicability === 'RM')?.TotalCost || ''}
                isViewRejectionRecovery={state?.isViewRejectionRecovery}
                partType={costData?.PartType}
                IsMultiVendorCosting={IsMultiVendorCosting}
            />}


        </>
    );
}

export default React.memo(Rejection);