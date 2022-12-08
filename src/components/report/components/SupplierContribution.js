import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Col, Row } from "reactstrap"
import { EMPTY_DATA, ZBC } from "../../../config/constants"
import { loggedInUserId } from "../../../helper"
import DayTime from "../../common/DayTimeWrapper"
import Toaster from "../../common/Toaster"
import { getCostingSpecificTechnology, getPartInfo } from "../../costing/actions/Costing"
import { DatePickerHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs"
import { getSupplierContributionData } from "../actions/ReportListing"
import { getPlantSelectListByType } from "../../../actions/Common"
import { Doughnut } from 'react-chartjs-2';
import { graphColor1, graphColor3, graphColor4, graphColor7 } from "../../dashboard/ChartsDashboard"
import NoContentFound from "../../common/NoContentFound"

const gridOptions = {}
function SupplierContributionReport(props) {

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reportListing, setReportListing] = useState(true)
    const [graphListing, setGraphListing] = useState(false)
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [plants, setPlants] = useState([])
    const [isPlantSelected, setIsPlantSelected] = useState(false)
    const [vendorArray, setVendorArray] = useState([])
    const [vendorData, setVendorData] = useState([])
    const [noContent, setNoContent] = useState(false)

    const dispatch = useDispatch()
    const { control, register, getValues, reset, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))
        dispatch(getPlantSelectListByType(ZBC, (res) => {
            setPlants(res?.data?.DataList)
        }))

    }, [])


    const handleFromEffectiveDateChange = (value) => {
        if (value) {
            setStartDate(DayTime(value).format('DD/MM/YYYY'))
            setMinDate(value)
        }
    }


    const handleToEffectiveDateChange = (value) => {
        if (value) {
            setEndDate(DayTime(value).format('DD/MM/YYYY'))
            setMaxDate(value)
        }
    }

    const renderListing = (label) => {
        const temp = []
        if (label === 'plant') {
            plants && plants.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantName, value: item.PlantId })
                return null
            })
            return temp
        }
    }


    const runReport = () => {

        if (startDate && endDate && isPlantSelected) {
            let data = {}
            setNoContent(true)
            setGraphListing(false)
            data.fromDate = startDate
            data.toDate = endDate
            data.plantId = getValues('plant').value

            dispatch(getSupplierContributionData(data, (res) => {

                let vendors = []
                let vendorPrice = []
                setGraphListing(true)
                let Data = res.data.Data
                Data.VendorWiseData.map((item) => {
                    vendors.push(item.Vendor)
                    vendorPrice.push(item.VendorBuying)
                })
                setVendorArray(vendors)
                setVendorData(vendorPrice)
                setNoContent(false)
            }))

        } else {
            Toaster.warning("Please enter from date, to date & plant.")
        }

    }


    const resetReport = () => {
        setGraphListing(false)
        reset({
            fromDate: '',
            toDate: '',
            plant: ''
        })
        setStartDate('')
        setEndDate('')
        setIsPlantSelected(false)
    }

    const valueChanged = (e) => {
        setIsPlantSelected(true)
    }

    const options3 = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 15,
                    borderWidth: 1,
                    borderColor: [
                        graphColor1,
                        graphColor4,
                        graphColor3,
                        graphColor7,
                        graphColor1,
                        graphColor4,
                        graphColor3,
                        graphColor7,

                    ],
                }
            },
        },
    };

    const data3 = {
        labels: vendorArray,
        datasets: [
            {
                label: '',
                data: vendorData,
                backgroundColor: [
                    graphColor1,
                    graphColor4,
                    graphColor3,
                    graphColor7,
                    graphColor1,
                    graphColor4,
                    graphColor3,
                    graphColor7
                ],
                borderColor: [
                    '#fff',
                    '#fff',
                    '#fff',
                    '#fff',
                    '#fff',
                    '#fff',
                    '#fff',
                ],
                borderWidth: 2,
            },
        ],
    };


    return (

        <>{reportListing &&
            < div className="container-fluid custom-pagination report-listing-page ag-grid-react" >
                <form noValidate >

                    <h1 className="mb-0">Supplier Contribution Report</h1>
                    <Row className="pt-2 mb-5">
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`fromDate`}
                                    label={'From Date'}
                                    handleChange={(date) => {
                                        handleFromEffectiveDateChange(date);
                                    }}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    dropdownMode="select"
                                    maxDate={maxDate}
                                    placeholderText="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={false}
                                    mandatory={true}
                                    errors={errors && errors.fromDate}
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`toDate`}
                                    label={'To Date'}
                                    handleChange={(date) => {
                                        handleToEffectiveDateChange(date);
                                    }}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    minDate={minDate}
                                    dropdownMode="select"
                                    placeholderText="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={false}
                                    mandatory={true}
                                    errors={errors && errors.toDate}
                                />
                            </div>
                        </div>
                    </Row>


                    <Row className="part-detail-wrapper">

                        <div className="ag-grid-multi">
                            {
                                <SearchableSelectHookForm
                                    label={"Plant"}
                                    name={"plant"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    options={renderListing('plant')}
                                    isMulti={false}
                                    mandatory={true}
                                    dropDownClass={true}
                                    handleChange={(e) => {
                                        valueChanged(e)
                                    }}
                                />
                            }
                        </div>

                        <Col md="4" className='d-flex align-items-center pb-1'>
                            <button
                                type="button"
                                className={'user-btn pull-left ml-2'}
                                onClick={() => runReport()}

                            >
                                <div className={'plus'}></div>{"RUN"}
                            </button>
                            <button
                                type="button"
                                className={'user-btn pull-left ml-2'}
                                onClick={() => resetReport()}

                            >
                                <div className={'plus'}></div>{"RESET"}
                            </button>

                        </Col>
                    </Row>
                </form>

            </div >}

            {graphListing &&
                <div className="">
                    <Doughnut data={data3} options={options3} />
                </div>

            }
            {noContent &&
                <NoContentFound
                    title={EMPTY_DATA}
                />
            }
        </>

    )
}
export default SupplierContributionReport