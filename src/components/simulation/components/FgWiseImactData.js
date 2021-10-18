import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFgWiseImpactData } from '../actions/Simulation'
import { getConfigurationKey } from '../../../helper'
import { checkForDecimalAndNull } from '../../../helper'
import { EMPTY_GUID } from '../../../config/constants'
import SimulationApprovalSummary from './SimulationApprovalSummary'
import { Callbacks } from 'jquery'
import { sortedLastIndex } from 'lodash-es'



export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [showTableData, setshowTableData] = useState(false)
    const { SimulationId } = props
    const dispatch = useDispatch()

    const impactData = useSelector((state) => state.simulation.impactData)



    useEffect(() => {

        if (SimulationId) {

            dispatch(getFgWiseImpactData(SimulationId, () => { setshowTableData(true) }))
        }


    }, [SimulationId])

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    const DisplayCompareCostingFgWiseImpact = (SimulationApprovalProcessSummaryId) => {

        props.DisplayCompareCosting(SimulationApprovalProcessSummaryId, 0)

    }





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
                                    <th className="text-center"><span>Rev Number/ECN Number</span></th>
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


                                        {acc1.currentIndex === index && acc1.isClicked && item.childPartsList.map((item, index) => {

                                            return (
                                                <tr className="accordian-content">
                                                    <td><span>{item.PartNumber}</span></td>
                                                    <td className="text-center"><span>{item.ECNNumber}</span></td>
                                                    <td><span>{item.PartName}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.OldCost, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.NewCost, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{item.Quantity}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.VariancePerPiece, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                                    <td><span></span></td>
                                                    <td><span></span></td>
                                                    <td><span></span></td>
                                                    <td><span> <button className="Balance mb-0 float-right" type={'button'} onClick={() => { DisplayCompareCostingFgWiseImpact(item.SimulationApprovalProcessSummaryId) }} /></span></td>



                                                </tr>)
                                        })}





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
