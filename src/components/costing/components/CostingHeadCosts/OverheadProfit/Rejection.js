import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { isOverheadProfitDataChange } from '../../../actions/Costing';



function Rejection(props) {

    const { Controller, control, register, defaultValue, data, setValue, getValues, errors, useWatch, CostingRejectionDetail } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);

    // const { CostingRejectionDetail } = props.data.CostingPartDetails;

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { RMCCutOffObj } = useSelector(state => state.costing)
    const costingHead = useSelector(state => state.comman.costingHead)
    const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
    const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
    const [IsChangedApplicability, setIsChangedApplicability] = useState(false)

    const defaultValues = {

        //REJECTION FIELDS
        Applicability: CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : '',
        RejectionPercentage: CostingRejectionDetail && CostingRejectionDetail.RejectionPercentage !== null ? CostingRejectionDetail.RejectionPercentage : '',
        RejectionCost: CostingRejectionDetail && CostingRejectionDetail.RejectionCost !== null ? CostingRejectionDetail.RejectionCost : '',
        RejectionTotalCost: CostingRejectionDetail && CostingRejectionDetail.RejectionTotalCost !== null ? CostingRejectionDetail.RejectionTotalCost : '',
    }
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
    }, [])

    useEffect(() => {
        checkRejectionApplicability(applicability.label)
        setTimeout(() => {
            let tempObj = {
                "RejectionApplicabilityId": applicability ? applicability.value : '',
                "RejectionApplicability": applicability ? applicability.label : '',
                "RejectionPercentage": applicability ? getValues('RejectionPercentage') : '',
                "RejectionCost": applicability ? checkForDecimalAndNull(getValues('RejectionCost'), initialConfiguration.NoOfDecimalForPrice) : '',
                "RejectionTotalCost": applicability ? getValues('RejectionTotalCost') : '',
                "IsSurfaceTreatmentApplicable": true,
            }

            if (!CostingViewMode) {
                props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)

    }, [rejectionFieldValues]);


    /**
 * @method renderListing
 * @description RENDER LISTING (NEED TO BREAK THIS)
 */
    const renderListing = (label) => {
        const temp = [];

        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0') return false;
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
            const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
            const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal

            const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + ConversionCostForCalculation


            const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
            const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
            const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation;
            const RejectionPercentage = getValues('RejectionPercentage')

            switch (Text) {
                case 'RM':
                    setValue('RejectionCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice),
                        RejectionTotalCost: checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: headerCosts.NetBoughtOutPartCost,
                        RejectionTotalCost: checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'CC':
                    setValue('RejectionCost', checkForDecimalAndNull(ConversionCostForCalculation, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull(((ConversionCostForCalculation) * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: ConversionCostForCalculation,
                        RejectionTotalCost: checkForDecimalAndNull(((ConversionCostForCalculation) * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'RM + CC + BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(RMBOPCC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RMBOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RMBOPCC,
                        RejectionTotalCost: checkForDecimalAndNull((RMBOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'RM + BOP':
                    setValue('RejectionCost', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RMBOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RMBOP,
                        RejectionTotalCost: checkForDecimalAndNull((RMBOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'RM + CC':
                    setValue('RejectionCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((RMCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: RMCC,
                        RejectionTotalCost: checkForDecimalAndNull((RMCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                case 'BOP + CC':
                    setValue('RejectionCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('RejectionTotalCost', checkForDecimalAndNull((BOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setRejectionObj({
                        ...rejectionObj,
                        RejectionApplicabilityId: applicability.value,
                        RejectionApplicability: applicability.label,
                        RejectionPercentage: RejectionPercentage,
                        RejectionCost: BOPCC,
                        RejectionTotalCost: checkForDecimalAndNull((BOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
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
                        RejectionCost: '-',
                        RejectionTotalCost: checkForDecimalAndNull(RejectionPercentage, initialConfiguration.NoOfDecimalForPrice)
                    })
                    break;

                default:
                    break;
            }
        }

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
                        placeholder={'-Select-'}
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
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.RejectionPercentage}
                            disabled={CostingViewMode ? true : false}
                        />
                        :
                        //THIS FIELD WILL RENDER WHEN REJECTION TYPE FIXED
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
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            // errors={errors.RejectionPercentage}   //MANUAL CSS TO BE APPLIED FOR ERROR VALIDATION MESSAGE
                            disabled={CostingViewMode ? true : false}
                        />}
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