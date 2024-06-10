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

function AddRejectionRecovery(props) {

    const { rejectionPercentage, isOpen, closeDrawer } = props;

    const defaultValues = {

    }

    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {},
    });
    const { rejectionRecovery, RMCCTabData } = useSelector(state => state.costing)
    const { CostingPartDetails } = RMCCTabData[0]

    const [state, setState] = useState({
        rejectionApplicabilityType: rejectionRecovery.rejectionApplicabilityType,
        rejectionRecoveryPercentage: rejectionRecovery.rejectionRecoveryPercentage,
        effectiveRecoveryPercentage: rejectionRecovery.effectiveRecoveryPercentage,
        recoveryCostApplicability: rejectionRecovery.recoveryCostApplicability,
        netRejectionRecovery: rejectionRecovery.rejectionRecoveryCost,
    }
    )
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const dispatch = useDispatch()

    const headCostData = useContext(netHeadCostContext)
    const costData = useContext(costingInfoContext);

    const costingHead = useSelector(state => state.comman.costingHead)






    const toggleDrawer = (event, formData = {}) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('', formData)
    };






    /**
     * @method calculateCost
     * @description APPLICABILITY CALCULATION
     */
    // MAY BE USED LATER 

    /**
     * @method calculateApplicabilityCost
     * @description APPLICABILITY CALCULATION
     */

    // WILL BE USED LATER FOR OTHER RADIO BUTON CALCULATION
    /**
      * @method IsPartTruckToggle
      * @description FREIGHT TYPE 
      */


    /**
    * @method onPressHeads
    * @description FREIGHT FLAG
    */


    /**
    * @method cancel
    * @description used to Reset form
    */
    const HandleRejectionRecovery = (e) => {

    }

    useEffect(() => {
        if (Object.keys(rejectionRecovery).length > 0) {
            setValue('RejectionRecoveryApplicability', rejectionRecovery.rejectionApplicabilityType && rejectionRecovery.rejectionApplicabilityType.label, initialConfiguration.NoOfDecimalForPrice)
            setValue('RejectionRecoveryPercentage', checkForDecimalAndNull(rejectionRecovery.rejectionRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice))
            setValue('EffectiveRecoveryPercentage', checkForDecimalAndNull(rejectionRecovery.effectiveRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice))
            setValue('RecoveryCostApplicability', checkForDecimalAndNull(rejectionRecovery.recoveryCostApplicability, initialConfiguration.NoOfDecimalForPrice))
            setValue('NetRejectionRecovery', checkForDecimalAndNull(rejectionRecovery.rejectionRecoveryCost, initialConfiguration.NoOfDecimalForPrice))
        }
    }, [rejectionRecovery])

    const handlePercentage = (e) => {
        const EffectiveRecovery = checkForNull(rejectionPercentage) * checkForNull(e.target.value) / 100
        let CostApplicability = 0
        CostingPartDetails.CostingRawMaterialsCost.map(item => {
            CostApplicability += checkForNull(item.ScrapRate) * checkForNull(item.FinishWeight)
        })
        setValue('EffectiveRecoveryPercentage', checkForDecimalAndNull(EffectiveRecovery, initialConfiguration.NoOfDecimalForPrice))
        setValue('RecoveryCostApplicability', checkForDecimalAndNull(CostApplicability, initialConfiguration.NoOfDecimalForPrice))
        setValue('NetRejectionRecovery', checkForDecimalAndNull(CostApplicability * EffectiveRecovery / 100, initialConfiguration.NoOfDecimalForPrice))

        setState({
            ...state,
            rejectionApplicabilityType: getValues('RejectionRecoveryApplicability'),
            rejectionRecoveryPercentage: e.target.value,
            effectiveRecoveryPercentage: EffectiveRecovery,
            recoveryCostApplicability: CostApplicability,
            netRejectionRecovery: CostApplicability * EffectiveRecovery / 100
        })
        // props.calculateRecoveryCost(rejectionPercentage, e.target.value)
    }
    const onSubmit = data => {
        closeDrawer('submit', state.netRejectionRecovery)
        dispatch(setRejectionRecoveryData({
            rejectionApplicabilityType: state.rejectionApplicabilityType,
            rejectionRecoveryPercentage: state.rejectionRecoveryPercentage,
            effectiveRecoveryPercentage: state.effectiveRecoveryPercentage,
            recoveryCostApplicability: state.recoveryCostApplicability,
            rejectionRecoveryCost: state.netRejectionRecovery,
        }))
    }

    const cancel = () => {
        closeDrawer('cancel')
    }
    return (
        <div>
            <Drawer anchor={'right'} open={isOpen}
            >
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
                                            defaultValue={''}
                                            options={REJECTION_RECOVERY_APPLICABILITY}
                                            mandatory={true}
                                            handleChange={HandleRejectionRecovery}
                                            errors={errors.RejectionRecoveryApplicability}
                                            disabled={false}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <TextFieldHookForm
                                            label={`Rejection Recovery (%)`}
                                            name={'RejectionRecoveryPercentage'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
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
                                            disabled={false}
                                        />
                                    </Col>


                                    <Col md="12">
                                        <TextFieldHookForm
                                            label="Effective Recovery %"
                                            name={'EffectiveRecoveryPercentage'}
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
                                        <TextFieldHookForm
                                            label="Cost (Applicability)"
                                            name={'RecoveryCostApplicability'}
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
                                        <TextFieldHookForm
                                            label="Net Rejection Recovery Cost"
                                            name={'NetRejectionRecovery'}
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
                                            errors={errors.NetRejectionRecovery}
                                            disabled={true}
                                        />
                                    </Col>

                                </Row>

                                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                                    <div className="col-sm-12 text-right bluefooter-butn">
                                        <button
                                            id="AddRejectionRecovery_Cancel"
                                            type={'button'}
                                            className="reset mr15 cancel-btn"
                                            onClick={cancel} >
                                            <div className={"cancel-icon"}></div> {'Cancel'}
                                        </button>

                                        <button
                                            id="AddRejectionRecovery_Save"
                                            type={'submit'}
                                            className="submit-button save-btn">
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
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