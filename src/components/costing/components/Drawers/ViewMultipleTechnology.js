import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull, getConfigurationKey, showBopLabel } from '../../../../helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { BOUGHTOUTPART, CBCTypeId, EMPTY_DATA, VBCTypeId } from '../../../../config/constants'
import { useDispatch, useSelector } from 'react-redux'
import EditPartCost from '../CostingHeadCosts/SubAssembly/EditPartCost'
import { reactLocalStorage } from 'reactjs-localstorage'
import { setCostingViewData } from '../../actions/Costing'
import { useLabels } from '../../../../helper/core'
import ViewMultipleTechnologyBOP from './ViewMultipleTechnologyBOP'

function ViewMultipleTechnology(props) {
    const { multipleTechnologyData, isPDFShow } = props
    const [viewMultiCost, setViewMultiCost] = useState(multipleTechnologyData || [])
    const [costingDetailId, setCostingDetailId] = useState('')
    const [openDrawer, setOpemDrawer] = useState(false)
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const partNumber = useSelector(state => state.costing.partNo);
    const [costingTypeId, setCostingTypeId] = useState(props?.costingTypeId)
    const dispatch = useDispatch()
    const { technologyLabel, vendorLabel } = useLabels();
    useEffect(() => {
        setViewMultiCost(multipleTechnologyData)
    }, [multipleTechnologyData])
    /**
     * @method toggleDrawer
     * @description closing drawer
     */
    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('')
    }
    const viewCosting = (id) => {
        setCostingDetailId(id)
        setOpemDrawer(true)
        const isSamePart = viewCostingData?.filter((item) => item?.partNumber === partNumber?.partNumber)
        if (isSamePart?.length > 0) {
            reactLocalStorage.setObject('viewCostingData', viewCostingData)
            dispatch(setCostingViewData([]))
        }
    }
    const closeDrawerPartCost = (e = '') => {
        setOpemDrawer(false)
        let tempObj = reactLocalStorage.getObject('viewCostingData')
        dispatch(setCostingViewData(tempObj))
        setTimeout(() => {
            reactLocalStorage.setObject('viewCostingData', [])
        }, 300);
    }

    // Helper function to get the data to display
    const getDisplayData = () => {
        if (viewMultiCost && viewMultiCost.length > 0) {
            return viewMultiCost;
        }
        return multipleTechnologyData || [];
    }

    const multipleCost = () => {
        const displayData = getDisplayData();
        return <>
            <Row>
                <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                        <thead>
                            <tr>
                                {props?.costingTypeId === VBCTypeId &&
                                    <th>{`${vendorLabel} (Code)`}</th>}
                                {props?.costingTypeId === CBCTypeId &&
                                    <th>{`Customer (Code)`}</th>}
                                <th>{`Costing Number`}</th>
                                <th>{`Part/BOP Number`}</th>
                                <th>{`Name`}</th>
                                <th>{`Part Type`}</th>
                                <th>{technologyLabel}</th>
                                <th>{`Quantity`}</th>
                                <th>{`Part Cost/Pc`}</th>
                                <th>{`${showBopLabel()} Cost`}</th>
                                <th>{`Part Cost/Assembly`}</th>
                                <th>{`Remark`}</th>
                                <th className="costing-border-right">{`Action`}</th>
                            </tr >
                        </thead >
                        <tbody>
                            {displayData &&
                                displayData.map((item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr>
                                                {props?.costingTypeId === VBCTypeId &&
                                                    <th>{`${item?.VendorName} (${item?.VendorCode})`}</th>}
                                                {props?.costingTypeId === CBCTypeId &&
                                                    <td>{`${item?.CustomerName} (${item?.CustomerCode})`}</td>}
                                                <td className={`${isPDFShow ? '' : ''}`}><span title={item?.CostingNumber}>{item?.PartType === 'BOP' ? "-" : item?.CostingNumber}</span></td>
                                                <td className={`${isPDFShow ? '' : ''}`}><span title={item?.PartNumber}>{item?.PartNumber}</span></td>
                                                <td className={`${isPDFShow ? '' : ''}`}><span title={item?.PartName}>{item?.PartName}</span></td>
                                                <td className={`${isPDFShow ? '' : ''}`}><span title={item?.PartTypeName}>{item?.PartTypeName}</span></td>

                                                <td className={`${isPDFShow ? '' : ''}`}>
                                                    {(item?.PartTypeName === 'BoughtOutPart') ? <span >{'-'}</span> : <span title={item?.TechnologyName}>{item?.TechnologyName}</span>}
                                                </td>

                                                <td> {item?.Quantity}</td>
                                                <td>
                                                    {checkForDecimalAndNull(item?.PartTypeName === 'BOP' ? "-" : item?.NetChildPartsCost, initialConfiguration?.NoOfDecimalForPrice)}
                                                </td>
                                                <td>
                                                    {checkForDecimalAndNull(item?.PartTypeName === 'BOP' ? item?.NetBoughtOutPartCost : item?.NetBoughtOutPartCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice)}
                                                </td>
                                                <td>
                                                    {checkForDecimalAndNull(item?.PartTypeName === 'BOP' ? item?.NetBoughtOutPartCostWithQuantity : item?.NetChildPartsCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice)}
                                                </td>
                                                <td>
                                                    {item?.PartTypeName === 'BOP' ? item?.Remark : '-'}
                                                </td>
                                                <td> {!isPDFShow && <button
                                                    type="button"
                                                    title='View'
                                                    className="float-right mb-0 View "
                                                    onClick={() => viewCosting(item)}
                                                > </button>}</td>
                                            </tr >

                                            {isPDFShow && item?.CostingWeightedAverageSettledDetailsResponse && item?.CostingWeightedAverageSettledDetailsResponse?.CostingWeightedAverageSettledDetails &&
                                                item?.CostingWeightedAverageSettledDetailsResponse?.CostingWeightedAverageSettledDetails &&
                                                item?.CostingWeightedAverageSettledDetailsResponse?.CostingWeightedAverageSettledDetails.length > 0 &&
                                                <>
                                                    <tr>
                                                        <td colSpan={12}>
                                                            <ViewMultipleTechnologyBOP
                                                                costingTypeId={props?.costingTypeId}
                                                                data={item?.CostingWeightedAverageSettledDetailsResponse?.CostingWeightedAverageSettledDetails}
                                                                viewCostingData={props?.viewCostingData}
                                                                index={index}
                                                            />
                                                        </td>
                                                    </tr>
                                                </>
                                            }
                                        </React.Fragment>
                                    )
                                })}
                            {
                                displayData?.length === 0 && (
                                    <tr>
                                        <td colSpan={9}>
                                            <NoContentFound title={EMPTY_DATA} />
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody >
                    </Table >
                </Col >
            </Row >
        </>
    }
    return (
        <Fragment>
            {!isPDFShow ?
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => toggleDrawer(e)}
                >
                    <Container>
                        <div className={'drawer-wrapper drawer-1500px'}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{`View Multiple ${technologyLabel} cost:`}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={'close-button right'}
                                    ></div>
                                </Col>
                            </Row>
                            {multipleCost()}


                        </div>
                    </Container>
                </Drawer> : 
                <div className='mt-2'>
                    {getDisplayData() && getDisplayData()?.length > 0 && multipleCost()}
                </div>
            }
            {openDrawer && <EditPartCost
                isOpen={openDrawer}
                closeDrawer={closeDrawerPartCost}
                anchor={'right'}
                tabAssemblyIndividualPartDetail={costingDetailId}
                costingSummary={true}
                costingTypeId={costingTypeId}
                index={props?.index}
                simulationMode={props?.simulationMode}
                SimulationId={props?.SimulationId}
                viewCostingData={props?.viewCostingData}
                isBopEdit={costingDetailId?.PartTypeName === 'BOP' ? true : false}
            />}

        </Fragment>
    )
}

export default React.memo(ViewMultipleTechnology)
