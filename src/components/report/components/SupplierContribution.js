import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Col, Row } from "reactstrap"
import { EMPTY_DATA, ZBC } from "../../../config/constants"
import { getConfigurationKey, getCurrencySymbol, loggedInUserId } from "../../../helper"
import DayTime from "../../common/DayTimeWrapper"
import Toaster from "../../common/Toaster"
import { getCostingSpecificTechnology, getPartInfo } from "../../costing/actions/Costing"
import { DatePickerHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs"
import { getSupplierContributionData } from "../actions/ReportListing"
import { getPlantSelectListByType } from "../../../actions/Common"
import { Doughnut } from 'react-chartjs-2';
import { colorArray } from "../../dashboard/ChartsDashboard"
import NoContentFound from "../../common/NoContentFound"

const gridOptions = {}
function SupplierContributionReport(props) {

    const [totalCost, setTotalCost] = useState("")
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
    const [doughnutColor, setDoughnutColor] = useState([])

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
        if (startDate && endDate) {
            let data = {}
            setNoContent(true)
            setGraphListing(false)
            data.fromDate = startDate
            data.toDate = endDate
            dispatch(getSupplierContributionData(data, (res) => {
                let vendors = []
                let vendorPrice = []
                setTimeout(() => {
                    setGraphListing(true)
                }, 500);
                let Data = res.data.Data
                setTotalCost(Data.TotalBuying)
                Data.VendorWiseData.map((item) => {
                    vendors.push(item.Vendor)
                    vendorPrice.push(item.VendorBuying)
                })
                setVendorArray(vendors)
                setVendorData(vendorPrice)
                setNoContent(false)
                setDoughnutColor(colorArray);
            }))
        } else {
            Toaster.warning("Please enter from date, to date")
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
        maintainAspectRatio: false,
        // responsive: true,
        // maintainAspectRatio: true,
        layout: {
            padding: 20,
        },

        plugins: {
            legend: {
                display: false
            }
        }
    };


    const doughnutLabelsLine = {

        id: 'doughnutLabelsLine',
        beforeDraw(chart, args, options) {
            chart.ctx.canvas.style.width = '1000px'
            // chart.ctx.canvas.style.height = '800px'
        },

        afterDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;

            ctx.restore();
            var fontSize = (width + 3) / width;
            ctx.font = fontSize + "em sans-serif";
            ctx.textBaseline = "top";
            var text = `${getCurrencySymbol(getConfigurationKey().BaseCurrency)} ${totalCost.toLocaleString()}`,
                textX = width / 2.1,
                textY = height / 2;
            ctx.fillText(text, textX, textY);
            ctx.save();

            chart.data.datasets.forEach((dataset, i) => {

                chart.getDatasetMeta(i).data.forEach((datapoint, index) => {

                    const { x, y } = datapoint.tooltipPosition()
                    //
                    // ctx.fillStyle = 'Black';
                    // ctx.fill();
                    // ctx.fillRect(x, y, 1, 1)

                    //draw line
                    const halfwidth = width / 2;
                    const halfheight = height / 2;

                    let xLine = x >= halfwidth ? x + 35 : x - 35;
                    let yLine = y >= halfheight ? y + 35 : y - 35;
                    let extraLine = x >= halfwidth ? 35 : -35

                    if (index % 2 == 0) {
                        xLine = x >= halfwidth ? x + 25 : x - 25;
                        yLine = y >= halfheight ? y + 25 : y - 25;
                        extraLine = x >= halfwidth ? 25 : -25

                    } else {
                        xLine = x >= halfwidth ? x + 55 : x - 55;
                        yLine = y >= halfheight ? y + 55 : y - 55;
                        extraLine = x >= halfwidth ? 55 : -55

                    }

                    //line
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(xLine, yLine);
                    ctx.lineTo(xLine + extraLine, yLine);
                    // ctx.strokeStyle = dataset.backgroundColor[index]
                    ctx.strokeStyle = 'Black'
                    ctx.stroke();

                    //text
                    const textWidth = ctx.measureText(chart.data.labels[index]).width;
                    ctx.font = '15px Arial';

                    const textXposition = x >= halfwidth ? 'left' : 'right';
                    const plusFivePx = x >= halfwidth ? 5 : -5;
                    ctx.textAlign = textXposition;
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = dataset.backgroundColor[index]
                    ctx.fillText(chart.data.labels[index], xLine + extraLine + plusFivePx, yLine);
                })
            })
        }
    }

    const data3 = {
        labels: vendorArray,
        datasets: [
            {
                label: '',
                data: vendorData,
                backgroundColor: doughnutColor,
                // borderWidth: 1,
                cutout: '70%',
                width: 200,
                height: 200
                // borderRadius: 20,
                // offset: 10
            },
        ],
    };

    return (

        <>{reportListing &&
            < div className="container-fluid custom-pagination report-listing-page ag-grid-react" >
                <form noValidate >
                    <h1 className="mb-0">Supplier Contribution Report</h1>
                    <Row className="pt-3 mb-5">
                        <Col md="3" className="form-group mb-0">
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
                                    placeholder="Select date"
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
                        </Col>
                        <Col md="3" className="form-group mb-0">
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
                                    placeholder="Select date"
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
                        </Col>
                        <Col md="3">
                            <div className="ag-grid-multi">
                                <SearchableSelectHookForm
                                    label={"Plant"}
                                    name={"plant"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    options={renderListing('plant')}
                                    isMulti={false}
                                    mandatory={false}
                                    dropDownClass={true}
                                    handleChange={(e) => {
                                        valueChanged(e)
                                    }}
                                />
                            </div>
                        </Col>
                        <Col md="3" className="d-flex align-items-center mt-3">
                            <button
                                type="button"
                                className={'user-btn pull-left '}
                                onClick={() => runReport()}>
                                <div className='save-icon mr-0'></div>
                            </button>
                            <button
                                type="button"
                                className={"reset-btn pull-left  ml5"}
                                onClick={() => resetReport()}>
                                {"RESET"}
                            </button>
                        </Col>
                    </Row>
                </form>

            </div >}

            {graphListing &&
                <div className="doughnut-graph-container">
                    <div className="doughnut-graph">
                        <Doughnut type="outlabeledDoughnut" data={data3} options={options3} plugins={[doughnutLabelsLine]} height="600" width={600} />
                    </div>
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