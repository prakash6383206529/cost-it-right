import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Table, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, fetchRejectionDataFromMaster, getConfigurationKey, removeBOPfromApplicability } from '../../../../../helper';
//MINDA
// import { removeBOPFromList } from '../../../../../helper';
import { fetchApplicabilityList, fetchCostingHeadsAPI, fetchModelTypeAPI } from '../../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { getRejectionDataByModelType, isOverheadProfitDataChange, setOverheadProfitErrors, setRejectionRecoveryData } from '../../../actions/Costing';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';
import { number, percentageLimitValidation, isNumber, checkWhiteSpaces, NoSignNoDecimalMessage } from "../../../../../helper/validation";
import { CBCTypeId, CRMHeads, EMPTY_DATA, EMPTY_GUID, NFRTypeId, REJECTIONMASTER, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import Popup from 'reactjs-popup';
import Toaster from '../../../../common/Toaster';
import Button from '../../../../layout/Button';
import AddRejectionRecovery from './AddRejectionRecovery';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { getCostingConditionTypes } from '../../../../common/CommonFunctions';
import NoContentFound from '../../../../common/NoContentFound';
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
    const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const [IsChangedApplicability, setIsChangedApplicability] = useState(false)
    const [showRejectionPopup, setShowRejectionPopup] = useState(false)
    const [percentageLimit, setPercentageLimit] = useState(false)
    const [storedApplicability, setStoredApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const { IsIncludedSurfaceInRejection, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
    const { SurfaceTabData, rejectionRecovery, RMCCTabData, CostingEffectiveDate } = useSelector(state => state.costing)
    const modelTypes = useSelector(state => state.comman.modelTypes)
    const { CostingPartDetails, PartType } = RMCCTabData[0]
    const [errorMessage, setErrorMessage] = useState('')
    const [isOpenRecoveryDrawer, setIsOpenRecoveryDrawer] = useState(false);
    const conditionTypeId = getCostingConditionTypes(REJECTIONMASTER);
    const [state, setState] = useState({
        gridData: [],
        isEdit: false,
        editIndex: null,
        modelType: '',
        modelTypeList: []
    })

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
            // checkRejectionApplicability(applicability.label)
        }
    }, [headerCosts && headerCosts.NetTotalRMBOPCC])


    useEffect(() => {
            dispatch(fetchApplicabilityList(null, conditionTypeId, false, res => { }));
            if(fetchRejectionDataFromMaster()){
                dispatch(fetchModelTypeAPI('rejection', (res) => {
                    let temp = [];
                    res?.data?.SelectList?.map(item => {
                        if (item.Value === '0' ) return false;
                        temp.push({ label: item.Text, value: item.Value });
                        return null;
                    });
                    setState({
                        ...state,
                        modelTypeList: temp
                    });
                 }))
            }
        setValue('RejectionPercentage', rejectionObj?.RejectionApplicability === "Fixed" ? rejectionObj?.RejectionCost : rejectionObj?.RejectionPercentage)
        setValue('crmHeadRejection', rejectionObj && rejectionObj?.RejectionCRMHead && { label: rejectionObj?.RejectionCRMHead, value: 1 })
        setValue('rejectionRemark', rejectionObj && rejectionObj?.Remark ? rejectionObj?.Remark : '')
        dispatch(setRejectionRecoveryData(CostingRejectionDetail.CostingRejectionRecoveryDetails ?? rejectionRecovery))
    }, [])
    useEffect(() => {
        if (!CostingViewMode) {
            // checkRejectionApplicability(applicability.label)
        }
    }, [rejectionFieldValues]);

    useEffect(() => {
        if (!CostingViewMode) {
            // checkRejectionApplicability(applicability.label)
        }
    }, [IsIncludedSurfaceInRejection]);


    useEffect(() => {
        setValue('NetRejectionCost', checkForDecimalAndNull(rejectionObj?.RejectionTotalCost - checkForNull(rejectionRecovery.RejectionRecoveryNetCost), initialConfiguration?.NoOfDecimalForPrice))
        setValue('RejectionRecovery', checkForDecimalAndNull(rejectionRecovery.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice))
        setState({
            ...state,
            gridData: rejectionObj?.CostingRejectionApplicabilityDetails
        })
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
                "RejectionCost": applicability ? rejectionObj?.RejectionCost : '',
                "RejectionTotalCost": applicability ? checkForNull(rejectionObj?.RejectionTotalCost) - checkForNull(rejectionRecovery.RejectionRecoveryNetCost) : '',
                "IsSurfaceTreatmentApplicable": true,
                "NetCost": applicability ? rejectionObj?.RejectionTotalCost : '',
                "RejectionCRMHead": getValues('crmHeadRejection') ? getValues('crmHeadRejection').label : '',
                "Remark": rejectionObj?.Remark ? rejectionObj?.Remark : '',
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
            applicabilityList && applicabilityList.map(item => {
                if (item.Value === '0' ) return false;
                temp.push({ label: item.Text, value: item.Value })
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


    /**
      * @method checkRejectionApplicability
      * @description REJECTION APPLICABILITY CALCULATION
      */
    const checkRejectionApplicability = (applicabilityType, data) => {
        const RM = checkForNull(headerCosts.NetRawMaterialsCost);
        const BOP = checkForNull(headerCosts.NetBoughtOutPartCost);
        const CC = partType
          ? checkForNull(headerCosts.NetProcessCost) + checkForNull(headerCosts.NetOperationCost)
          : checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly);
      
        const SurfaceCost = IsIncludedSurfaceInRejection
          ? checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost)
          : 0;


        let prevData =  _.cloneDeep(data) 
        let newData = [];
        if(prevData && prevData?.CostingRejectionApplicabilityDetails && prevData?.CostingRejectionApplicabilityDetails.length > 0){
            newData =prevData?.CostingRejectionApplicabilityDetails.map((item, index) => {
                let totalCost;
                switch (item.Applicability) {
                    case 'RM':
                      totalCost = checkForDecimalAndNull(RM * calculatePercentage(item.Percentage), initialConfiguration?.NoOfDecimalForPrice);
                      item.Cost = RM;
                      item.TotalCost = totalCost;
                      break;
                    case 'BOP':
                        totalCost = checkForDecimalAndNull(BOP * calculatePercentage(item.Percentage), initialConfiguration?.NoOfDecimalForPrice);
                      item.Cost = BOP;
                      item.TotalCost = totalCost;
                      break;
                    case 'CC':
                    case 'CCForMachining':
                      totalCost = checkForDecimalAndNull((CC + SurfaceCost) * calculatePercentage(item.Percentage), initialConfiguration?.NoOfDecimalForPrice);
                      item.Cost = CC + SurfaceCost;
                      item.TotalCost = totalCost;
                      break;
                    case 'Fixed':
                        item.Cost = "-";
                       item.TotalCost = "-";
                       break;
                    default:
                      return item;
                  }
                  return item
            })
        }
      
        //   let base = 0;
        //   let cost = 0;
        //   let totalCost = 0;
      
        //   switch (item.Applicability) {
        //     case 'RM':
        //         debugger
        //       base = RM;
        //       break;
        //     case 'BOP':
        //       base = BOP;
        //       break;
        //     case 'CC':
        //     case 'CCForMachining':
        //       base = CC + SurfaceCost;
        //       break;
        //     case 'Fixed':
        //       return {
        //         ...item,
        //         Cost: '-',
        //         TotalCost: checkForDecimalAndNull(getValues('RejectionPercentage'), initialConfiguration?.NoOfDecimalForPrice)
        //       };
        //     default:
        //       return item;
        //   }
      
        //   cost = checkForDecimalAndNull(base, initialConfiguration?.NoOfDecimalForPrice);
        //   totalCost = checkForDecimalAndNull(base * calculatePercentage(item.Percentage), initialConfiguration?.NoOfDecimalForPrice);
      
        //   // Optional: Set RejectionCost/TotalCost in form only for this type
        //   setValue('RejectionCost', cost);
        //   setValue('RejectionTotalCost', totalCost);
      
        //   return {
        //     ...item,
        //     Cost: cost,
        //     TotalCost: totalCost
        //   };
        // });
      
        // setState(prev => ({
        //   ...prev,
        //   gridData: updatedGrid
        // }));
        setState(prev => ({
          ...prev,
          gridData: newData
        }));
      
        dispatch(isOverheadProfitDataChange(true));
      };

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
        setValue(`rejectionRemark`, rejectionObj?.Remark)
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
            setValue('RejectionRecovery', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice))
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
        setValue('RejectionRecovery', '')
        setValue('RejectionCost', '')
        setValue('RejectionTotalCost', '')
        setValue('RejectionPercentage', '')
    }
    const editItemDetails = (index) => {
        console.log(index)
    }
    const deleteItem = (index) => {
        console.log(index)
    }
    const addTableData = () => {
        console.log('addTableData')
    }
    const handleModelTypeChange = (ModelTypeValues, IsDropdownClicked) => {
        setState({
            ...state,
            modelType: ModelTypeValues
        })
        const reqParams = {
            ModelTypeId: ModelTypeValues.value,
            VendorId: (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? costData.VendorId : null,
            costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
            EffectiveDate: CostingEffectiveDate,
            plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) || (costData?.CostingTypeId === NFRTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
            customerId: costData.CustomerId,
            technologyId: null,
            partFamilyId: costData?.PartFamilyId,
          }
          dispatch(getRejectionDataByModelType(reqParams, (res) => {
            let data=res?.data?.Data?.CostingRejectionDetail
            setRejectionObj(data)
                setTimeout(() => {
                    checkRejectionApplicability(data)
                }, 500);
          }))
    }
    return (
        <>
            <Row>
                <Col md="12" className="pt-3">
                    <div className="left-border">
                        {'Rejection:'}
                    </div>
                </Col>
               {fetchRejectionDataFromMaster()&& <Col md="3">
                <SearchableSelectHookForm
                  label={'Model Type for Rejection'}
                  name={'ModelTypeRejection'}
                  placeholder={'Select'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: false }}
                  register={register}
                  defaultValue={state.modelType.length !== 0 ? state.modelType : ''}
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
                    {!fetchRejectionDataFromMaster() && <Row className=" costing-border-with-labels pt-3 m-0 overhead-profit-tab-costing">
                        <Col md={"2"}>
                            <SearchableSelectHookForm
                                label={'Applicability'}
                                name={'Applicability'}
                                placeholder={'Select'}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={applicability.length !== 0 ? applicability : ''}
                                options={renderListing('Applicability')}
                                mandatory={true}
                                disabled={CostingViewMode ? true : false}
                                handleChange={handleApplicabilityChange}
                                errors={errors.Applicability}
                                isClearable={true}
                            />
                        </Col>
                        <Col md="1">
                            {applicability.label !== 'Fixed' ?
                                <TextFieldHookForm
                                    label={`${applicability.label !== 'Fixed'? 'Rejection (%)' : 'Rejection'}`}
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
                                        label={ 'Rejection (%)'}
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
                            <Col md="1">
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
                        <Col md="1">
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
                        </Col>
                        {getConfigurationKey().IsRejectionRecoveryApplicable && <Col md="2">
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
                                    onClick={() => handleRejectionRecovery()}
                                    className={"right mb-4 ml-0"}
                                    variant={viewAddButtonIcon([], "className")}
                                    title={viewAddButtonIcon([], "title")}
                                />
                            </div>
                        </Col>}
                        <Col md={'1'}>
                            <TextFieldHookForm
                                label={'Net Rejection'}
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
                        <Col md="4" className="mb-2">
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
                                onClick={() => resetData("reset")}
                                disabled={CostingViewMode}
                            >
                                RESET
                            </button>
                        </Col>
                    </Row>}
                
                <Col md="12">
                            <Table className="table mb-0 forging-cal-table" size="sm">
                                <thead>
                                    <tr>
                                        <th>Applicability</th>
                                        <th>Rejection (%)</th>
                                        <th>Cost (Applicability)</th>
                                        <th>Rejection</th>
                                        <th>Rejection Recovery Cost</th>
                                        <th>Net Rejection</th>
                                        {!CostingViewMode &&!fetchRejectionDataFromMaster() && <th className='text-right'>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.gridData && state.gridData.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item?.Applicability ?? '-'}</td>
                                                <td>{item?.Percentage ?? '-'}</td>
                                                <td>{checkForDecimalAndNull(item?.Cost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                                <td>{checkForDecimalAndNull(item?.TotalCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                                <td>{checkForDecimalAndNull(item?.RejectionRecoveryCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                                <td>{checkForDecimalAndNull(item?.NetCost ?? '-', initialConfiguration.NoOfDecimalForPrice)}</td>
                                                {!CostingViewMode && <td className='text-right'>
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
                                                </td>}
                                            </tr>
                                        );
                                    })}

                                    {(state.gridData && state.gridData.length === 0) && (
                                        <tr>
                                            <td colSpan={7}><NoContentFound title={EMPTY_DATA} /></td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
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
                rejectionTotalCost={rejectionObj?.RejectionTotalCost}
            />}


        </>
    );
}

export default React.memo(Rejection);