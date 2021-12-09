import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { getFgWiseImpactData } from '../actions/Simulation'
import { checkForDecimalAndNull } from '../../../helper'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA, EMPTY_GUID } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'
import { getSimulatedAssemblyWiseImpactDate } from '../actions/Simulation'



export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [showTableData, setshowTableData] = useState(false)
    const { SimulationId, headerName, dataForAssemblyImpact, vendorIdState, impactType } = props
    const [loader, setLoader] = useState(false)

    const impactData = useSelector((state) => state.simulation.impactData)
    const simulationAssemblyList = useSelector((state) => state.simulation.simulationAssemblyList)

    const dispatch = useDispatch()

    useEffect(() => {
        setLoader(true)
        // if (SimulationId) {
        switch (impactType) {
            case 'Assembly':
                let count = 0
                if (dataForAssemblyImpact !== undefined && Object.keys(dataForAssemblyImpact).length !== 0 && count === 0) {
                    const requestData = {
                        costingHead: dataForAssemblyImpact?.costingHead,
                        impactPartNumber: dataForAssemblyImpact?.impactPartNumber,
                        plantCode: dataForAssemblyImpact?.plantCode,
                        vendorId: dataForAssemblyImpact?.vendorId,
                        delta: dataForAssemblyImpact?.delta,
                        quantity: 1,
                    }
                    count++
                    dispatch(getSimulatedAssemblyWiseImpactDate(requestData, (res) => {

                        if (res && res.data && res.data.DataList && res.data.DataList.length !== 0) {
                            setshowTableData(true)
                        }
                        else if (res && res?.data && res?.data?.DataList && res?.data?.DataList?.length === 0) {
                            setshowTableData(false)
                        }
                    }))

                }
                break;
            case 'FgWise':
                // dispatch(getFgWiseImpactData(SimulationId, (res) => {

                //     if (res && res.data && res.data.Result) {
                //         setshowTableData(true)
                //     }
                //     else if (res?.response?.status !== "200") {
                //         setshowTableData(false)
                //     }
                // }))
                // }
                break;
            default:
                break;
        }
        setLoader(false)



    }, [dataForAssemblyImpact])

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    const DisplayCompareCostingFgWiseImpact = (SimulationApprovalProcessSummaryId) => {

        props.DisplayCompareCosting(SimulationApprovalProcessSummaryId, 0)

    }

    return (
        <>
            {/* FG wise Impact section start */}

            <Row className="mb-3">
                <Col md="12">
                    {/* {impactType} */}
                    <div className={`table-responsive  fgwise-table ${showTableData ? 'hide-border' : ''} `}>
                        <table className="table cr-brdr-main accordian-table-with-arrow">
                            <thead>
                                {/* {loader && <LoaderCustom />} */}

                                <tr>
                                    {impactType === 'Assembly' ?
                                        (<th className="text-center"><span>{headerName[9]}</span></th>)
                                        : <th><span></span></th>
                                    }
                                    <th className="text-center"><span>{headerName[0]}</span></th>
                                    {headerName[1] !== '' && <th><span>{headerName[1]}</span></th>}
                                    {headerName[2] !== '' && <th><span>{headerName[2]}</span></th>}
                                    {headerName[3] !== '' && <th><span>{headerName[3]}</span></th>}
                                    {impactType === 'Assembly' ? '' : <th><span>{headerName[4]}</span></th>}
                                    {headerName[5] !== '' && <th><span>{headerName[5]}</span></th>}
                                    {headerName[6] !== '' && <th><span>{headerName[6]}</span></th>}
                                    {headerName[7] !== '' && <th><span>{headerName[7]}</span></th>}
                                    {headerName[8] !== '' && <th className="second-last-child"><span>{headerName[8]}</span></th>}

                                </tr>
                            </thead>
                            {/* {showTableData && impactData && impactData.map((item, index) => { */}
                            {true && simulationAssemblyList && simulationAssemblyList.map((item, index) => {
                                switch (impactType) {
                                    case 'Assembly':
                                        return (
                                            <>
                                                <tbody className="with-border-table">
                                                    <tr >
                                                        <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(index)}></div>{item.PartNumber ? item.PartNumber : "-"}</span></td>
                                                        <td><span>{item.RevisionNumber}</span></td>
                                                        <td><span>{item.PartName}</span></td>
                                                        <td><span>{item.Level}</span></td>
                                                        <td><span>{item.OldPrice}</span></td>
                                                        {/* <td><span>{item.NewPrice}</span></td> */}
                                                        <td><span>{checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                                        <td><span>{item.Variance == null ? "" : item.Variance}</span></td>
                                                        {/* <td><span>{checkForDecimalAndNull(item., initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                        <td><span> {checkForDecimalAndNull(item., initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                        <td><span> </span><a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></td> */}

                                                    </tr>
                                                </tbody>
                                            </>)
                                        break;
                                    case 'FgWise':

                                        // ***********  THIS IS FOR RE | IN FUTURE MAY COME IN BASE  ***********
                                        // return (
                                        //     <>
                                        //         <tbody>{item.BOMNumber}
                                        //             <tr className="accordian-with-arrow">
                                        //                 <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(index)}></div>{item. ? item. : "-"}</span></td>
                                        //                 <td><span>{item.BOMNumber}</span></td>
                                        //                 <td><span>{item.}</span></td>
                                        //                 <td><span>{item.}</span></td>
                                        //                 <td><span>{item.}</span></td>
                                        //                 <td><span>{item.}</span></td>
                                        //                 <td><span>{checkForDecimalAndNull(item., initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                        //                 <td><span>{item. == null ? "" : item.}</span></td>
                                        //                 <td><span>{checkForDecimalAndNull(item., initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                        //                 <td><span> {checkForDecimalAndNull(item., initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                        //                 <td><span> </span><a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></td>

                                        //             </tr>


                                        //             {acc1.currentIndex === index && acc1.isClicked && []?.childPartsList.map((item, index) => {

                                        //                 return (
                                        //                     <tr className="accordian-content">
                                        //                         <td><span>{item.childField[0]}</span></td>
                                        //                         <td className="text-center"><span>{item.childField[1]}</span></td>
                                        //                         <td><span>{item.childField[2]}</span></td>
                                        //                         <td><span>{checkForDecimalAndNull(item.childField[3], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                        //                         <td><span>{checkForDecimalAndNull(item.childField[4], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                        //                         <td><span>{item.childField[5]}</span></td>
                                        //                         <td><span>{checkForDecimalAndNull(item.childField[6], initialConfiguration.NoOfDecimalForInputOutput)}</span></td>

                                        //                         <td><span>{childField[7]}</span></td>
                                        //                         <td><span>{childField[8]}</span></td>
                                        //                         <td><span>{childField[9]}</span></td>
                                        //                         <td><span> <button className="Balance mb-0 float-right" type={'button'} onClick={() => { DisplayCompareCostingFgWiseImpact(item.SimulationApprovalProcessSummaryId) }} /></span></td>

                                        //                     </tr>)
                                        //             })}
                                        //         </tbody>
                                        //     </>)
                                        break;
                                    default:
                                        break;
                                }

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
