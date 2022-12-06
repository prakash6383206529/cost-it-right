import { debounce } from 'lodash';
import React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Table } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../helper';
import { graphColor1, graphColor2, graphColor3, graphColor4, graphColor5, graphColor6, graphColor7, graphColor8, graphColor9, graphColor10, graphColor11, graphColor12, graphColor13, graphColor14, graphColor15, graphColor16 } from '../../../dashboard/ChartsDashboard';
import { Costratiograph } from '../../../dashboard/CostRatioGraph';
import { getCostRatioReport } from '../../actions/ReportListing';

const CostRatioListing = (props) => {
    const { costRatioGridData } = props
    const [tableData, setTableData] = useState([])
    const [pieChartDataArray, setPieChartDataArray] = useState([])
    const dispatch = useDispatch()

    const divRef = useRef()
    const { initialConfiguration } = useSelector(state => state.auth)

    useEffect(() => {
        let formData =
        {
            FromDate: costRatioGridData.fromDate,
            ToDate: costRatioGridData.toDate,
            CostingData: costRatioGridData.rowData
        }

        dispatch(getCostRatioReport(formData, (res) => {

            let Data = res.data && res.data.DataList
            if (res.status === 200) {
                setTableData(Data)
            }
        }))
        setTimeout(() => {


        }, 200);
    }, [])

    const cancelReport = () => {
        props?.viewListing(false)
    }
    const viewPieData = debounce((index) => {
        let temp = []
        let tempObj = tableData[index]
        temp = [
            checkForDecimalAndNull(tempObj.NetRawMaterialsCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetBoughtOutPartCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetProcessCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetOperationCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetOtherOperationCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetConversionCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetSurfaceTreatmentCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetOverheadCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetProfitCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetRejectionCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetICCCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetPaymentTermCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetPackagingAndFreightCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetOtherCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetToolCostPercentage, 2),
            checkForDecimalAndNull(tempObj.NetDiscountCostPercentage, 2),
        ]
        setPieChartDataArray(temp)
    }, [100])
    const pieChartData = {
        labels: ['RM', 'BOP', 'PROC.', 'OPER.', 'OTHER OPER.', 'CC', 'ST', 'OH', 'PROF.', 'REJ.', 'ICC', 'PAYMENT', 'P&F', 'OTHER COST', 'TC', 'DIS.'],
        datasets: [
            {
                label: '',
                data: pieChartDataArray,
                backgroundColor: [
                    graphColor1,
                    graphColor2,
                    graphColor3,
                    graphColor4,
                    graphColor5,
                    graphColor6,
                    graphColor7,
                    graphColor8,
                    graphColor9,
                    graphColor10,
                    graphColor11,
                    graphColor12,
                    graphColor13,
                    graphColor14,
                    graphColor15,
                    graphColor16,
                ],
                borderWidth: 0,
            },
        ],

    };
    const pieChartOption = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 26,
                    borderWidth: 0,
                }
            },
        },
    }
    return (
        <>
            {<div className='container-fluid costing-ratio-report'>
                <div className='row overflow-auto'>
                    <Table className='border px-0 mb-0'>
                        <thead>
                            <tr>
                                <th>
                                    <div className='column-data'> Costing Head</div>
                                    <div className='column-data'>Costing Number</div>
                                    <div className='column-data'> Vendor (Code)</div>
                                    <div className='column-data'>Plant (Code)</div>
                                    <div className='column-data'> Net PO Price</div>
                                    <div className='column-data'>Net PO Price (Currency)</div>
                                    <div className='column-data'>Graph</div>
                                </th>
                                {tableData && tableData.map((item, index) => {
                                    return <>
                                        <th className={`${tableData?.length >= 3 ? 'right-position' : ''}`}>
                                            <div className='column-data'>{item.CostingHead ? item.CostingHead : '-'}</div>
                                            <div className='column-data'>{item.CostingNumber ? item.CostingNumber : '-'}</div>
                                            <div className={`column-data code-container`} ref={divRef} >{(item.VendorName || item.VendorCode) ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span className='name'>{item.VendorName}</span> <span>({item.VendorCode})</span></div> : '-'}</div>
                                            <div className='column-data code-container' ref={divRef} >{(item.PlantName || item.PlantCode) ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span className='name'>{item.PlantName}</span> <span>({item.PlantCode})</span></div> : '-'}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice)} </div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPOPriceOtherCurrency, initialConfiguration.NoOfDecimalForPrice)}</div>
                                            <div className='column-data'>{item.NetPOPriceINR && <button className='view-pie-button btn-hyper-link ml-0' onMouseOver={() => viewPieData(index)}><span className='tooltiptext graph-tooltip'><div className='mb-2'>All value is showing in Percentage</div><Costratiograph data={pieChartData} options={pieChartOption} /></span>View Graph</button>}</div>

                                        </th>
                                    </>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className='column-data'>Net RM Cost (%)</div>
                                    <div className='column-data'>Net BOP Cost (%)</div>
                                    <div className='column-data'>Process Cost (%)</div>
                                    <div className='column-data'>Operation Cost (%)</div>
                                    <div className='column-data'>Other Operation Cost (%)</div>
                                    <div className='column-data'>Conversion Cost (%)</div>
                                    <div className='column-data'>Surface Cost (%)</div>
                                    <div className='column-data'>Overhead Cost (%)</div>
                                    <div className='column-data'>Profit Cost (%)</div>
                                    <div className='column-data'>Rejection Cost (%)</div>
                                    <div className='column-data'>ICC Cost (%)</div>
                                    <div className='column-data'>Payment Term Cost (%)</div>
                                    <div className='column-data'>Packaging & Freight Cost (%)</div>
                                    <div className='column-data'>Other Cost (%)</div>
                                    <div className='column-data'>Tool Cost (%)</div>
                                    <div className='column-data'>Discount Cost (%)</div>
                                </td>
                                {tableData && tableData.map(item => {
                                    return <>
                                        <td>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetRawMaterialsCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetBoughtOutPartCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetProcessCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOperationCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOtherOperationCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetConversionCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetSurfaceTreatmentCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOverheadCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetProfitCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetRejectionCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetICCCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPaymentTermCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPackagingAndFreightCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOtherCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetToolCostPercentage, 2)}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetDiscountCostPercentage, 2)}</div>
                                        </td>
                                    </>
                                })}
                            </tr>
                        </tbody>
                    </Table>
                </div>
                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"mr15 cancel-btn"} onClick={cancelReport}> <div className={"cancel-icon"}></div>CANCEL</button>
                        </div>
                    </div>
                </Row>
            </div>}
        </>

    );
}
export default CostRatioListing;