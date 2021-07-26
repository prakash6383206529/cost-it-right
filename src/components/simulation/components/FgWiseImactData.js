import React, { useState } from 'react'
import { Row, Col } from 'reactstrap'

export function Fgwiseimactdata(props) {
    const [acc1, setAcc1] = useState(false)
    const [acc2, setAcc2] = useState(false)

    return (
        <>
            {/* FG wise Impact section start */}
            <Row >
                <Col md="12">
                        <div className="left-border">{'FG wise Impact:'}</div>
                </Col>
            </Row>

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
                            <th><span>Impact/Pc</span></th>
                            <th><span>Volume</span></th>
                            <th><span>Impact/Month</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="accordian-with-arrow">
                            <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(!acc1)}></div>Model 1</span></td>
                            <td><span>1</span></td>
                            <td><span>This is A model</span></td>
                            <td><span>0</span></td>
                            <td><span>0</span></td>
                            <td><span>24(INR)</span></td>
                            <td><span>2000</span></td>
                            <td><span>48000(INR) <a onClick={() => setAcc1(!acc1)} className={`${acc1 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                            </tr>
                            {acc1 &&
                            <>
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
                                <tr className="accordian-content">
                                <td><span>Part 2</span></td>
                                <td><span>1</span></td>
                                <td><span>Part number</span></td>
                                <td><span>24(INR)</span></td>
                                <td><span>26(INR)</span></td>
                                <td><span>2(INR)</span></td>
                                <td><span>1000</span></td>
                                <td><span>2000 (INR)</span></td>
                                </tr>
                                <tr className="accordian-content">
                                <td><span>Part 3</span></td>
                                <td><span>1</span></td>
                                <td><span>Part number</span></td>
                                <td><span>24(INR)</span></td>
                                <td><span>26(INR)</span></td>
                                <td><span>2(INR)</span></td>
                                <td><span>1000</span></td>
                                <td><span>2000 (INR)</span></td>
                                </tr>
                            </>
                            }
                        </tbody>

                        <tbody>
                            <tr className="accordian-with-arrow">
                            <td className="arrow-accordian"><span><div onClick={() => setAcc2(!acc2)} class="Close"></div>Model 2</span></td>
                            <td><span>1</span></td>
                            <td><span>This is A model</span></td>
                            <td><span>0</span></td>
                            <td><span>0</span></td>
                            <td><span>24(INR)</span></td>
                            <td><span>2000</span></td>
                            <td><span>48000(INR) <a onClick={() => setAcc2(!acc2)} className={`${acc2 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                            </tr>
                            {acc2 &&
                            <>
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
                                <tr className="accordian-content">
                                <td><span>Part 2</span></td>
                                <td><span>1</span></td>
                                <td><span>Part number</span></td>
                                <td><span>24(INR)</span></td>
                                <td><span>26(INR)</span></td>
                                <td><span>2(INR)</span></td>
                                <td><span>1000</span></td>
                                <td><span>2000 (INR)</span></td>
                                </tr>
                            </>
                            }
                        </tbody>
                        </table>
                    </div>
                </Col>
            </Row>
            {/* FG wise Impact section end */}
        </>
    )
}
