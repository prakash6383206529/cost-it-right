import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean } from '../../../../../helper';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { isOverheadProfitDataChange } from '../../../actions/Costing';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';



function Rejection(props) {

    const { Controller, control, register, defaultValue, data, setValue, getValues, errors, useWatch, CostingRejectionDetail, clearErrors } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);

    const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const costingHead = useSelector(state => state.comman.costingHead)
    const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
    const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const [IsChangedApplicability, setIsChangedApplicability] = useState(false)
    const [percentageLimit, setPercentageLimit] = useState(false)
    const { IsIncludedSurfaceInRejection } = useSelector(state => state.costing)
    const { SurfaceTabData } = useSelector(state => state.costing)
    const [partType, setpartType] = useState(costData?.TechnologyName === 'Assembly')   //HELP


    const dispatch = useDispatch()

    const rejectionFieldValues = useWatch({
        control,
        name: ['RejectionPercentage', 'Applicability'],
    });

    useEffect(() => {
        if (applicability && applicability.value !== undefined) {
            setApplicability(applicability)
            checkRejectionApplicability(applicability.label)
        }
    }, [headerCosts && headerCosts.NetTotalRMBOPCC])


    useEffect(() => {
        dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
        setValue('RejectionPercentage', rejectionObj?.RejectionApplicability === 'Fixed' ? rejectionObj?.RejectionCost : rejectionObj?.RejectionPercentage)
    }, [])

    useEffect(() => {
        checkRejectionApplicability(applicability.label)


    }, [rejectionFieldValues]);

    useEffect(() => {
        checkRejectionApplicability(applicability.label)
    }, [IsIncludedSurfaceInRejection]);


    useEffect(() => {
        setTimeout(() => {
            let tempObj = {
                "RejectionApplicabilityId": applicability ? applicability.value : '',
                "RejectionApplicability": applicability ? applicability.label : '',
                "RejectionPercentage": applicability.label === 'Fixed' ? '' : getValues('RejectionPercentage'),
                "RejectionCost": applicability ? rejectionObj.RejectionCost : '',
                "RejectionTotalCost": applicability ? rejectionObj.RejectionTotalCost : '',
                "IsSurfaceTreatmentApplicable": true,
            }

            if (!CostingViewMode) {
                props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)
    }, [rejectionObj])


    /**
 * @method renderListing
 * @description RENDER LISTING (NEED TO BREAK THIS)
 */
    const renderListing = (label) => {
        const temp = [];

        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0' || item.Text === 'Net Cost') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }


    /**
      * @method checkRejectionApplicability
      * @description REJECTION APPLICABILITY CALCULATION
      */
    const checkRejectionApplicability = (Text) => {
        if (headerCosts && Text !== '') {
            const ConversionCostForCalculation = costData?.IsAssemblyPart ? checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly) : headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal

            const RMBOPCC = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + ConversionCostForCalculation
            const RMBOP = headerCosts?.NetRawMaterialsCost + headerCosts?.NetBoughtOutPartCost;
            const RMCC = headerCosts?.NetRawMaterialsCost + ConversionCostForCalculation;
            const BOPCC = headerCosts?.NetBoughtOutPartCost + ConversionCostForCalculation;
            const RejectionPercentage = getValues('RejectionPercentage')

            const assemblyLevelCC = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.TotalOperationCostPerAssembly)                                                           //LATER headerCosts.ProcessCostTotal
            const BOPTotalCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
            const EditPartCost = checkForNull(headerCosts?.NetRawMaterialsCost)

            const RM = partType ? checkForNull(EditPartCost) : headerCosts?.NetRawMaterialsCost
            const BOP = partType ? checkForNull(BOPTotalCost) : headerCosts?.NetBoughtOutPartCost
            const CC = partType ? checkForNull(assemblyLevelCC) : ConversionCostForCalculation
            let RM_CC_BOP = partType ? (checkForNull(EditPartCost) + checkForNull(assemblyLevelCC) + checkForNull(BOPTotalCost)) : RMBOPCC
            let RM_CC = partType ? (checkForNull(EditPartCost) + checkForNull(assemblyLevelCC)) : RMCC
            let BOP_CC = partType ? (checkForNull(assemblyLevelCC) + checkForNull(BOPTotalCost)) : BOPCC
            let RM_BOP = partType ? (checkForNull(EditPartCost) + checkForNull(BOPTotalCost)) : RMBOP


            switch (Text) {
                case 'RM':
                    setValue('RejectionCost', checkForDecimalAndNull(RM, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RM * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: checkForNull(RM),
                        RejectionTotalCost: checkForNull((RM * calculatePercentage(RejectionPercentage)))
                    })
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
                        RejectionTotalCost: checkForNull((BOP * calculatePercentage(RejectionPercentage)))
                    })
                    break;

                case 'CC':
                    setValue('RejectionCost', checkForDecimalAndNull(CC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull(((CC) * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: CC,
                        RejectionTotalCost: checkForNull(((CC) * calculatePercentage(RejectionPercentage)))
                    })
                    break;

                case 'RM + CC + BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(RM_CC_BOP, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RM_CC_BOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RM_CC_BOP,
                        RejectionTotalCost: checkForNull((RM_CC_BOP * calculatePercentage(RejectionPercentage)))
                    })
                    break;

                case 'RM + BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(RM_BOP, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RM_BOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RM_BOP,
                        RejectionTotalCost: checkForNull((RM_BOP * calculatePercentage(RejectionPercentage)))
                    })
                    break;

                case 'RM + CC':
                    setValue('RejectionCost', checkForDecimalAndNull(RM_CC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RM_CC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RM_CC,
                        RejectionTotalCost: checkForNull((RM_CC * calculatePercentage(RejectionPercentage)))
                    })
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
                        RejectionTotalCost: checkForNull((BOP_CC * calculatePercentage(RejectionPercentage)))
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
        setPercentageLimit(decimalAndNumberValidationBoolean(event.target.value))
        dispatch(isOverheadProfitDataChange(true))
    }

    /**
      * @method handleApplicabilityChange
      * @description  USED TO HANDLE APPLICABILITY CHANGE FOR REJECTION
      */
    const handleApplicabilityChange = (newValue) => {
        if (newValue && newValue !== '') {
            setValue('RejectionPercentage', '')
            setApplicability(newValue)
            checkRejectionApplicability(newValue.label)
            setIsChangedApplicability(!IsChangedApplicability)
        } else {
            setApplicability([])
            checkRejectionApplicability('')
        }
        dispatch(isOverheadProfitDataChange(true))
    }

    return (
        <>
            <Row>
                <Col md="12" className="pt-3">
                    <div className="left-border">
                        {'Rejection:'}
                    </div>
                </Col>
            </Row>
            <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing">
                <Col md="3">
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
                    />
                </Col>
                <Col md="3">
                    {applicability.label !== 'Fixed' ?
                        <NumberFieldHookForm
                            label={`Rejection (%)`}
                            name={'RejectionPercentage'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                                max: { value: 100, message: 'Percentage cannot be greater than 100' },
                            }}
                            handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.RejectionPercentage}
                            disabled={CostingViewMode ? true : false}
                        />
                        :
                        //THIS FIELD WILL RENDER WHEN REJECTION TYPE FIXED
                        <div className='p-relative error-wrapper'>
                            <NumberFieldHookForm
                                label={`Rejection`}
                                name={'RejectionPercentage'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                    required: false,
                                    pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                                }}
                                handleChange={(e) => handleChangeRejectionPercentage(e)}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                disabled={CostingViewMode ? true : false}
                            />
                            {applicability.label === 'Fixed' && percentageLimit && <WarningMessage dClass={"error-message fixed-error"} message={MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                        </div>}
                </Col>
                {applicability.label !== 'Fixed' &&
                    <Col md="3">
                        <TextFieldHookForm
                            label="Cost (Applicability)"
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
                <Col md="3">
                    <TextFieldHookForm
                        label="Net Rejection"
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
            </Row>

        </>
    );
}

export default React.memo(Rejection);