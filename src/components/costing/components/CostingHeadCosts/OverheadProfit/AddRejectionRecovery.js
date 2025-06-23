import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { number, percentageLimitValidation, checkWhiteSpaces, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import { REJECTION_RECOVERY_APPLICABILITY } from '../../../../../config/masterData';
import { setRejectionRecoveryData } from '../../../actions/Costing';
import TooltipCustom from '../../../../common/Tooltip';
import { IsPartType, ViewCostingContext } from '../../CostingDetails';
import { COMPONENT_PART } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import { useLabels } from '../../../../../helper/core';

function AddRejectionRecovery(props) {

    const { rejectionPercentage, isOpen, closeDrawer, rejectionTotalCost, isViewRejectionRecovery, partType, IsMultiVendorCosting } = props;

    const defaultValues = {

    }
    const { finishWeightLabel } = useLabels()

    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {},
    });
    const { rejectionRecovery, RMCCTabData } = useSelector(state => state.costing)
    const { CostingPartDetails } = RMCCTabData[0]
    const isPartType = useContext(IsPartType);
    const [state, setState] = useState({
        rejectionApplicabilityTypeValue: rejectionRecovery?.ApplicabilityIdRef,
        rejectionApplicabilityType: rejectionRecovery?.ApplicabilityType,
        rejectionRecoveryPercentage: rejectionRecovery?.Value,
        effectiveRecoveryPercentage: rejectionRecovery?.EffectiveRecoveryPercentage,
        recoveryCostApplicability: rejectionRecovery?.ApplicabilityCost,
        netRejectionRecovery: rejectionRecovery?.RejectionRecoveryNetCost,
    }
    )
    const [isReset, setIsReset] = useState(false)
    const CostingViewMode = useContext(ViewCostingContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const dispatch = useDispatch()
    const costingHead = useSelector(state => state.comman.costingHead)
    useEffect(() => {
        dispatch(fetchCostingHeadsAPI('rejectionrecovery', false, false, (res) => { }))
    }, [])
    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        const temp = [];

        const normalize = (str) => str.replace(/\s+/g, ' ').trim();
        if (label === 'recoveryApplicability') {
            costingHead && costingHead?.map(item => {
                if (item.Value === '0') return false;
                if (partType !== COMPONENT_PART && normalize(item.Text) === "ScrapRate * NetWeight")
                    return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    const HandleRejectionRecovery = (e) => {
        if (e !== null) {
            setState({
                ...state,
                rejectionApplicabilityType: e.label,
                rejectionApplicabilityTypeValue: e.value,
                netRejectionRecovery: '',
                rejectionRecoveryPercentage: '',
                effectiveRecoveryPercentage: '',
                recoveryCostApplicability: '',
            })
        } else {
            setState({
                ...state,
                rejectionApplicabilityTypeValue: '',
                rejectionApplicabilityType: '',
            })
        }
        setState({
            ...state,
            rejectionApplicabilityType: e.label,
            rejectionApplicabilityTypeValue: e.value,
            netRejectionRecovery: '',
            rejectionRecoveryPercentage: '',
            effectiveRecoveryPercentage: '',
            recoveryCostApplicability: '',
        })
        setValue('NetRejectionRecovery', '');
        setValue('RejectionRecoveryPercentage', '')
        setValue('EffectiveRecoveryPercentage', '')
        setValue('RecoveryCostApplicability', '')
    }

    useEffect(() => {
        if (Object.keys(rejectionRecovery).length > 0) {
            setValue('RejectionRecoveryApplicability', rejectionRecovery?.ApplicabilityType ? { label: rejectionRecovery?.ApplicabilityType, value: rejectionRecovery?.ApplicabilityIdRef } : '')
            setValue('RejectionRecoveryPercentage', checkForDecimalAndNull(rejectionRecovery?.Value, initialConfiguration?.NoOfDecimalForPrice))
            setValue('EffectiveRecoveryPercentage', checkForDecimalAndNull(rejectionRecovery?.EffectiveRecoveryPercentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('RecoveryCostApplicability', checkForDecimalAndNull(rejectionRecovery?.ApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('NetRejectionRecovery', checkForDecimalAndNull(rejectionRecovery?.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice))
            setIsReset(rejectionRecovery?.RejectionRecoveryNetCost ? true : false)
        }
    }, [rejectionRecovery])

    const handlePercentage = (e) => {
        const EffectiveRecovery = checkForNull(rejectionPercentage) * checkForNull(e.target.value) / 100
        let CostApplicability = 0
        CostingPartDetails.CostingRawMaterialsCost?.map(item => {
            CostApplicability += checkForNull(item.ScrapRate) * checkForNull(item.FinishWeight)
        })
        setValue('EffectiveRecoveryPercentage', checkForDecimalAndNull(EffectiveRecovery, initialConfiguration?.NoOfDecimalForPrice))
        setValue('RecoveryCostApplicability', checkForDecimalAndNull(CostApplicability, initialConfiguration?.NoOfDecimalForPrice))
        setValue('NetRejectionRecovery', checkForDecimalAndNull(CostApplicability * EffectiveRecovery / 100, initialConfiguration?.NoOfDecimalForPrice))

        setState({
            ...state,
            rejectionRecoveryPercentage: e.target.value,
            effectiveRecoveryPercentage: EffectiveRecovery,
            recoveryCostApplicability: CostApplicability,
            netRejectionRecovery: CostApplicability * EffectiveRecovery / 100
        })
        // props.calculateRecoveryCost(rejectionPercentage, e.target.value)
    }
    const handleNetrejectionCost = (e) => {
        setState({
            ...state,
            rejectionRecoveryPercentage: '',
            effectiveRecoveryPercentage: '',
            recoveryCostApplicability: '',
            netRejectionRecovery: e.target.value
        })
    }
    const onSubmit = data => {
        if (checkForNull(state.netRejectionRecovery) > checkForNull(rejectionTotalCost)) {
            Toaster.warning('Net Rejection Recovery Cost should be less than Rejection Total Cost')
            return
        }
        let rejectionRecoveryObj = {
            ApplicabilityIdRef: state.rejectionApplicabilityTypeValue,
            ApplicabilityType: state.rejectionApplicabilityType,
            Value: Number(state.rejectionRecoveryPercentage),
            EffectiveRecoveryPercentage: state.effectiveRecoveryPercentage,
            ApplicabilityCost: state.recoveryCostApplicability,
            RejectionRecoveryNetCost: state.netRejectionRecovery
        }
        dispatch(setRejectionRecoveryData(rejectionRecoveryObj))
        setTimeout(() => {
            closeDrawer('submit', state.netRejectionRecovery,rejectionRecoveryObj)
        }, 500);
    }

    const cancel = () => {
        closeDrawer('cancel')
    }
    const ResetAndSave = () => {
        closeDrawer('submit', 0,{})
        dispatch(setRejectionRecoveryData({
            ApplicabilityIdRef: 0,
            ApplicabilityType: '',
            Value: '',
            EffectiveRecoveryPercentage: '',
            ApplicabilityCost: '',
            RejectionRecoveryNetCost: ''
        }))
    }
    const applicabilityTooltip = () => {
        const rmData = CostingPartDetails?.CostingRawMaterialsCost ?? [];
        if (rmData?.length === 0) {
            return { tooltipText: false, width: '0' };
        } else if (rmData?.length === 1) {
            return { tooltipText: `Cost Applicability = RM Scrap Rate (${rmData && rmData[0]?.ScrapRate}) * RM ${finishWeightLabel} Weight (${rmData && rmData[0]?.FinishWeight}${rmData && rmData[0]?.UOMSymbol})`, width: '280px' };
        } else {
            return { tooltipText: `Cost Applicability = (RM Scrap Rate (${rmData && rmData[0]?.ScrapRate}) * RM ${finishWeightLabel} Weight (${rmData && rmData[0]?.FinishWeight}${rmData && rmData[0]?.UOMSymbol})) + (RM Scrap Rate (${rmData && rmData[1]?.ScrapRate}) * RM ${finishWeightLabel} Weight (${rmData && rmData[1]?.FinishWeight}${rmData && rmData[1]?.UOMSymbol}))...`, width: '380px' };
        }
    }
    return (
        <div>
            <Drawer anchor={'right'} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper freight-drawer'}>

                        <Row className="drawer-heading">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{'Add Rejection Recovery'}</h3>
                                </div>
                                <div
                                    onClick={cancel}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
                            <>
                                <Row className="ml-0">
                                    <Col md="12">
                                        <SearchableSelectHookForm
                                            label={'Rejection Recovery Applicability'}
                                            name={'RejectionRecoveryApplicability'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            isClearable={true}
                                            defaultValue={''}
                                            options={renderListing('recoveryApplicability')}
                                            mandatory={true}
                                            handleChange={HandleRejectionRecovery}
                                            errors={errors.RejectionRecoveryApplicability}
                                            disabled={(CostingViewMode || isViewRejectionRecovery) ? true : false}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <TextFieldHookForm
                                            label={`Rejection Recovery (%)`}
                                            name={'RejectionRecoveryPercentage'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={state.rejectionApplicabilityType !== 'Fixed'}
                                            rules={{
                                                required: state.rejectionApplicabilityType !== 'Fixed',
                                                validate: number, checkWhiteSpaces, percentageLimitValidation,
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage should be less than 100'
                                                },
                                            }}
                                            handleChange={handlePercentage}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RejectionRecoveryPercentage}
                                            disabled={(state.rejectionApplicabilityType === 'Fixed' || CostingViewMode || isViewRejectionRecovery) ? true : false}
                                        />
                                    </Col>


                                    <Col md="12">
                                        {state.rejectionApplicabilityType !== 'Fixed' && <TooltipCustom disabledIcon={true} width="280px" tooltipClass={""} id={'EffectiveRecoveryPercentage'} tooltipText={'Effective Recovery = Rejection Percentage * Recovery Percentage / 100'} />}
                                        <TextFieldHookForm
                                            label="Effective Recovery (%)"
                                            name={'EffectiveRecoveryPercentage'}
                                            id={'EffectiveRecoveryPercentage'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.EffectiveRecoveryPercentage}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="12">
                                        {applicabilityTooltip().tooltipText && state.rejectionApplicabilityType !== 'Fixed' && <TooltipCustom disabledIcon={true} width={applicabilityTooltip().width} tooltipClass={""} id={'RecoveryCostApplicability'} tooltipText={applicabilityTooltip().tooltipText} />}
                                        <TextFieldHookForm
                                            label="Cost Applicability"
                                            name={'RecoveryCostApplicability'}
                                            id={'RecoveryCostApplicability'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RecoveryCostApplicability}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="12">
                                        {state.rejectionApplicabilityType !== 'Fixed' && <TooltipCustom disabledIcon={true} tooltipClass={""} id={'NetRejectionRecovery'} width="280px" tooltipText={"Net Rejection Recovery = Cost Applicability * Effective Recovery Percentage / 100"} />}
                                        <TextFieldHookForm
                                            label="Net Rejection Recovery Cost"
                                            name={'NetRejectionRecovery'}
                                            id="NetRejectionRecovery"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                                            }}
                                            handleChange={(e) => handleNetrejectionCost(e)}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.NetRejectionRecovery}
                                            disabled={(state.rejectionApplicabilityType !== 'Fixed' || CostingViewMode || isViewRejectionRecovery) ? true : false}
                                        />
                                    </Col>

                                </Row>

                                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                                    <div className="col-sm-12 d-flex justify-content-between bluefooter-butn">
                                        <button
                                            id="AddRejectionRecovery_Reset"
                                            type={'button'}
                                            className="undo cancel-btn"
                                            onClick={ResetAndSave}
                                            disabled={CostingViewMode || !isReset || isViewRejectionRecovery} >
                                            <div className={"undo-icon"}></div> {'Reset & Save'}
                                        </button>

                                        <div>
                                            <button
                                                id="AddRejectionRecovery_Cancel"
                                                type={'button'}
                                                className="reset mr15 cancel-btn"
                                                onClick={cancel}
                                            >
                                                <div className={"cancel-icon"}></div> {'Cancel'}
                                            </button>

                                            <button
                                                id="AddRejectionRecovery_Save"
                                                type={'submit'}
                                                className="submit-button save-btn"
                                                disabled={CostingViewMode || isViewRejectionRecovery} >
                                                <div className={"save-icon"}></div>
                                                {'Save'}
                                            </button>
                                        </div>

                                    </div>
                                </Row>
                            </>
                        </form>

                    </div>
                </Container>
            </Drawer>
        </div>
    );
}

export default React.memo(AddRejectionRecovery);
