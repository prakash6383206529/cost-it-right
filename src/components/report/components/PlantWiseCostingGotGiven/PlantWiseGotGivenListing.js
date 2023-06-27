import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import { DATE_TYPE } from '../../../../config/constants';
import { useState } from 'react';
import { useEffect } from 'react';
import { getCostingGotAndGivenDetails, getCostingGotAndGivenDetailsPlantWise } from '../../actions/ReportListing';
import LoaderCustom from '../../../common/LoaderCustom';

const mainHeaders = ["Month", "Part Number", "Part Name", "Revision Number", "Plant(Code)", "Plant Address", "Vendor(Code)", "Customer(Code)", "Budgeted Quantity", "Approved Quantity", "Effective Date"]

function PlantWiseGotGivenListing(props) {
    const formData = useSelector(state => state.report.costReportFormGridData);
    const { initialConfiguration } = useSelector(state => state.auth)
    const [tableData, setTableData] = useState([]);
    const [gotDetails, setGotDetails] = useState([]);
    const [givenDetails, setGivenDetails] = useState([]);
    const [isLoader, setIsLoader] = useState('')
    const [topHeaderData, setTopHeaderData] = useState({})
    const dispatch = useDispatch()

    const cancelReport = () => {
        props.closeDrawer('')
    }

    const leftHeaderClass = "font-weight-500 custom-min-width-140px"
    const checkValidData = (value, type = '') => {
        if (type === DATE_TYPE) {
            return value ? DayTime(value).format('DD/MM/YYYY') : '-'
        } else {
            return value ? value : '-'
        }
    }

    const renderTableHeaders = (headers) => {
        return headers.map((item, index) => {
            return <td key={index}>{item}</td>;
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


    const gotGivenLabels = () => {
        let Data = gotDetails.HeaderName
        let DataSecond = givenDetails.HeaderName

        return (<>
            < td className='text-center font-weight-500 font-size-16' > {Data?.Part}</td >
            {
                Data?.SurfaceTreatmentNames.map((item) => {
                    return < td className='text-center font-weight-500 font-size-16' > {item}</td >
                })
            }
            < td className='text-center font-weight-500 font-size-16' > {Data?.TotalOfPartAndSurfaceTreatment}</td >
            < td className='text-center font-weight-500 font-size-16' > {Data?.BudgetedHeadWiseCosting}</td >
            < td className='text-center font-weight-500 font-size-16' > {Data?.ActualHeadWiseCosting}</td >

            {/* GIVEN DETAILS */}
            < td className='text-center font-weight-500 font-size-16' > {DataSecond?.Part}</td >
            {
                DataSecond?.SurfaceTreatmentNames.map((item) => {
                    return < td className='text-center font-weight-500 font-size-16' > {item}</td >
                })
            }
            < td className='text-center font-weight-500 font-size-16' > {DataSecond?.TotalOfPartAndSurfaceTreatment}</td >
            < td className='text-center font-weight-500 font-size-16' > {DataSecond?.BudgetedHeadWiseCosting}</td >
            < td className='text-center font-weight-500 font-size-16' > {DataSecond?.ActualHeadWiseCosting}</td >
        </>
        )
    }

    useEffect(() => {
        let obj = {}
        obj.effectiveDate = DayTime(formData?.EffectiveDate).format('YYYY-MM-DDTHH:mm:ss')
        obj.partId = formData?.part?.value
        obj.plantId = formData?.plant?.value
        obj.vendorId = formData?.vendor?.value
        obj.customerId = formData?.customer?.value

        setIsLoader(true)
        dispatch(getCostingGotAndGivenDetailsPlantWise(obj, (res) => {
            let Data = res.data && res.data.Data
            if (res.status === 200) {
                let GotDetails = Data.GotDetails
                let GivenDetails = Data.GivenDetails
                setGivenDetails(Data.GivenDetails)
                setGotDetails(Data.GotDetails)


                setIsLoader(false)

            } else {
                setIsLoader(false)
            }
        }))

    }, [])


    return <>
        {isLoader && <LoaderCustom />}
        <div className='d-flex justify-content-end'>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
        <div>
            <Table className='mt-2 table-bordered'>
                <thead>
                    <tr>
                        {renderTableHeaders(mainHeaders)}
                    </tr>
                </thead>
                <thead>
                    <tr>
                        {renderTableCells([topHeaderData.Month, topHeaderData.PartNumber, topHeaderData.PartName, topHeaderData.RevisionNumber, topHeaderData.PlantName, topHeaderData.PlantAddress, topHeaderData.VendorName, topHeaderData.CustomerName, topHeaderData.BudgetedQuantity, topHeaderData.ApprovedQuantity, topHeaderData.EffectiveDate])}
                    </tr>
                </thead>
            </Table>
            <Table responsive className='table-bordered mb-0'>
                <tbody>
                    <tr>
                        <td></td>
                        <td colSpan={tableData ? (tableData[0]?.fields?.length) / 2 : 5} className='text-center font-weight-500 font-size-16'>Got Details</td>
                        <td colSpan={tableData ? (tableData[0]?.fields?.length) / 2 : 5} className='text-center font-weight-500 font-size-16'>Given Details</td>
                    </tr>
                    <tr>
                        <td className='text-center font-weight-500 font-size-16'>Parameters</td>
                        {gotGivenLabels()}
                    </tr>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={leftHeaderClass}>{row.label}</td>
                            {row.fields.map((field, fieldIndex) => (
                                <td key={fieldIndex}>
                                    {row.label === 'Raw Material Effective Date' ? checkValidData(field, DATE_TYPE) : checkForDecimalAndNull(field, initialConfiguration.NoOfDecimalForPrice)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div >
    </>
}
export default PlantWiseGotGivenListing