import { debounce } from 'lodash';
import React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Table } from 'reactstrap';
import { EMPTY_DATA } from '../../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey, getCurrencySymbol, showBopLabel } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import { colorArray } from '../../../dashboard/ChartsDashboard';
import { Costratiograph } from '../../../dashboard/CostRatioGraph';
import { getCostRatioReport, getFormGridData } from '../../actions/ReportListing';

const CostRatioListing = (props) => {
    const [tableData, setTableData] = useState([])
    const [pieChartDataArray, setPieChartDataArray] = useState([])
    const [pieChartLabelArray, setPieChartLabelArray] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const [noContentData, setNoContentData] = useState(false)
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
        obj.FromDate = startDate ? DayTime(startDate).format('MM/DD/YYYY') : ''
        obj.ToDate = endDate ? DayTime(endDate).format('MM/DD/YYYY') : ''
        let sampleArray = []

        gridData && gridData.map((item) => {
            sampleArray.push({ PartId: item.PartId, RevisionNumber: item.RevisionNumber, PlantId: item.PlantId, VendorId: item.VendorId, TechnologyId: item.TechnologyId })
        })
        obj.CostingData = sampleArray

        setIsLoader(true)
        dispatch(getCostRatioReport(obj, (res) => {
            setNoContentData(true)
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

        let labelArray = []
        let labels = ['RM', 'BOP', 'PROC.', 'OPER.', 'OTHER OPER.', 'CC', 'ST', 'OH', 'PROF.', 'REJ.', 'ICC', 'PAYMENT', 'P&F', 'OTHER COST', 'TC', 'DIS.']
        temp && temp.map((item, index) => {
            if (item !== 0) {
                labelArray.push(labels[index])
            }
        })
        let dataArray = []
        labelArray && labelArray.map((item, index) => {
            switch (item) {
                case 'RM':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetRawMaterialsCostPercentage, 2))
                    break;
                case 'BOP':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetBoughtOutPartCostPercentage, 2))
                    break;
                case 'PROC.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetProcessCostPercentage, 2))
                    break;
                case 'OPER.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetOperationCostPercentage, 2))
                    break;
                case 'OTHER OPER.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetOtherOperationCostPercentage, 2))
                    break;
                case 'CC':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetConversionCostPercentage, 2))
                    break;
                case 'ST':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetSurfaceTreatmentCostPercentage, 2))
                    break;
                case 'OH':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetOverheadCostPercentage, 2))
                    break;
                case 'PROF.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetProfitCostPercentage, 2))
                    break;
                case 'REJ.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetRejectionCostPercentage, 2))
                    break;
                case 'ICC':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetICCCostPercentage, 2))
                    break;
                case 'PAYMENT':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetPaymentTermCostPercentage, 2))
                    break;
                case 'P&F':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetPackagingAndFreightCostPercentage, 2))
                    break;
                case 'OTHER COST':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetOtherCostPercentage, 2))
                    break;
                case 'TC':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetToolCostPercentage, 2))
                    break;
                case 'DIS.':
                    dataArray.push(checkForDecimalAndNull(tempObj.NetDiscountCostPercentage, 2))
                    break;
                default:
                    break;
            }
        })
        setPieChartDataArray(dataArray)
        setPieChartLabelArray(labelArray)
    }, [100])

    /**
    * @Object pieChartData
    * @description In this object set the data and color for pie chart
    */
    const pieChartData = {
        labels: pieChartLabelArray,
        datasets: [
            {
                label: '',
                data: pieChartDataArray,
                backgroundColor: colorArray,
                borderWidth: 0.5,
                hoverOffset: 10
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
        layout: {
            padding: {
                top: 30
            }
        }
    }
    return (
        <>
            <div className='container-fluid costing-ratio-report'>
                {isLoader && <LoaderCustom />}
                <div className='w-100 mb-2 d-flex justify-content-end'>
                    <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
                </div>
                <div className='row overflow-auto report-height'>
                    {tableData?.length === 0 ? <div className='d-flex w-100 align-items-center'>{noContentData && <NoContentFound title={'Cost card is not available for this date range'} />}</div> : <Table className='border px-0 mb-0'>
                        <thead>
                            <tr>
                                <th>
                                    <div className='column-data'> Costing Head</div>
                                    <div className='column-data'>Costing Number</div>
                                    <div className='column-data'>Technology</div>
                                    <div className='column-data'>Effective Date</div>
                                    <div className='column-data'>Part No.</div>
                                    <div className='column-data'>Revision No.</div>
                                    <div className='column-data'> Vendor (Code)</div>
                                    <div className='column-data'>Plant (Code)</div>
                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <div className='column-data'>Basic Price</div>}
                                    <div className='column-data'> Net Cost</div>
                                    <div className='column-data'>Net Cost (Currency)</div>
                                    <div className='column-data'>Graph</div>
                                </th>
                                {tableData && tableData.map((item, index) => {
                                    return <>
                                        <th className={`${tableData?.length >= 3 ? 'right-position' : ''}`}>
                                            <div className='column-data'>{item.CostingHead ? item.CostingHead : '-'}</div>
                                            <div className='column-data'>{item.CostingNumber ? item.CostingNumber : '-'}</div>
                                            <div className='column-data'>{item.Technology ? item.Technology : '-'} </div>
                                            <div className='column-data'>{item.EffectiveDate ? DayTime(item.EffectiveDate).format('DD/MM/YYYY') : '-'} </div>
                                            <div className='column-data'>{item.PartNumber ? item.PartNumber : '-'} </div>
                                            <div className='column-data'>{item.RevisionNumber ? item.RevisionNumber : '-'} </div>
                                            <div className={`column-data code-container`} ref={divRef} >{(item.VendorName !== '-' || item.VendorCode !== '-') ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span title={item.VendorName + " (" + item.VendorCode + ")"} className='name'>{item.VendorName}</span> <span>({item.VendorCode})</span></div> : '-'}</div>
                                            <div className='column-data code-container' ref={divRef} >{(item.PlantName || item.PlantCode) ? <div className={`code-specific ${tableData?.length >= 3 ? 'max-height-reduce' : ''}`} style={{ maxWidth: divRef?.current?.clientWidth }}><span className='name' title={item.PlantName + " (" + item.PlantCode + ")"}>{item.PlantName}</span> <span>({item.PlantCode})</span></div> : '-'}</div>
                                            {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <div className='column-data'>{getCurrencySymbol(getConfigurationKey().BaseCurrency)} {checkForDecimalAndNull(item.BasicRate, initialConfiguration.NoOfDecimalForPrice)} </div>}
                                            <div className='column-data'>{getCurrencySymbol(getConfigurationKey().BaseCurrency)} {checkForDecimalAndNull(item.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice)} </div>
                                            <div className='column-data'>{item.Currency ? getCurrencySymbol(item.Currency) : ''} {checkForDecimalAndNull(item.NetPOPriceOtherCurrency, initialConfiguration.NoOfDecimalForPrice)}</div>
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
                                    <div className='column-data'>Net {showBopLabel()} Cost (%)</div>
                                    <div className='column-data'>Process Cost (%)</div>
                                    <div className='column-data'>Operation Cost (%)</div>
                                    <div className='column-data'>Other Operation Cost (%)</div>
                                    <div className='column-data'>Conversion Cost (%)</div>
                                    <div className='column-data'>Surface Cost (%)</div>
                                    <div className='column-data'>Overhead Cost (%)</div>
                                    <div className='column-data'>Profit Cost (%)</div>
                                    <div className='column-data'>Rejection Cost (%)</div>
                                    <div className='column-data'>ICC Cost (%)</div>
                                    <div className='column-data'>Packaging & Freight Cost (%)</div>
                                    <div className='column-data'>Other Cost (%)</div>
                                    <div className='column-data'>Tool Cost (%)</div>
                                    <div className='column-data'>Discount Cost (%)</div>
                                    <div className='column-data'>Payment Term Cost (%)</div>
                                </td>
                                {tableData && tableData.map(item => {
                                    return <>
                                        <td>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetRawMaterialsCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetBoughtOutPartCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetProcessCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetProcessCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOperationCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetOperationCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOtherOperationCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetOtherOperationCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetConversionCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetConversionCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetSurfaceTreatmentCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOverheadCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetOverheadCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetProfitCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetProfitCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetRejectionCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetRejectionCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetRejectionCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetICCCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPackagingAndFreightCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetPackagingAndFreightCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetOtherCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetOtherCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetToolCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetToolCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetDiscountCostPercentage, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetDiscountCostPercentage, 2)})</div>
                                            <div className='column-data'>{checkForDecimalAndNull(item.NetPaymentTermCost, initialConfiguration.NoOfDecimalForPrice)}({checkForDecimalAndNull(item.NetPaymentTermCostPercentage, 2)})</div>
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