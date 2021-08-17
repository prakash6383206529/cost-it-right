import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, } from '../../../../../helper';
import { getInventoryDataByHeads, gridDataAdded, } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { EMPTY_GUID } from '../../../../../config/constants';
import Switch from "react-switch";

function Icc(props) {

    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingInterestRateDetail } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);

    const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { IsIncludedSurfaceInOverheadProfit } = useSelector(state => state.costing)

    const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)


    const [IsInventoryApplicable, setIsInventoryApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsInventoryCarringCost ? true : false)
    const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : {})

    const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')

    const dispatch = useDispatch()

    const interestRateValues = useWatch({
        control,
        name: ['InterestRatePercentage',],
    });


    /**
     * @method onPressInventory
     * @description  USED TO HANDLE INVENTORY CHANGE
     */
    const onPressInventory = () => {
        setIsInventoryApplicable(!IsInventoryApplicable)
        dispatch(gridDataAdded(true))
    }


    useEffect(() => {
        if (IsInventoryApplicable === true) {
            const reqParams = {
                VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
                IsVendor: costData.IsVendor,
                Plantid: costData.DestinationPlantId ? costData.DestinationPlantId : EMPTY_GUID,
            }
            dispatch(getInventoryDataByHeads(reqParams, res => {
                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    setValue('InterestRatePercentage', Data.InterestRate)
                    setICCInterestRateId(Data.InterestRateId !== null ? Data.InterestRateId : EMPTY_GUID)
                    setICCapplicability({ label: Data.ICCApplicability, value: Data.ICCApplicability })
                    setInventoryObj(Data)
                    checkInventoryApplicability(Data.ICCApplicability)

                } else if (res && res.status === 204) {
                    setValue('InterestRatePercentage', '')
                    setValue('InterestRateCost', '')
                    setValue('NetICCTotal', '')
                    checkInventoryApplicability('')
                    setICCapplicability([])
                    setInventoryObj({})
                }

            }))
        } else {
            setICCapplicability([])
            if (!CostingViewMode) {
                props.setICCDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }
    }, [IsInventoryApplicable])

    /**
    * @description SET VALUE IN NetICCTotal WHEN FIXED AND ENABLED 'InterestRatePercentage'
    */
    useEffect(() => {
        if (ICCapplicability && ICCapplicability.label === 'Fixed') {
            setValue('NetICCTotal', getValues('InterestRatePercentage'))
        }
    }, [interestRateValues])

    /**
      * @method checkInventoryApplicability
      * @description INVENTORY APPLICABILITY CALCULATION
      */
    const checkInventoryApplicability = (Text) => {
        if (headerCosts !== undefined && Text !== '') {

            const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
            const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
            const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
            const InterestRatePercentage = getValues('InterestRatePercentage')

            switch (Text) {
                case 'RM':
                    setValue('InterestRateCost', headerCosts.NetRawMaterialsCost)
                    setValue('NetICCTotal', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'RM + CC':
                    setValue('InterestRateCost', RMCC)
                    setValue('NetICCTotal', checkForDecimalAndNull((RMCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'RM + BOP':
                    setValue('InterestRateCost', RMBOP)
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOP * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'RM + CC + BOP':
                    setValue('InterestRateCost', (RMBOPCC)) //NEED TO ASK HERE ALSO
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'Fixed':
                    setValue('InterestRateCost', '-')
                    setValue('NetICCTotal', checkForDecimalAndNull(InterestRatePercentage, initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'Annual ICC (%)':
                    setValue('InterestRateCost', RMBOPCC) // NEED TO ASK HERE ALSO
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                case 'Net Cost':
                    setValue('InterestRateCost', RMBOPCC) //NEED TO ASK HERE ALSO
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    break;

                default:
                    break;
            }
        }
    }


    useEffect(() => {
        checkInventoryApplicability(ICCapplicability?.label)

        setTimeout(() => {
            let tempObj = {
                "InterestRateId": ICCapplicability.label !== 'Fixed' ? (ICCApplicabilityDetail ? ICCInterestRateId : '') : null,
                "IccDetailId": InventoryObj ? InventoryObj.InterestRateId : '',
                "ICCApplicability": Object.keys(ICCapplicability).length > 0 ? ICCapplicability.label : '',
                "CostApplicability": IsInventoryApplicable ? getValues('InterestRateCost') : '',
                "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
                "NetCost": IsInventoryApplicable ? getValues('NetICCTotal') : '',
                "EffectiveDate": "",
            }

            if (!CostingViewMode) {
                props.setICCDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)
    }, [interestRateValues, IsIncludedSurfaceInOverheadProfit, ICCapplicability]);




    return (
        <>
            <Row className="mt-15 pt-15">
                <Col md="12" className="switch mb-2">
                    <label className="switch-level">
                        <Switch
                            onChange={onPressInventory}
                            checked={IsInventoryApplicable}
                            id="normal-switch"
                            disabled={CostingViewMode ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                        />
                        <div className={'right-title'}>Inventory Carrying Cost</div>
                    </label>
                </Col>
            </Row>

            {IsInventoryApplicable &&
                <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing">
                    <>
                        <Col md="3">
                            <label className="col-label">
                                {ICCapplicability.label}
                            </label>
                        </Col>
                        <Col md="3">
                            {ICCapplicability.label !== 'Fixed' ?
                                <NumberFieldHookForm
                                    label={`Interest Rate (%)`}
                                    name={'InterestRatePercentage'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        pattern: {
                                            value: /^\d*\.?\d*$/,
                                            message: 'Invalid Number.'
                                        },
                                        max: {
                                            value: 100,
                                            message: 'Percentage cannot be greater than 100'
                                        },
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.InterestRatePercentage}
                                    disabled={(CostingViewMode || ICCapplicability.label !== 'Fixed') ? true : false}
                                />
                                :
                                <NumberFieldHookForm
                                    label={`Interest Rate`}
                                    name={'InterestRatePercentage'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        pattern: {
                                            value: /^\d*\.?\d*$/,
                                            message: 'Invalid Number.'
                                        },
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.InterestRatePercentage}
                                    disabled={CostingViewMode ? true : false}
                                />}
                        </Col>
                        {ICCapplicability.label !== 'Fixed' &&
                            <Col md="3">
                                <TextFieldHookForm
                                    label="Cost(Applicability)"
                                    name={'InterestRateCost'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.InterestRateCost}
                                    disabled={true}
                                />
                            </Col>}
                        <Col md="3">
                            <TextFieldHookForm
                                label="Net ICC"
                                name={'NetICCTotal'}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.NetICCTotal}
                                disabled={true}
                            />
                        </Col>
                    </>
                </Row>
            }
        </>
    );
}

export default Icc;