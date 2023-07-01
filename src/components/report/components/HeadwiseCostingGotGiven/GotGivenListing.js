import React from 'react';
import { useState } from 'react';
import { Table } from 'reactstrap';

function GotGivenListing(props) {
    const [viewConsumption, setViewConsumption] = useState(false)
    const [viewLabour, setViewLabour] = useState(false)
    const [viewManufacturing, setViewManufacturing] = useState(false)
    const [viewRepair, setViewRepair] = useState(false)
    const [viewOfficeExpenses, setViewOfficeExpenses] = useState(false)
    const [viewSAndD, setViewSAndD] = useState(false)
    const [viewAmortization, setViewAmortization] = useState(false)
    const cancelReport = () => {
        props.closeDrawer('')
    }
    return <>
        <div className='analytics-drawer justify-content-end'>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
        <div>
            <Table className='mt-2 table table-bordered costing-summary-table goat-given' >
                <tbody>

                    <tr>
                        <td>
                            <span className="d-block">Month</span>
                            <span className="d-block">Plant</span>
                            <span className="d-block">Plant Name & Location</span>
                            <span className="d-block">Part No</span>
                            <span className="d-block">Part Description</span>
                            <span className="d-block">Revision Number</span>
                            <span className="d-block">Budgeted Qty</span>
                            <span className="d-block">Actual Qty</span>
                            <span className="d-block">Revised PO</span>
                            <span className="d-block">Existing PO</span>
                            <span className="d-block">Variance</span>
                        </td>
                        <td>
                            <span className="d-block">March</span>
                            <span className="d-block">1109</span>
                            <span className="d-block">DH103809</span>
                            <span className="d-block">Assly Sliencer</span>
                            <span className="d-block">02</span>
                            <span className="d-block">-</span>
                            <span className="d-block">-</span>
                            <span className="d-block">-</span>
                            <span className="d-block">-</span>
                            <span className="d-block">-</span>
                            <span className="d-block">-</span>

                        </td>
                        <td></td>
                    </tr>
                    <tr className='background-light-blue'>
                        <td>Consumption</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewConsumption(!viewConsumption) }}>
                                {viewConsumption ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewConsumption && <>
                        <tr>
                            <td colSpan={3}>
                                Material cost:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">BOP price of child parts</span>
                                <span className="d-block">BOP price of BAL approved source</span>
                                <span className="d-block">Buffing</span>
                                <span className="d-block"> Buffing/ED+PC/Electropolishing</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                Consumables cost:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Welding wire+Gas</span>
                                <span className="d-block">Main line</span>
                                <span className="d-block">I/H Sub Assly</span>
                                <span className="d-block">BOP</span>
                                <span className="d-block">Other Consumables</span>
                                <span className="d-block">Main line</span>
                                <span className="d-block">I/H Sub Assly</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Rejection  Cost:
                            </td>
                            <td>
                                1.25
                            </td>
                            <td>
                                0.15
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                Surface Treatment:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Ni Cr Plating</span>
                            </td>
                            <td>
                                <span className="d-block">12.256</span>
                            </td>
                            <td>
                                <span className="d-block">12.256</span>
                            </td>
                        </tr>
                    </>}

                    <tr className='background-light-blue'>
                        <td>Labour</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewLabour(!viewLabour) }}>
                                {viewLabour ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewLabour && <>
                        <tr>
                            <td colSpan={3}>
                                Direct Labour:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Main line</span>
                                <span className="d-block">Body Muffler</span>
                                <span className="d-block">Post Painting </span>
                                <span className="d-block">Post Painting </span>
                                <span className="d-block">I/H Sub assly </span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">1.256</span>
                                <span className="d-block">12.256</span>
                                <span className="d-block">12.256</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Indirect Labor
                            </td>
                            <td>
                                0.25
                            </td>
                            <td>
                                1.25
                            </td>
                        </tr>
                    </>}
                    <tr className='background-light-blue'>
                        <td>Staff Cost</td>
                        <td>2</td>
                        <td>
                            2.4
                        </td>
                    </tr>
                    <tr className='background-light-blue'>
                        <td>Manufacturing Expenses</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewManufacturing(!viewManufacturing) }}>
                                {viewManufacturing ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewManufacturing && <>
                        <tr>
                            <td colSpan={3}>
                                Power Cost:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Main line</span>
                                <span className="d-block">I/H Sub Assly</span>

                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                            </td>
                        </tr>
                    </>}
                    <tr className='background-light-blue'>
                        <td>Repair & Maintanance</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewRepair(!viewRepair) }}>
                                {viewRepair ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewRepair && <>
                        <tr>
                            <td colSpan={3}>
                                Machine Maintenance:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Robot Maintenance</span>
                                <span className="d-block">SPM</span>
                                <span className="d-block"> Trolley & Bin</span>

                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                                <span className="d-block">11.09</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Jig & fixture maintenance</td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                    </>}
                    <tr className='background-light-blue'>
                        <td>Office Expenses</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewOfficeExpenses(!viewOfficeExpenses) }}>
                                {viewOfficeExpenses ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewOfficeExpenses && <>
                        <tr>
                            <td>CMM / Calibration / weld penetration cost</td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                        <tr>
                            <td>Administrative Cost</td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                Over heads:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Main line</span>
                                <span className="d-block">I/H Sub Assly</span>

                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">11.09</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                            </td>
                        </tr>
                    </>}
                    <tr className='background-light-blue'>
                        <td>S & D</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewSAndD(!viewSAndD) }}>
                                {viewSAndD ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewSAndD && <>
                        <tr>
                            <td>Logistics cost</td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                Surface Treatment:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">HR Painting</span>

                            </td>
                            <td>
                                <span className="d-block">2</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                            </td>
                        </tr>
                    </>}
                    <tr className='background-light-blue'>
                        <td>Amortization</td>
                        <td>20</td>
                        <td className='text-right'>
                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setViewAmortization(!viewAmortization) }}>
                                {viewAmortization ? (
                                    <i className="fa fa-minus" ></i>
                                ) : (
                                    <i className="fa fa-plus"></i>
                                )}
                            </button>

                        </td>
                    </tr>
                    {viewAmortization && <>
                        <tr>
                            <td>Land and building </td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                Tools and equipments amortisation:
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="d-block">Dies/Gauges</span>
                                <span className="d-block">Robots, SPM, Welding Machine</span>
                                <span className="d-block"> Robots, SPM, Welding Machine</span>

                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                            </td>
                            <td>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                                <span className="d-block">2</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Profit</td>
                            <td>2.1</td>
                            <td>5.26</td>
                        </tr>
                    </>}

                </tbody>
            </Table>
        </div>
    </>
}
export default GotGivenListing