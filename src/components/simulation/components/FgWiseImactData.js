import { Row, Col } from 'reactstrap'
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFgWiseImpactData } from '../actions/Simulation'


export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState({ currentIndex: -1, isClicked: false, })
    const [acc2, setAcc2] = useState(false)
    const [showTableData, setshowTableData] = useState(false)
    const { SimulationId } = props
    const [SimulationIdState, setSimulationIdState] = useState("")
    const dispatch = useDispatch()

    const impactData = useSelector((state) => state.simulation.impactData)


    const tasks = [

        {
            model: 'Model1',
            partNo: "part 1",
            ecnNo: "1",
            partName: "screw",
            oldCost: "24inr",
            newCost: "34inr",
            quantity: "5",
            impactPc: "1000",
            volume: "500",
            child: [
                {
                    partNo: "part 1",
                    ecnNo: "1",
                    partName: "child",
                    oldCost: "24inr",
                    newCost: "34inr",
                    quantity: "5",
                    impactPc: "1000",
                    volume: "500"

                },

                {
                    partNo: "part 1",
                    ecnNo: "1",
                    partName: "child2",
                    oldCost: "24inr",
                    newCost: "34inr",
                    quantity: "5",
                    impactPc: "1000",
                    volume: "500"

                }



            ]
        },

        {
            model: 'Model2',
            partNo: "part 1",
            ecnNo: "1",
            partName: "screw",
            oldCost: "24inr",
            newCost: "34inr",
            quantity: "5",
            impactPc: "1000",
            volume: "500",
            child: [
                {
                    partNo: "part 1",
                    ecnNo: "1",
                    partName: "child",
                    oldCost: "24inr",
                    newCost: "34inr",
                    quantity: "5",
                    impactPc: "1000",
                    volume: "500"

                },

                {
                    partNo: "part 1",
                    ecnNo: "1",
                    partName: "child2",
                    oldCost: "24inr",
                    newCost: "34inr",
                    quantity: "5",
                    impactPc: "1000",
                    volume: "500"

                }



            ]
        }







    ]


    useEffect(() => {

        if (SimulationId) {

            dispatch(getFgWiseImpactData(SimulationId, () => { setshowTableData(true) }))
        }


    }, [SimulationId])






    const data = tasks && tasks.map((item) => {


        <tr className="accordian-content">
            <td><span>Part 1</span></td>
            <td><span>1</span></td>
            <td><span>Part number</span></td>
            <td><span>24(INR)</span></td>
            <td><span>26(INR)</span></td>
            <td><span>2(INR)</span></td>
            <td><span>1000</span></td>
            <td><span>2000 (INR)</span></td>
        </tr>


    }


    )

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
                                    <th><span>Volume</span></th>
                                    <th><span>Impact/Quater</span></th>
                                </tr>
                            </thead>


                            {showTableData && impactData && impactData.map((item, index) => {

                                return (<>
                                    <tbody>
                                        <tr className="accordian-with-arrow">
                                            <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(index)}></div>{item.PartNumber ? item.PartNumber : "-"}</span></td>
                                            <td><span>{item.ECNNumber ? item.ECNNumber : "-"}</span></td>
                                            <td><span>{item.PartName ? item.PartName : "-"}</span></td>
                                            <td><span>{item.OldCost}</span></td>
                                            <td><span>{item.NewCost}</span></td>
                                            <td><span>{item.Quantity}</span></td>
                                            <td><span>{item.ImpactPerYear ? item.ImpactPerYear : "-"}</span></td>
                                            <td><span>-</span></td>
                                            <td><span>{item.ImpactPerQuater} <a onClick={() => setAcc1({ currentIndex: index, isClicked: !acc1.isClicked })} className={`${acc1.currentIndex === index && acc1.isClicked ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                                        </tr>


                                        {acc1.currentIndex === index && acc1.isClicked && item.childPartsList.map((item) => {

                                            return (
                                                <tr className="accordian-content">
                                                    <td><span>{item.PartNumber}</span></td>
                                                    <td><span>{item.ECNNumber ? item.ECNNumber : "-"}</span></td>
                                                    <td><span>{item.PartName ? item.PartName : "-"}</span></td>
                                                    <td><span>{item.OldCost}</span></td>
                                                    <td><span>{item.NewCost}</span></td>
                                                    <td><span>{item.Quantity}</span></td>
                                                    <td><span>{item.ImpactPerYear}</span></td>
                                                    <td><span>-</span></td>
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
