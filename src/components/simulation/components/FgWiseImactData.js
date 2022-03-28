import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFgWiseImpactData } from '../actions/Simulation'
import { checkForDecimalAndNull, checkForNull } from '../../../helper'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'
import { Link } from 'react-scroll';



export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [showTableData, setshowTableData] = useState(false)
    const dispatch = useDispatch()
    const { SimulationId } = props
    const [loader, setLoader] = useState(false)

    const impactData = useSelector((state) => state.simulation.impactData)


    useEffect(() => {
        setLoader(true)

        if (SimulationId) {
            setLoader(true)
            dispatch(getFgWiseImpactData(SimulationId, (res) => {
                if (res && res.data && res.data.Result) {
                    setshowTableData(true)
                }
                else if (res?.response?.status !== "200") {
                    setshowTableData(false)
                } else {
                    setLoader(false)
                }

                setLoader(false)
            }))
        }

        // dispatch(getFgWiseImpactData(SimulationId, (res) => {



    }, [SimulationId])

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    const DisplayCompareCostingFgWiseImpact = (SimulationApprovalProcessSummaryId) => {

        props.DisplayCompareCosting(SimulationApprovalProcessSummaryId, 0)

    }

    const toggleAcc = (value) => {
        let temp = acc1
        if (temp.currentIndex !== value) {
            setAcc1({ currentIndex: temp.currentIndex, isClicked: false })
            setTimeout(() => {
                setAcc1({ currentIndex: value, isClicked: true })
            }, 200);
        } else {
            setAcc1({ currentIndex: value, isClicked: !acc1.isClicked })
        }
    }

    return (
        <>
            {/* FG wise Impact section start */}

            <Row className="mb-3">
                <Col md="12">
                    {/* {impactType} */}
                    <div className={`table-responsive  fgwise-table ${showTableData ? 'hide-border' : ''} `}>
                        <table className="table cr-brdr-main accordian-table-with-arrow fg-wise-table">
                            <thead>
                                {loader && <LoaderCustom />}
                                <tr>
                                    <th><span></span></th>
                                    <th className="text-center"><span>Revision No.</span></th>
                                    <th className='fg-name-heading'><span>Name</span></th>
                                    <th><span>Old Cost/Pc</span></th>
                                    <th><span>New Cost/pc</span></th>
                                    <th><span>Quantity</span></th>
                                    <th><span>Impact/Pc</span></th>
                                    <th><span>SOB(%)</span></th>
                                    <th><span>Impact/Pc(with SOB)</span></th>
                                    <th><span>Volume/Year</span></th>
                                    <th><span>Impact/Quater</span></th>
                                    <th className="second-last-child"><span>Impact/Year</span></th>
                                    <th><span></span></th>
                                </tr>
                            </thead>


                            {showTableData && impactData && impactData.map((item, index) => {

                                return (<>
                                    <tbody >
                                        <tr className="accordian-with-arrow" key={index} id={"fg-wise"}>
                                            <td className="arrow-accordian"><span><Link to={"fg-wise"} spy={true} smooth={true} delay={0}><div class="Close" onClick={() => { toggleAcc(index) }}></div></Link>{item.PartNumber ? item.PartNumber : "-"}</span></td>
                                            <td><span>{'-'}</span></td>
                                            <td><span className='text-overflow' title={item.PartName}>{item.PartName}</span></td>
                                            <td><span>{'-'}</span></td>
                                            <td><span>{'-'}</span></td>
                                            <td><span>{'-'}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.VariancePerPiece, initialConfiguration.NoOfDecimalForPrice)}</span></td>

                                            <td><span>{checkForNull(item?.VendorSOBPercentage)}</span></td>
                                            {/* //Impact/Pc(with SOB) */}
                                            <td><span>{checkForDecimalAndNull(item?.VendorSOBImpactPerPiece, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                            <td><span>{item.VolumePerYear == null ? "" : checkForDecimalAndNull(item.VolumePerYear, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                            <td><span>{checkForDecimalAndNull(item.VendorSOBImpactPerQuater, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                            <td colSpan="2"><span> {checkForDecimalAndNull(item.VendorSOBImpactPerYear, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                            {/* <td><span> </span><a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></td> */}

                                        </tr>


                                        {acc1.currentIndex === index && acc1.isClicked && item.childPartsList.map((item, index) => {
                                            let VendorSOBImpactPerPiece = checkForNull(item.VariancePerPiece) / checkForNull(checkForNull(item.VendorSOBPercentage) / 100)

                                            return (
                                                <tr className="accordian-content">
                                                    <td><span>{item.PartNumber}</span></td>
                                                    <td className="text-center"><span>{item.RevisionNumber}</span></td>
                                                    <td><span className='text-overflow' title={item.PartName}>{item.PartName}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.OldCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                                    <td><span>{checkForDecimalAndNull(item.NewCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                                    <td><span>{item.Quantity}</span></td>
                                                    <td ><span>{checkForDecimalAndNull(item.VariancePerPiece, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                                    <td ><span>{checkForDecimalAndNull(item.VendorSOBPercentage, initialConfiguration.NoOfDecimalForInputOutput)}</span></td>
                                                    <td ><span>{checkForDecimalAndNull(VendorSOBImpactPerPiece, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                                    <td colSpan="4"><span> <Link to="compare-costing" spy={true} smooth={true}><button className="Balance mb-0 float-right" type={'button'} onClick={() => { DisplayCompareCostingFgWiseImpact(item.SimulationApprovalProcessSummaryId) }} /></Link></span></td>

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
