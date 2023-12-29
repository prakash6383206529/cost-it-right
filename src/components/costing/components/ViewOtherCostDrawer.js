import React, { useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { useForm, } from 'react-hook-form'
import { useSelector, } from 'react-redux'
import NpvCost from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/NpvCost'
import ConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/ConditionCosting'
import HeaderTitle from '../../common/HeaderTitle'
import LoaderCustom from '../../common/LoaderCustom'
import YOYCost from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/YOYCost'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA } from '../../../config/constants'
import { checkForDecimalAndNull, checkForNull } from '../../../helper'

function ViewOtherCostDrawer(props) {
    const { partId, vendorId, costingIndex } = props
    const [tableData, setTableData] = useState(props.tableData)
    const [conditionTableData, seConditionTableData] = useState([])
    const [costingSummary, setCostingSummary] = useState(props.costingSummary ? props.costingSummary : false)
    const [gridData, setgridData] = useState([]);
    const [totalOtherCost, setTotalOtherCost] = useState(0);
    const [isLoader, setIsLoader] = useState(false)
    const [discountData, setDiscountData] = useState([])
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        if (props.costingSummary) {
            setIsLoader(true)
            setTableData(viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingNpvResponse)
            let Data = viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingConditionResponse
            let temp = []
            Data && Data.map((item) => {
                // item.ConditionPercentage = item.Percentage
                item.condition = `${item.Description} (${item.CostingConditionNumber})`
                temp.push(item)
            })
            seConditionTableData(temp)
            setIsLoader(false)

            let tempNew = []
            let totalCost = 0
            viewCostingData && viewCostingData[costingIndex]?.CostingPartDetails?.OtherCostDetails && viewCostingData[costingIndex].CostingPartDetails.OtherCostDetails.map((item) => {

                totalCost = checkForNull(totalCost) + checkForNull(item.NetCost)
                let obj = {}
                obj.OtherCostDescription = item.Description
                obj.OtherCostApplicability = item.ApplicabilityType
                obj.PercentageOtherCost = item.Value ? item.Value : '-'
                obj.AnyOtherCost = item.NetCost
                tempNew.push(obj)
            })
            setTotalOtherCost(totalCost)
            setgridData(tempNew)
            let discountTable = []
            viewCostingData && viewCostingData[costingIndex]?.CostingPartDetails?.DiscountCostDetails && viewCostingData[costingIndex].CostingPartDetails.DiscountCostDetails.map((item) => {
                let obj = {}
                obj.DiscountDescription = item.Description
                obj.DiscountApplicability = item.ApplicabilityType
                obj.Percentage = item.Value ? item.Value : '-'
                obj.Value = item.NetCost
                discountTable.push(obj)
            })
            setDiscountData(discountTable)
        }

    }, [])

    const cancel = () => {
        props.closeDrawer('Close')
    }
    const DiscountCost = () => {
        return (<>
            <Col md="12">
                <HeaderTitle className="border-bottom"
                    title={'Discount Cost'}
                    customClass={'underLine-title'}
                />
            </Col>
            <Col md="12">
                <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                    <thead>
                        <tr>
                            <th className='custom-max-width-220px'>{`Discount Description/Remark`}</th>
                            <th>{`Discount Applicability`}</th>
                            <th>{`Percentage (%)`}</th>
                            <th>{'Value'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discountData && discountData.map((item, index) => {
                            return (
                                <tr key={index} >
                                    <td className='custom-max-width-220px'>{item?.DiscountDescription}</td>
                                    <td>{item?.DiscountApplicability}</td>
                                    <td>{String(item?.DiscountApplicability) === String('Fixed') ? '-' : item.Percentage}</td>
                                    <td>{checkForDecimalAndNull(item.Value, initialConfiguration.NoOfDecimalForPrice)}</td>
                                </tr>
                            );
                        })}
                        {discountData.length === 0 && <tr>
                            <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr>}
                    </tbody>
                </Table>
            </Col>
        </>)
    }

    const OtherCost = () => {
        return (<>
            <Col md="12" className='mt-4'>
                <HeaderTitle className="border-bottom"
                    title={'Other Cost'}
                    customClass={'underLine-title'}
                />
            </Col>
            <Col md="12">
                <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                    <thead>
                        <tr>
                            <th>{`Other Cost Description`}</th>
                            <th>{`Other Cost Applicability`}</th>
                            <th>{'Percentage (%)'}</th>
                            <th>{`Cost`}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gridData && gridData.map((item, index) => {
                            return (
                                <tr key={index} >
                                    <td>{item.OtherCostDescription}</td>
                                    <td>{item?.OtherCostApplicability}</td>
                                    <td>{String(item?.OtherCostApplicability) === String('Fixed') ? '-' : item.PercentageOtherCost}</td>
                                    <td>{checkForDecimalAndNull(item.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                </tr>
                            );
                        })}
                        {gridData.length === 0 ? <tr>
                            <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr> :
                            <tr className='table-footer'>
                                <td className='text-right' colSpan={3}>Total Other Cost:</td>
                                <td colSpan={2}>{checkForDecimalAndNull(totalOtherCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                            </tr>}
                    </tbody>
                </Table>
            </Col>
        </>)
    }
    return (

        <div>
            {!props.isPDFShow ? <Drawer anchor={props.anchor} open={props.isOpen}
            >
                {isLoader && <LoaderCustom />}
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-820px'}>

                            <Row className="drawer-heading">
                                <Col className='pl-0'>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Discount & Other Cost'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className='hidepage-size'>
                                {costingSummary && DiscountCost()}
                                {costingSummary && OtherCost()}
                                {/* {initialConfiguration?.IsShowNpvCost && costingSummary &&
                                    <>
                                        <Col md="12" className='mt-4'>
                                            <HeaderTitle className="border-bottom"
                                                title={'NPV Cost'}
                                                customClass={'underLine-title'}
                                            />
                                        </Col>
                                    </>
                                }
                                {initialConfiguration?.IsShowNpvCost && costingSummary && <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} />} */}
                                {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingSummary && !props?.isRfqCosting &&
                                    <div className='firefox-spaces pb-3'>
                                        <Col md="12" className={'mt-4 firefox-spaces '}>
                                            <HeaderTitle className="border-bottom firefox-spaces"
                                                title={'Costing Condition'}
                                                customClass={'underLine-title'}
                                            />
                                        </Col>
                                        <ConditionCosting hideAction={true} tableData={conditionTableData} />
                                    </div>}

                                {costingSummary && props?.isRfqCosting &&
                                    <div className={'mt-4 pb-1'}>
                                        <Col md="12" className={'mt25 pb-15'}>
                                            <HeaderTitle className="border-bottom"
                                                title={'YOY'}
                                                customClass={'underLine-title'}
                                            />
                                        </Col>
                                        <YOYCost
                                            outside={true}
                                            NetPOPrice={props.netPOPrice}
                                            setValue={setValue}
                                            getValues={getValues}
                                            control={control}
                                            register={register}
                                            errors={errors}
                                            activeTab={'6'}
                                            patId={partId}
                                            vendorId={vendorId}
                                            hideAddButton={true}
                                        />
                                    </div>}
                            </div>
                        </div>
                    </Container>
                </div>
            </Drawer> : <>
                {gridData && gridData.length !== 0 && OtherCost()}
                {/* {tableData && tableData.length !== 0 && <>
                    <Col md="12">
                        <HeaderTitle className="border-bottom"
                            title={'NPV Cost'}
                            customClass={'underLine-title'}
                        />
                    </Col>
                    <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} />
                </>} */}
                {conditionTableData && conditionTableData.length !== 0 && <> <Col md="12" className={'mt25 firefox-10'}>
                    <HeaderTitle className="border-bottom"
                        title={'Costing Condition'}
                        customClass={'underLine-title'}
                    />
                </Col>
                    <ConditionCosting hideAction={true} tableData={conditionTableData} />
                </>}
            </>}
        </div >

    )
}
export default React.memo(ViewOtherCostDrawer)