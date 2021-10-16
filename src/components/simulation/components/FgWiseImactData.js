import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFgWiseImpactData } from '../actions/Simulation'
import { getConfigurationKey } from '../../../helper'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, } from '../../../helper'
import { EMPTY_GUID } from '../../../config/constants'
import SimulationApprovalSummary from './SimulationApprovalSummary'



export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [acc2, setAcc2] = useState(false)
    const [showTableData, setshowTableData] = useState(false)
    const [displayCompareCosting, setdisplayCompareCosting] = useState(false)
    const { SimulationId } = props
    const dispatch = useDispatch()

    const impactData = useSelector((state) => state.simulation.impactData)



    useEffect(() => {

        if (SimulationId) {

            dispatch(getFgWiseImpactData(SimulationId, () => { setshowTableData(true) }))
        }


    }, [SimulationId])

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    // const DisplayCompareCosting = (el, data) => {
    //     setId(data.CostingNumber)
    //     // setCompareCostingObj(el)
    //     let obj = {
    //         simulationApprovalProcessSummaryId: el,
    //         simulationId: EMPTY_GUID,
    //         costingId: EMPTY_GUID
    //     }
    //     dispatch(getComparisionSimulationData(obj, res => {
    //         const Data = res.data.Data
    //         const obj1 = formViewData(Data.OldCosting)
    //         const obj2 = formViewData(Data.NewCosting)
    //         const obj3 = formViewData(Data.Variance)
    //         const objj3 = [obj1[0], obj2[0], obj3[0]]
    //         setCompareCostingObj(objj3)
    //         dispatch(setCostingViewData(objj3))
    //         setCompareCosting(true)
    //     }))
    // }




    return (
        <>
            {/* FG wise Impact section start */}

            <Row className="mb-3">
                <Col md="12">
                    <div className="table-responsive">
                        <table className="table cr-brdr-main accordian-table-with-arrow">
                            <thead>
                                <tr>
                                    <th><span>Part Number</span></th>
                                    <th><span>Rev Number/ECN Number</span></th>
                                    <th><span>Part Name</span></th>
                                    <th><span>Old Cost/Pc</span></th>
                                    <th><span>New Cost/pc</span></th>
                                    <th><span>Quantity</span></th>
                                    <th><span>Impact/Pc</span></th>


                                    <th><span>Volume/Year</span></th>
                                    <th><span>Impact/Quater</span></th>
                                    <th><span>Impact/Year</span></th>
                                    <th><span></span></th>
                                </tr>
                            </thead>


                            {showTableData && impactData && impactData.map((item, index) => {

                                return (<>
                                    <tbody>
                                        <tr className="accordian-with-arrow">
                                            <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(index)}></div>{item.PartNumber ? item.PartNumber : "-"}</span></td>
                                            <td><span>{item.ECNNumber}</span></td>
                                            <td><span>{item.PartName}</span></td>
                                            <td><span>{item.OldCost}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.NewCost, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span>{item.Quantity}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.VariancePerPiece, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                            <td><span>{item.VolumePerYear == null ? "" : item.VolumePerYear}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.ImpactPerQuater, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span> {checkForDecimalAndNull(item.ImpactPerYear, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span> </span><a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></td>

                                        </tr>


                                        {acc1.currentIndex === index && acc1.isClicked && item.childPartsList.map((item) => {

                                            return (
                                                <tr className="accordian-content">
                                                    <td><span>{item.PartNumber}</span></td>
                                                    <td><span>{item.ECNNumber}</span></td>
                                                    <td><span>{item.PartName}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.OldCost, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.NewCost, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{item.Quantity}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.VariancePerPiece, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                                    <td><span></span></td>
                                                    <td><span></span></td>
                                                    <td><span></span></td>
                                                    <td><span> <button className="Balance mb-0" type={'button'} onClick={() => { }} /></span></td>



                                                </tr>)
                                        })}




                                        {displayCompareCosting && <SimulationApprovalSummary

                                            simulationId={SimulationId}






                                        />}




                                    </tbody>
                                </>)
                            })
                            }


                        </table>
                    </div>
                </Col>
            </Row>
            {/* FG wise Impact section end */}
        </>
    )
}
