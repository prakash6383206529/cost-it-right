import React, { Fragment } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { Row, Col, Table } from 'reactstrap';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';

const arr = [
    {
        zbc: "ZBC v/s VBC",
        poPrice: "PO Price",
        status: "Status",
        rm: "RM name-Grade",
        gWeight: "Gross Weight",
        fWeight: "Finish Weight",
        netRM: "Net RM Cost",
        netBOP: "Net BOP Cost",
        pCost: "Process Cost",
        oCost: "Operation Cost"

    },
    {
        zbc: "ZBC",
        poPrice: "250000.00",
        status: "Draft",
        rm: "Raw1-B1",
        gWeight: "77",
        fWeight: "70",
        netRM: "4029.00",
        netBOP: "3.05",
        pCost: "40.00",
        oCost: "25.00"
    }
]
const CostingSummaryTable = props => {
    console.log('props: ', props);
    const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm();
    return (
        <Fragment>
            Hello from Summary Table
            <Row>
                <Col md="4">
                    <div className="left-border">
                        {'Summary'}
                    </div>
                </Col>
                <Col md="4">
                    <button>{"Send For Approval"}</button>
                </Col>
                <Col md="4">
                    <button>{"Add To Comparison"}</button>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <table>
                        {arr.map((data, index) => {
                            return (
                                <Fragment>
                                    <tr>
                                        <th>{data.zbc}</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <SearchableSelectHookForm
                                                name={`Costing-${index}`}
                                                placeholder={'-Select-'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue={'Test'}
                                                // options={renderListing('Plant')}
                                                // mandatory={true}
                                                // handleChange={handlePlantChange}
                                                // errors={errors.Plant}
                                            /></td>
                                    </tr>
                                    <tr>
                                        <td>{data.poPrice}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.status}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.rm}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.gWeight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.fWeight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.netRM}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.netBOP}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.pCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.oCost}</td>
                                    </tr>
                                </Fragment>
                            )
                        })}
                    </table>
                </Col>
            </Row>
            {
                //     <Row>
                //     <Col md="12">
                //         <table>
                //             <tr>
                //                 <th>ZBC v/s VBC</th>
                //                 <th>ZBC 20</th>
                //                 <th>Supplier</th>
                //             </tr>
                //             <tr>
                //                 <td></td>
                //                 <td>Checkbox and dropdown</td>
                //                 <td>Checkbox and dropdown</td>
                //             </tr>
                //             <tr>
                //                 <td>PO Price</td>
                //                 <td>250000.00</td>
                //                 <td>250000.00</td>
                //             </tr>
                //             <tr>
                //             <td>Status</td>
                //             <td>Draft</td>
                //             <td>Draft</td>
                //             </tr>
                //             <tr>
                //             <td>RM name-Grade</td>
                //             <td>Raw1-B1</td>
                //             <td>Raw1</td>
                //             </tr>
                //             <tr>
                //             <td>Gross Weight</td>
                //             <td>77</td>
                //             <td>77</td>
                //             </tr>
                //             <tr>
                //             <td>Finish Weight</td>
                //             <td>70</td>
                //             <td>70</td>
                //             </tr>
                //             <tr>
                //             <td>Net RM Cost</td>
                //             <td>4029.00</td>
                //             <td>4029.00</td>
                //             </tr>
                //             <tr>
                //             <td>Net BOP Cost</td>
                //             <td>3.05</td>
                //             <td>3.05</td>
                //             </tr>
                //             <tr>
                //             <td>Process Cost</td>
                //             <td>40.00</td>
                //             <td>48.00</td>
                //             </tr>
                //             <tr>
                //             <td>Operation Cost</td>
                //             <td>25.00</td>
                //             <td>29.00</td>
                //             </tr>
                //             <tr>
                //             <td>Surface Treatment</td>
                //             <td>18.00</td>
                //             <td>18.00</td>
                //             </tr>
                //             <tr>
                //             <td>Transportation Cost</td>
                //             <td>2.00</td>
                //             <td>2.00</td>
                //             </tr>
                //             <tr>
                //             <td>Net Conversion Cost</td>
                //             <td>85.00</td>
                //             <td>77.00</td>
                //             </tr>
                //             <tr>
                //             <td>Model Type For Overhead/Profit</td>
                //             <td>All</td>
                //             <td>High Volume</td>
                //             </tr>
                //             <tr>
                //             <td></td>
                //             <td><div>
                //             <span>Applicability</span> &nbsp;
                //             <span>Value</span>
                //             </div></td>
                //             <td><div>
                //             <span>Applicability</span> &nbsp;
                //             <span>Value</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Overhead On</td>
                //             <td><div>
                //             <span>RM+CC+BOP</span> &nbsp;
                //             <span>150.00</span>
                //             </div></td>
                //             <td><div>
                //             <span>RM+CC</span> &nbsp;
                //             <span>115.00</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Profit On</td>
                //             <td><div>
                //             <span>RM+CC+BOP</span> &nbsp;
                //             <span>150.00</span>
                //             </div></td>
                //             <td><div>
                //             <span>Fixed</span> &nbsp;
                //             <span>250.00</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Rejection On</td>
                //             <td><div>
                //             <span>RM+CC+BOP</span> &nbsp;
                //             <span>150.00</span>
                //             </div></td>
                //             <td><div>
                //             <span>RM+CC</span> &nbsp;
                //             <span>250.00</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>ICC On</td>
                //             <td><div>
                //             <span>RM Inventory</span> &nbsp;
                //             <span>250.00</span>
                //             </div></td>
                //             <td><div>
                //             <span>WIP Inventory</span> &nbsp;
                //             <span>175.00</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Payment Terms</td>
                //             <td><div>
                //             <span>Net Cost</span> &nbsp;
                //             <span>250.00</span>
                //             </div></td>
                //             <td><div>
                //             <span>RM+CC</span> &nbsp;
                //             <span>250.00</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Net Overhead & Profits</td>
                //             <td>950.00</td>
                //             <td>940.00</td>
                //             </tr>
                //             <tr>
                //             <td>Packaging Cost</td>
                //             <td>40.00</td>
                //             <td>45.00</td>
                //             </tr>
                //             <tr>
                //             <td>Freight</td>
                //             <td>75.00</td>
                //             <td>60.00</td>
                //             </tr>
                //             <tr>
                //             <td>Net Packaging & Freight</td>
                //             <td>115.00</td>
                //             <td>105.00</td>
                //             </tr>
                //             <tr>
                //             <td>Tool Maintenance Cost</td>
                //             <td>600.00</td>
                //             <td>600.00</td>
                //             </tr>
                //             <tr>
                //             <td>Tool Price</td>
                //             <td>5000.00</td>
                //             <td>5000.00</td>
                //             </tr>
                //             <tr>
                //             <td>Amortization Quantity (Tool Life)</td>
                //             <td>10</td>
                //             <td>10</td>
                //             </tr>
                //             <tr>
                //             <td>Total Tool Cost</td>
                //             <td>1100.00</td>
                //             <td>1100.00</td>
                //             </tr>
                //             <tr>
                //             <td>Total Cost</td>
                //             <td>6282.25</td>
                //             <td>6254.25</td>
                //             </tr>
                //             <tr>
                //             <td>Hundi/Other Discount</td>
                //             <td><div>
                //             <span>Discount %</span> &nbsp;
                //             <span>Value</span>
                //             </div></td>
                //             <td><div>
                //             <span>Discount %</span> &nbsp;
                //             <span>Value</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td></td>
                //             <td><div>
                //             <span>5%</span> &nbsp;
                //             <span>314.11</span>
                //             </div></td>
                //             <td><div>
                //             <span>7%</span> &nbsp;
                //             <span>437.79</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Any Other Cost</td>
                //             <td>500.00</td>
                //             <td>500.00</td>
                //             </tr>
                //             <tr>
                //             <td>Remark</td>
                //             <td>Test Remark</td>
                //             <td>Test Remark</td>
                //             </tr>
                //             <tr>
                //             <td>Net PO Price(INR)</td>
                //             <td>7096.36</td>
                //             <td>7192.04</td>
                //             </tr>
                //             <tr>
                //             <td>Currency</td>
                //             <td><div>
                //             <span>INR/EUR</span> &nbsp;
                //             <span>85</span>
                //             </div></td>
                //             <td><div>
                //             <span>INR/INR</span> &nbsp;
                //             <span>---</span>
                //             </div></td>
                //             </tr>
                //             <tr>
                //             <td>Net PO Price(INR)</td>
                //             <td>7096.36</td>
                //             <td>7192.04</td>
                //             </tr>
                //             <tr>
                //             <td>Attachment</td>
                //             <td>View Attachment</td>
                //             <td>View Attachment</td>
                //             </tr>
                //         </table>
                //     </Col>
                // </Row>
            }
        </Fragment>
    )
}

export default CostingSummaryTable;