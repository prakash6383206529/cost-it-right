import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, removeBOPfromApplicability } from '../../../../../helper';
//MINDA
// import { removeBOPFromList } from '../../../../../helper';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { isOverheadProfitDataChange, setOverheadProfitErrors, setRejectionRecoveryData } from '../../../actions/Costing';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';
import { number, percentageLimitValidation, isNumber, checkWhiteSpaces, NoSignNoDecimalMessage } from "../../../../../helper/validation";
import { CRMHeads, WACTypeId } from '../../../../../config/constants';
import Popup from 'reactjs-popup';
import Toaster from '../../../../common/Toaster';
import Button from '../../../../layout/Button';
import AddRejectionRecovery from './AddRejectionRecovery';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';


let counter = 0;
function Rejection(props) {

    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingRejectionDetail, clearErrors } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);


    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const costingHead = useSelector(state => state.comman.costingHead)
    const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
    const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const [IsChangedApplicability, setIsChangedApplicability] = useState(false)
    const [showRejectionPopup, setShowRejectionPopup] = useState(false)
    const [percentageLimit, setPercentageLimit] = useState(false)
    const [storedApplicability, setStoredApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const { IsIncludedSurfaceInRejection, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
    const { SurfaceTabData, rejectionRecovery, RMCCTabData } = useSelector(state => state.costing)
    const { CostingPartDetails, PartType } = RMCCTabData[0]
    const [errorMessage, setErrorMessage] = useState('')
    const [isOpenRecoveryDrawer, setIsOpenRecoveryDrawer] = useState(false);

    // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)

    const dispatch = useDispatch()

    const rejectionFieldValues = useWatch({
        control,
        name: ['RejectionPercentage', 'Applicability'],
    });

    useEffect(() => {
        if (applicability && applicability.value !== undefined && !CostingViewMode) {
            setApplicability(applicability)
            checkRejectionApplicability(applicability.label)
        }
    }, [headerCosts && headerCosts.NetTotalRMBOPCC])


    useEffect(() => {
        let request = partType ? 'multiple technology assembly' : ''
        dispatch(fetchCostingHeadsAPI(request, false, (res) => { }))
        setValue('RejectionPercentage', rejectionObj?.RejectionApplicability === "Fixed" ? rejectionObj?.RejectionCost : rejectionObj?.RejectionPercentage)
        setValue('crmHeadRejection', rejectionObj && rejectionObj.RejectionCRMHead && { label: rejectionObj.RejectionCRMHead, value: 1 })
        setValue('rejectionRemark', rejectionObj && rejectionObj.Remark ? rejectionObj.Remark : '')
        dispatch(setRejectionRecoveryData(CostingRejectionDetail.CostingRejectionRecoveryDetails ?? rejectionRecovery))
    }, [])

    useEffect(() => {
        if (!CostingViewMode) {
            checkRejectionApplicability(applicability.label)
        }
    }, [rejectionFieldValues]);

    useEffect(() => {
        if (!CostingViewMode) {
            checkRejectionApplicability(applicability.label)
        }
    }, [IsIncludedSurfaceInRejection]);


    useEffect(() => {
        setValue('NetRejectionCost', checkForDecimalAndNull(rejectionObj.RejectionTotalCost - checkForNull(rejectionRecovery.RejectionRecoveryNetCost), initialConfiguration.NoOfDecimalForPrice))
        setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecovery.RejectionRecoveryNetCost, initialConfiguration.NoOfDecimalForPrice))
    }, [rejectionObj, rejectionRecovery.RejectionRecoveryNetCost])


    useEffect(() => {
        setTimeout(() => {
            let rejectionRecoveryObj = {}
            if (rejectionRecovery.ApplicabilityType !== '') {
                const { ApplicabilityIdRef, ApplicabilityType, Value, EffectiveRecoveryPercentage, ApplicabilityCost, RejectionRecoveryNetCost } = rejectionRecovery
                rejectionRecoveryObj.BaseCostingIdRef = CostingPartDetails.CostingId
                rejectionRecoveryObj.ApplicabilityIdRef = ApplicabilityIdRef ?? 0
                rejectionRecoveryObj.ApplicabilityType = ApplicabilityType
                rejectionRecoveryObj.Type = ""
                rejectionRecoveryObj.Value = Value
                rejectionRecoveryObj.EffectiveRecoveryPercentage = EffectiveRecoveryPercentage
                rejectionRecoveryObj.ApplicabilityCost = ApplicabilityCost
                rejectionRecoveryObj.RejectionRecoveryNetCost = RejectionRecoveryNetCost
            }
            let tempObj = {
                "RejectionApplicabilityId": applicability ? applicability.value : '',
                "RejectionApplicability": applicability ? applicability.label : '',
                "RejectionPercentage": applicability.label === 'Fixed' ? '' : getValues('RejectionPercentage'),
                "RejectionCost": applicability ? rejectionObj.RejectionCost : '',
                "RejectionTotalCost": applicability ? checkForNull(rejectionObj.RejectionTotalCost) - checkForNull(rejectionRecovery.RejectionRecoveryNetCost) : '',
                "IsSurfaceTreatmentApplicable": true,
                "NetCost": applicability ? rejectionObj.RejectionTotalCost : '',
                "RejectionCRMHead": getValues('crmHeadRejection') ? getValues('crmHeadRejection').label : '',
                "Remark": rejectionObj.Remark ? rejectionObj.Remark : '',
                "IsRejectionRecoveryApplicable": rejectionRecovery.ApplicabilityType !== '' ? true : false,
                "CostingRejectionRecoveryDetails": rejectionRecoveryObj && rejectionRecovery.RejectionRecoveryNetCost ? rejectionRecoveryObj : null
            }

            if (!CostingViewMode) {
                props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)
    }, [rejectionObj, rejectionRecovery])


    /**
 * @method renderListing
 * @description RENDER LISTING (NEED TO BREAK THIS)
 */
    const renderListing = (label) => {
        const temp = [];
        let tempList = [];
        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0' || item.Text === 'Net Cost') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            if (isBreakupBoughtOutPartCostingFromAPI) {
                tempList = removeBOPfromApplicability([...temp])
                //MINDA
                // tempList = removeBOPFromList([...temp])
            } else {
                tempList = [...temp]
            }
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


    /**
      * @method checkRejectionApplicability
      * @description REJECTION APPLICABILITY CALCULATION
      */
    const checkRejectionApplicability = (Text) => {
        if (headerCosts && Text !== '') {
            let RM = 0
            let BOP = 0
            let CC = 0
            let RM_CC_BOP = 0
            let RM_CC = 0
            let BOP_CC = 0
            let RM_BOP = 0
            const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
            const NetSurfaceTreatmentCost = (IsIncludedSurfaceInRejection ? checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) : 0)
            const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost)

            const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
            const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost);
            const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost);
            const RejectionPercentage = getValues('RejectionPercentage')

            // IF BLOCK WILL GET EXECUTED WHEN TECHNOLOGY FOR COSTING IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE BLOCK WILL EXECUTE
            if (partType) {
                const assemblyLevelCC = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal)

                // RM FOR ASSEMBLY TECHNOLOGY COSTING WILL BE PART COST ONLY (SUM OF ALL COST PER ASSEMBLIES OF CHILD PART)
                RM = checkForNull(headerCosts?.NetRawMaterialsCost)
                BOP = checkForNull(headerCosts?.NetBoughtOutPartCost)
                CC = checkForNull(assemblyLevelCC)
                RM_CC_BOP = (checkForNull(headerCosts?.NetRawMaterialsCost) + checkForNull(assemblyLevelCC) + checkForNull(headerCosts?.NetBoughtOutPartCost) + checkForNull(NetSurfaceTreatmentCost))
                RM_CC = (checkForNull(headerCosts?.NetRawMaterialsCost) + checkForNull(assemblyLevelCC) + checkForNull(NetSurfaceTreatmentCost))
                BOP_CC = (checkForNull(assemblyLevelCC) + checkForNull(headerCosts?.NetBoughtOutPartCost) + checkForNull(NetSurfaceTreatmentCost))
                RM_BOP = (checkForNull(headerCosts?.NetRawMaterialsCost) + checkForNull(headerCosts?.NetBoughtOutPartCost))
            } else {
                const ConversionCostForCalculation = costData?.IsAssemblyPart ? checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly) : headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal

                RM = headerCosts?.NetRawMaterialsCost
                BOP = headerCosts?.NetBoughtOutPartCost
                CC = ConversionCostForCalculation
                RM_CC_BOP = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost)
                RM_CC = headerCosts?.NetRawMaterialsCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost);
                BOP_CC = headerCosts?.NetBoughtOutPartCost + ConversionCostForCalculation + checkForNull(NetSurfaceTreatmentCost);
                RM_BOP = headerCosts?.NetRawMaterialsCost + headerCosts?.NetBoughtOutPartCost;
            }

            switch (Text) {
                case 'RM':
                case 'Part Cost':
                    if ((partType && Text === 'Part Cost') || (!partType && Text === 'RM')) {
                        setValue('RejectionCost', checkForDecimalAndNull(RM, initialConfiguration.NoOfDecimalForPrice))
                        setValue('RejectionTotalCost', checkForDecimalAndNull((RM * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setRejectionObj({
                            ...rejectionObj,
                            RejectionApplicabilityId: applicability.value,
                            RejectionApplicability: applicability.label,
                            RejectionPercentage: RejectionPercentage,
                            RejectionCost: checkForNull(RM),
                            RejectionTotalCost: checkForNull(RM) * calculatePercentage(checkForNull(RejectionPercentage))
                        })
                    }
                    break;

                case 'BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(BOP, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((BOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: BOP,
                        RejectionTotalCost: checkForNull(BOP) * calculatePercentage(checkForNull(RejectionPercentage))
                    })
                    break;

                case 'CC':
                    let totalRejectionCost = CC + checkForNull(NetSurfaceTreatmentCost)
                    setValue('RejectionCost', checkForDecimalAndNull(totalRejectionCost, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((totalRejectionCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: totalRejectionCost,
                        RejectionTotalCost: checkForNull((totalRejectionCost * calculatePercentage(RejectionPercentage)))
                    })
                    break;

                case 'RM + CC + BOP':
                case 'Part Cost + CC + BOP':
                    if ((partType && Text === 'Part Cost + CC + BOP') || (!partType && Text === 'RM + CC + BOP')) {
                        setValue('RejectionCost', checkForDecimalAndNull(RM_CC_BOP, initialConfiguration.NoOfDecimalForPrice))
                        setValue('RejectionTotalCost', checkForDecimalAndNull((RM_CC_BOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setRejectionObj({
                            ...rejectionObj,
                            RejectionApplicabilityId: applicability.value,
                            RejectionApplicability: applicability.label,
                            RejectionPercentage: RejectionPercentage,
                            RejectionCost: RM_CC_BOP,
                            RejectionTotalCost: checkForNull(RM_CC_BOP) * calculatePercentage(checkForNull(RejectionPercentage))
                        })
                    }
                    break;

                case 'RM + BOP':
                case 'Part Cost + BOP':
                    if ((partType && Text === 'Part Cost + BOP') || (!partType && Text === 'RM + BOP')) {
                        setValue('RejectionCost', checkForDecimalAndNull(RM_BOP, initialConfiguration.NoOfDecimalForPrice))
                        setValue('RejectionTotalCost', checkForDecimalAndNull((RM_BOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setRejectionObj({
                            ...rejectionObj,
                            RejectionApplicabilityId: applicability.value,
                            RejectionApplicability: applicability.label,
                            RejectionPercentage: RejectionPercentage,
                            RejectionCost: RM_BOP,
                            RejectionTotalCost: checkForNull(RM_BOP) * calculatePercentage(checkForNull(RejectionPercentage))
                        })
                    }
                    break;

                case 'RM + CC':
                case 'Part Cost + CC':
                    if ((partType && Text === 'Part Cost + CC') || (!partType && Text === 'RM + CC')) {
                        setValue('RejectionCost', checkForDecimalAndNull(RM_CC, initialConfiguration.NoOfDecimalForPrice))
                        setValue('RejectionTotalCost', checkForDecimalAndNull((RM_CC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setRejectionObj({
                            ...rejectionObj,
                            RejectionApplicabilityId: applicability.value,
                            RejectionApplicability: applicability.label,
                            RejectionPercentage: RejectionPercentage,
                            RejectionCost: RM_CC,
                            RejectionTotalCost: checkForNull(RM_CC) * calculatePercentage(checkForNull(RejectionPercentage))
                        })
                    }
                    break;

                case 'BOP + CC':
                    setValue('RejectionCost', checkForDecimalAndNull(BOP_CC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((BOP_CC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: BOP_CC,
                        RejectionTotalCost: checkForNull(BOP_CC) * calculatePercentage(checkForNull(RejectionPercentage))
                    })
                    break;

                case 'Fixed':
                    setValue('RejectionCost', '-')
                    setValue('RejectionTotalCost', checkForDecimalAndNull(RejectionPercentage, initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: checkForNull(RejectionPercentage),
                        RejectionTotalCost: checkForNull(RejectionPercentage)
                    })
                    break;
                default:
                    break;
            }
        }
        dispatch(isOverheadProfitDataChange(true))
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
        CostingPartDetails.CostingRawMaterialsCost.map(item => {
            CostApplicability += checkForNull(item.ScrapRate) * checkForNull(item.FinishWeight)
        })
        const rejectionRecoveryCost = CostApplicability * EffectiveRecovery / 100
        setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecoveryCost, initialConfiguration.NoOfDecimalForPrice))
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
            checkRejectionApplicability('')
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
            setShowRejectionPopup(true)
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
        setValue(`rejectionRemark`, rejectionObj.Remark)
        if (errors.rejectionRemark) {
            delete errors.rejectionRemark;
        }
        button.click()
    }
    const handleRejectionRecovery = () => {
        if (PartType !== 'Assembly' && !(applicability && applicability.label && applicability.label.includes('RM'))) {
            Toaster.warning('Applicability should be RM')
            return false
        } else if (PartType !== 'Assembly' && !getValues('RejectionPercentage')) {
            Toaster.warning('Enter the Rejection Percentage')
            return false
        } else {
            setIsOpenRecoveryDrawer(!isOpenRecoveryDrawer)
        }
    }
    const closeDrawer = (type, cost) => {
        if (type === 'cancel') {
            setIsOpenRecoveryDrawer(false)
        } else if (type === 'submit') {
            setIsOpenRecoveryDrawer(false)
            setValue('RejectionRecovery', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice))
        }
    }

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
    //     setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecovery.rejectionRecoveryCost, initialConfiguration.NoOfDecimalForPrice))
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
    return (
        <>
            <Row>
                <Col md="12" className="pt-3">
                    <div className="left-border">
                        {'Rejection:'}
                    </div>
                </Col>
                {initialConfiguration.IsShowCRMHead && <Col md="3">
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
                <Col md="11" className='first-section'>
                    <Row className="costing-border-inner-section border-bottom-none m-0">
                        <Col md="2">
                            <span className="head-text">
                                Applicability
                            </span>
                        </Col>
                        <Col md="2">
                            <span className="head-text">
                                {applicability.label !== 'Fixed' ? 'Rejection (%)' : 'Rejection'}
                            </span>
                        </Col>
                        {applicability.label !== 'Fixed' && <Col md="2">
                            <span className="head-text">
                                Cost (Applicability)
                            </span>
                        </Col>}
                        <Col md="2">
                            <span className="head-text">
                                Rejection
                            </span>
                        </Col>
                        <Col md="2">
                            <span className="head-text">
                                Rejection Recovery Cost
                            </span>
                        </Col>
                        <Col md={applicability.label === 'Fixed' ? '4' : '2'}>
                            <span className="head-text">
                                Net Rejection
                            </span>
                        </Col>
                    </Row>
                    <Row className="costing-border costing-border-with-labels pt-3 m-0 overhead-profit-tab-costing">
                        <Col md="2">
                            <SearchableSelectHookForm
                                label={false}
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
                                    label={false}
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
                                        label={false}
                                        name={'RejectionPercentage'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
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
                                    label={false}
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
                        <Col md="2">
                            <TextFieldHookForm
                                label={false}
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
                        </Col>
                        <Col md="2">
                            {/* {RejectionRecoveryUI} */}
                            <div className='d-flex align-items-center'>
                                <TextFieldHookForm
                                    label={false}
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
                                    onClick={() => handleRejectionRecovery()}
                                    className={"right mb-4 ml-0"}
                                    variant={viewAddButtonIcon([], "className")}
                                    title={viewAddButtonIcon([], "title")}
                                />
                            </div>
                        </Col>
                        <Col md={applicability.label === 'Fixed' ? '4' : '2'}>
                            <TextFieldHookForm
                                label={false}
                                name={'NetRejectionCost'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.NetRejectionCost}
                                disabled={true}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col md="1" className='second-section pr-2'>
                    <div className='costing-border-inner-section'>
                        <Col md="12" className='text-center'>Remark</Col>
                        <Col md="12">
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
                                />
                                <Row>
                                    <Col md="12" className='remark-btn-container'>
                                        <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickRejection()} > <div className='save-icon'></div> </button>
                                        <button className='reset' onClick={() => onRemarkPopUpCloseRejection()} > <div className='cancel-icon'></div></button>
                                    </Col>
                                </Row>
                            </Popup>
                        </Col>
                        {showRejectionPopup && <PopupMsgWrapper isOpen={showRejectionPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`If 'RM' is not selected in the applicability, you will loss rejection recovery cost.`} />}
                    </div>
                </Col>
            </Row>
            {isOpenRecoveryDrawer && <AddRejectionRecovery
                isOpen={isOpenRecoveryDrawer}
                rejectionPercentage={getValues('RejectionPercentage')}
                closeDrawer={closeDrawer}
                calculateRecoveryCost={calculateRecoveryCost}
            />}


        </>
    );
}

export default React.memo(Rejection);