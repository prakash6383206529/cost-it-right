import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useSelector } from 'react-redux'
// import { getFgWiseImpactData } from '../actions/Simulation'
import { checkForDecimalAndNull } from '../../../helper'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'



export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [showTableData, setshowTableData] = useState(false)
    const { SimulationId, parentField, childField, headerName } = props
    const [loader, setLoader] = useState(false)

    const impactData = useSelector((state) => state.simulation.impactData)


    useEffect(() => {

        if (SimulationId) {
            setLoader(true)
            // dispatch(getFgWiseImpactData(SimulationId, (res) => {

            //     if (res && res.data && res.data.Result) {
            //         setshowTableData(true)
            //     }
            //     else if (res?.response?.status !== "200") {
            //         setshowTableData(false)
            //     }
            //     setLoader(false)
            // }))
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

                    <div className={`table-responsive ${!showTableData ? 'fgwise-table' : ""}`}>
                        <table className="table cr-brdr-main accordian-table-with-arrow">
                            <thead>
                                {loader && <LoaderCustom />}

                                <tr>
                                    <th><span></span></th>
                                    <th className="text-center"><span>{headerName[0]}</span></th>
                                    {headerName[1] !== '' && <th><span>{headerName[1]}</span></th>}
                                    {headerName[2] !== '' && <th><span>{headerName[2]}</span></th>}
                                    {headerName[3] !== '' && <th><span>{headerName[3]}</span></th>}
                                    {headerName[4] !== '' && <th><span>{headerName[4]}</span></th>}
                                    {headerName[5] !== '' && <th><span>{headerName[5]}</span></th>}
                                    {headerName[6] !== '' && <th><span>{headerName[6]}</span></th>}
                                    {headerName[7] !== '' && <th><span>{headerName[7]}</span></th>}
                                    {headerName[8] !== '' && <th className="second-last-child"><span>{headerName[8]}</span></th>}

                                </tr>
                            </thead>


                            {/* {showTableData && impactData && impactData.map((item, index) => { */}
                            {showTableData && impactData && impactData.map((item, index) => {

                                return (<>
                                    <tbody>
                                        <tr className="accordian-with-arrow">
                                            <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(index)}></div>{item.parentField[0] ? item.parentField[0] : "-"}</span></td>
                                            <td><span>{parentField[1]}</span></td>
                                            <td><span>{parentField[2]}</span></td>
                                            <td><span>{parentField[3]}</span></td>
                                            <td><span>{parentField[4]}</span></td>
                                            <td><span>{parentField[5]}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.parentField[6], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                            <td><span>{item.parentField[7] == null ? "" : item.parentField[7]}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.parentField[8], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span> {checkForDecimalAndNull(item.parentField[9], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span> </span><a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></td>

                                        </tr>


                                        {acc1.currentIndex === index && acc1.isClicked && item.childPartsList.map((item, index) => {

                                            return (
                                                <tr className="accordian-content">
                                                    <td><span>{item.childField[0]}</span></td>
                                                    <td className="text-center"><span>{item.childField[1]}</span></td>
                                                    <td><span>{item.childField[2]}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.childField[3], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.childField[4], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td><span>{item.childField[5]}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.childField[6], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                                    <td><span>{childField[7]}</span></td>
                                                    <td><span>{childField[8]}</span></td>
                                                    <td><span>{childField[9]}</span></td>
                                                    <td><span> <button className="Balance mb-0 float-right" type={'button'} onClick={() => { DisplayCompareCostingFgWiseImpact(item.SimulationApprovalProcessSummaryId) }} /></span></td>

                                                </tr>)
                                        })}
                                    </tbody>
                                </>)
                            })
                            }

                        </table>
                        {!loader && !showTableData &&

                            <Col md="12">
                                <NoContentFound title={EMPTY_DATA} />
                            </Col>
                        }
                    </div>
                </Col>
            </Row>
            {/* FG wise Impact section end */}
        </>
    )
}
