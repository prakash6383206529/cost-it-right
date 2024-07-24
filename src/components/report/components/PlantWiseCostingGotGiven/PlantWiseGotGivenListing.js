import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import { DATE_TYPE, PLANT_HEAD_WISE } from '../../../../config/constants';
import { useState } from 'react';
import { useEffect } from 'react';
import { getPlantWiseGotAndGivenDetails } from '../../actions/ReportListing';
import LoaderCustom from '../../../common/LoaderCustom';
// import ReactExport from 'react-export-excel';
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const mainHeaders = ["Month", "Plant(Code)", "Plant Address", "Net Sales", "Effective Date"]
const headers = ['Performance  Parameters', 'Amount Rs in Crore', 'Percentage(%)']
function PlantWiseGotGivenListing(props) {
    const formData = useSelector(state => state.report.costReportFormGridData);
    const { initialConfiguration } = useSelector(state => state.auth)
    const [tableData, setTableData] = useState([]);
    const [isLoader, setIsLoader] = useState('')
    const [topHeaderData, setTopHeaderData] = useState([])
    const dispatch = useDispatch()

    const cancelReport = () => {
        props.closeDrawer('')
    }

    const checkValidData = (value, type = '') => {
        if (type === DATE_TYPE) {
            return value ? DayTime(value).format('DD/MM/YYYY') : '-'
        } else {
            return value ? value : '-'
        }
    }

    const renderTableHeaders = (headers) => {
        return headers.map((item, index) => {
            return <td key={index} >{item}</td>;
        });
    };
    const renderTableCells = (data) => {
        return data.map((value, index) => {
            if (DayTime(value).format('DD/MM/YYYY') === DayTime(formData?.EffectiveDate).format('DD/MM/YYYY')) {
                return <td key={index}>{checkValidData(value, DATE_TYPE)}</td>;
            } else {
                return <td key={index}>{checkValidData(value)}</td>;
            }
        });
    };

    useEffect(() => {
        let obj = {}
        obj.effectiveDate = DayTime(formData?.EffectiveDate).format('YYYY-MM-DDTHH:mm:ss')
        obj.partId = formData?.part?.value
        obj.plantId = formData?.plant?.value
        obj.vendorId = formData?.vendor?.value
        obj.customerId = formData?.customer?.value

        setIsLoader(true)
        dispatch(getPlantWiseGotAndGivenDetails(obj, (res) => {
            let Data = res.data && res.data.Data
            if (res.status === 200) {
                let obj = {
                    PlantName: Data.Plant,
                    NetSales: checkForDecimalAndNull(Data.NetSales.NetCost, initialConfiguration.NoOfDecimalForPrice),
                    EffectiveDate: Data.SelectedEffectiveDate ? DayTime(Data.SelectedEffectiveDate).format('DD/MM/YYYY') : '-',
                    Month: Data.Month,
                    PlantAddress: Data.PlantAddress,
                }

                setTopHeaderData([obj]);
                const TemplateData = [
                    {
                        label: 'Consumption',
                        NetCost: checkForDecimalAndNull(Data.Consumption.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.Consumption.Percentage,
                    },
                    {
                        label: 'Labour Cost',
                        NetCost: checkForDecimalAndNull(Data.LabourCost.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.LabourCost.Percentage,
                    },
                    {
                        label: 'Manufacturing Expenses',
                        NetCost: checkForDecimalAndNull(Data.ManufacturingExpenses.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.ManufacturingExpenses.Percentage,
                    },
                    {
                        label: 'Office Expenses',
                        NetCost: checkForDecimalAndNull(Data.OfficeExpenses.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.OfficeExpenses.Percentage,
                    },
                    {
                        label: 'Repairs Expenses',
                        NetCost: checkForDecimalAndNull(Data.RepairsExpenses.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.RepairsExpenses.Percentage,
                    },
                    {
                        label: 'Selling and Distribution Expenses',
                        NetCost: checkForDecimalAndNull(Data.SellingAndDistributionExpenses.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.SellingAndDistributionExpenses.Percentage,
                    },
                    {
                        label: 'Common Expenses',
                        NetCost: checkForDecimalAndNull(Data.CommonExpenses.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.CommonExpenses.Percentage,
                    },
                    {
                        label: 'Staff Cost',
                        NetCost: checkForDecimalAndNull(Data.StaffCost.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.StaffCost.Percentage,
                    },
                    {
                        label: 'EBIDTA',
                        NetCost: checkForDecimalAndNull(Data.EBIDTA.NetCost, initialConfiguration.NoOfDecimalForPrice),
                        Percentage: Data.EBIDTA.Percentage,
                    },
                ]
                setTableData(TemplateData)


                setIsLoader(false)

            } else {
                setIsLoader(false)
            }
        }))

    }, [])
    const renderexcel = () => {
        let mainHeaderArray = []
        let tableArray = []

        topHeaderData?.map((item) => {
            let tempArray = []
            tempArray?.push(item?.Month)
            tempArray?.push(item?.PlantName)
            tempArray?.push(item?.PlantAddress)
            tempArray?.push(item?.NetSales)
            tempArray?.push(item?.EffectiveDate)
            mainHeaderArray.push(tempArray)
            return null
        })
        tableData?.map((item) => {
            let tempArray = []
            tempArray?.push(item?.label)
            tempArray?.push(item?.NetCost)
            tempArray?.push(item?.Percentage)
            tableArray.push(tempArray)
            return null
        })
        const multiDataSet = [
            {
                columns: mainHeaders,
                data: mainHeaderArray
            },
            {
                ySteps: 2, //will put space of 2 rows,
                columns: headers,
                data: tableArray
            },
        ];
        return multiDataSet
    }

    const returnExcelColumn = () => {
        let multiDataSet = renderexcel()
        // return (
        //     <ExcelSheet dataSet={multiDataSet} name={'ImpactMaster'} />
        // );
    }

    return <>
        {isLoader && <LoaderCustom />}
        <div className='d-flex justify-content-end'>
            {/* <ExcelFile filename={PLANT_HEAD_WISE} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                {returnExcelColumn()}
            </ExcelFile> */}
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div >
        <div>
            <Table className='mt-2 table-bordered'>
                <thead>
                    <tr>
                        {renderTableHeaders(mainHeaders)}
                    </tr>
                </thead>
                <thead>
                    <tr>
                        {topHeaderData && renderTableCells([topHeaderData[0]?.Month, topHeaderData[0]?.PlantName, topHeaderData[0]?.PlantAddress, topHeaderData[0]?.NetSales, topHeaderData[0]?.EffectiveDate])}
                    </tr >
                </thead >
            </Table >
            <Table responsive className='table-bordered mb-0'>
                <tbody>
                    <tr>
                        <td className='font-weight-500'>Performance  Parameters</td>
                        <td className='font-weight-500'>Amount Rs in Crore</td>
                        <td className='font-weight-500'>Percentage(%)</td>
                    </tr>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{row.label}</td>
                            <td>{checkForDecimalAndNull(row.NetCost, 18)}</td>
                            <td>{checkForDecimalAndNull(row.Percentage, 2)}{row.Percentage > 0 ? '%' : ''}</td>
                        </tr >
                    ))
                    }
                </tbody >
            </Table >
        </div >
    </>
}
export default PlantWiseGotGivenListing
