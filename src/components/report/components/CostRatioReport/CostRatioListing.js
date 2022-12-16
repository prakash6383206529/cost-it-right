import { debounce } from 'lodash';
import React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Table } from 'reactstrap';
import { EMPTY_DATA } from '../../../../config/constants';
import { checkForDecimalAndNull } from '../../../../helper';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import { graphColor1, graphColor2, graphColor3, graphColor4, graphColor5, graphColor6, graphColor7, graphColor8, graphColor9, graphColor10, graphColor11, graphColor12, graphColor13, graphColor14, graphColor15, graphColor16 } from '../../../dashboard/ChartsDashboard';
import { Costratiograph } from '../../../dashboard/CostRatioGraph';
import { getCostRatioReport, getFormGridData } from '../../actions/ReportListing';

const CostRatioListing = (props) => {
    const [tableData, setTableData] = useState([])
    const [pieChartDataArray, setPieChartDataArray] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const [gridDataState, setGridDataState] = useState()
    const dispatch = useDispatch()

    const divRef = useRef()    // THIS IS CALCULATE  WIDTH OF THE PLANT AND VENDOR (CODE) 
    const { initialConfiguration } = useSelector(state => state.auth)
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)

    let gridData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate



    useEffect(() => {

        let obj = {}
        obj.FromDate = startDate
        obj.ToDate = endDate
        let sampleArray = []

        gridData && gridData.map((item) => {
            sampleArray.push({ PartId: item.PartId, RevisionNumber: item.RevisionNumber, PlantId: item.PlantId, VendorId: item.VendorId, TechnologyId: item.TechnologyId })
        })
        obj.CostingData = sampleArray

        setIsLoader(true)
        dispatch(getCostRatioReport(obj, (res) => {
            setIsLoader(false)
            let Data = res.data && res.data.DataList
            if (res.status === 200) {
                setTableData(Data)
                setIsLoader(false)
            } else {
                setIsLoader(false)
            }
        }))
        setGridDataState(costReportFormData)
    }, [])

    const cancelReport = () => {
        dispatch(getFormGridData(gridDataState))
        props?.viewListing(false)
    }

    /**
   * @Method viewPieData
   * @description Set the pie chart data
   */
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

    /**
    * @Object pieChartData
    * @description In this object set the data and color for pie chart
    */
    const pieChartData = {
        labels: ['RM', 'BOP', 'PROC.', 'OPER.', 'OTH. OPER.', 'CC', 'ST', 'OH', 'PROF.', 'REJ.', 'ICC', 'PAY.& TERM', 'P&F', 'OTH. COST', 'TC', 'DIS.'],
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
                borderWidth: 1,
            },
        ],

    };

    /**
    * @Object pieChartOption
    * @description In this object set the data bottom data and color in pie chart section
    */
    const pieChartOption = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxWidth: 16,
                    borderWidth: 0,
                    padding: 8,
                    color: '#000'
                }
            },
        },
    }
    return (
        <>
            <div className='container-fluid costing-ratio-report'>
                {isLoader && <LoaderCustom />}
                <div className='row overflow-auto report-height'>
                    <div className='w-100 mb-2 d-flex justify-content-end'>
                        <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
                    </div>
                    {tableData?.length === 0 ? <div className='d-flex w-100 align-items-center'><NoContentFound title={EMPTY_DATA} /></div> : <Table className='border px-0 mb-0'>
                        <thead>
                            <tr>
                                <th>
                                    <div className='column-data'> Costing Head</div>
                                    <div className='column-data'>Costing Number</div>
                                    <div className='column-data'>Technology</div>
                                    <div className='column-data'>Part No.</div>
                                    <div className='column-data'>Revision No.</div>
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
                                            <div className='column-data'>{item.Technology ? item.Technology : '-'} </div>
                                            <div className='column-data'>{item.PartNumber ? item.PartNumber : '-'} </div>
                                            <div className='column-data'>{item.RevisionNumber ? item.RevisionNumber : '-'} </div>
                                            <div className={`column-data code-container`} ref={divRef} >{(item.VendorName || item.VendorCode) ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span className='name'>{item.VendorName}</span> <span>({item.VendorCode})</span></div> : '-'}</div>
                                            <div className='column-data code-container' ref={divRef} >{(item.PlantName || item.PlantCode) ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span className='name'>{item.PlantName}</span> <span>({item.PlantCode})</span></div> : '-'}</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice)} </div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPOPriceOtherCurrency, initialConfiguration.NoOfDecimalForPrice)}</div>
                                            <div className='column-data'>{item.NetPOPriceINR && <button className='view-pie-button btn-hyper-link ml-0' onMouseOver={() => viewPieData(index)}><span className='tooltiptext graph-tooltip'><div className='mb-2'><strong>All value is showing in Percentage</strong></div><Costratiograph data={pieChartData} options={pieChartOption} /></span>View Graph</button>}</div>

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
                    </Table>}
                </div>
            </div>
        </>

    );
}
export default CostRatioListing;