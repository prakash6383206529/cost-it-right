import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { Col, Row } from "reactstrap"
import { EMPTY_DATA, ZBC } from "../../../config/constants"
import { checkForDecimalAndNull, getConfigurationKey, getCurrencySymbol, loggedInUserId } from "../../../helper"
import DayTime from "../../common/DayTimeWrapper"
import Toaster from "../../common/Toaster"
import { getCostingSpecificTechnology, getPartInfo } from "../../costing/actions/Costing"
import { DatePickerHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs"
import { getSupplierContributionData } from "../actions/ReportListing"
import { getPlantSelectListByType, sidebarAndNavbarHide } from "../../../actions/Common"
import { Doughnut } from 'react-chartjs-2';
import { colorArray } from "../../dashboard/ChartsDashboard"
import NoContentFound from "../../common/NoContentFound"
import LoaderCustom from "../../common/LoaderCustom"

const gridOptions = {}
function SupplierContributionReport(props) {

    const [totalCost, setTotalCost] = useState("")
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [plant, setPlant] = useState('')
    const [reportListing, setReportListing] = useState(true)
    const [graphListing, setGraphListing] = useState(false)
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [plants, setPlants] = useState([])
    const [isPlantSelected, setIsPlantSelected] = useState(false)
    const [vendorArray, setVendorArray] = useState([])
    const [vendorData, setVendorData] = useState([])
    const [vendorPartCount, setVendorPartCount] = useState([])
    const [noContent, setNoContent] = useState(false)
    const [doughnutColor, setDoughnutColor] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const hideSideBarNavbar = useSelector(state => state.comman.sidebarAndNavbarHide)


    const dispatch = useDispatch()
    const { control, register, getValues, reset, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))
        dispatch(getPlantSelectListByType(ZBC, '', "REPORT", (res) => {
            setPlants(res?.data?.DataList)
        }))
        return () => {
            dispatch(sidebarAndNavbarHide(false))
        }

    }, [])


    const handleFromEffectiveDateChange = (value) => {
        if (value) {
            setStartDate(value)
            setMinDate(value)
        }
    }


    const handleToEffectiveDateChange = (value) => {
        if (value) {
            setEndDate(value)
            setMaxDate(value)
        }
    }

    const renderListing = (label) => {
        const temp = []
        if (label === 'plant') {
            plants && plants.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
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
            data.fromDate = DayTime(startDate).format('MM/DD/YYYY')
            data.toDate = DayTime(endDate).format('MM/DD/YYYY')
            data.plantId = plant.value ? plant.value : ''
            dispatch(sidebarAndNavbarHide(false))
            setIsLoader(true)
            dispatch(getSupplierContributionData(data, (res) => {
                let vendors = []
                let vendorPrice = []
                let vendorPartCount = []
                setTimeout(() => {
                    setIsLoader(false)
                }, 500);
                if (res && res.status === 200) {
                    setTimeout(() => {
                        setGraphListing(true)
                        dispatch(sidebarAndNavbarHide(true))
                    }, 500);
                    if (res.data && res.data.Data) {
                        let Data = res.data.Data
                        setTotalCost(Data.TotalBuying)
                        Data.VendorWiseData.map((item) => {
                            vendors.push(item.Vendor)
                            vendorPrice.push(item.VendorBuying)
                            vendorPartCount.push(item.VendorPartCount)
                        })
                        setVendorArray(vendors)
                        setVendorData(vendorPrice)
                        setVendorPartCount(vendorPartCount)
                        setNoContent(false)
                        setDoughnutColor(colorArray);
                    }
                }
            }))
        } else {
            Toaster.warning("Please enter from date, to date")
        }
    }


    const resetReport = () => {
        setGraphListing(false)
        dispatch(sidebarAndNavbarHide(false))
        reset({
            fromDate: '',
            toDate: '',
            plant: ''
        })
        setStartDate('')
        setEndDate('')
        setIsPlantSelected(false)
        setPlant('')
    }

    const valueChanged = (e) => {
        setPlant(e)
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
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: (props?.rowData?.Currency) ? props.rowData.Currency : 'INR' }).format(context.parsed);
                        }
                        return `Price :${label} | No. of Parts: ${context?.dataset?.vendorPartCount[context?.dataIndex] ? (context?.dataset?.vendorPartCount[context?.dataIndex]) : '-'}`;
                    }
                }
            },
        }
    };


    const getSuitableY = (y, yArray = [], direction) => {
        let result = y;
        yArray.forEach((existedY) => {
            if (existedY - 14 < result && existedY + 14 > result) {
                if (direction === "right") {
                    result = existedY + 18;
                } else {
                    result = existedY - 18;
                }
            }
        });
        return result;
    };

    const plugins = [
        {
            id: 'doughnutLabelsLine',
            beforeDraw(chart, args, options) {
                chart.ctx.canvas.style.width = '1200px'
            },

            afterDraw: (chart) => {
                const { ctx, chartArea: { width, height } } = chart;
                ctx.restore();
                var fontSize = (width + 6) / width;
                ctx.font = 1.5 + "em sans-serif";
                ctx.textBaseline = "top";
                var text = `${getCurrencySymbol(getConfigurationKey().BaseCurrency)} ${totalCost.toLocaleString('en-IN')}`,
                    textX = width / (2.01 + (0.02 * (String(totalCost).length))),
                    textY = height / 2;
                ctx.fillText(text, textX, textY);
                ctx.save();

                ctx.save();
                ctx.font = "14px 'sans - serif'";
                const leftLabelCoordinates = [];
                const rightLabelCoordinates = [];
                const chartCenterPoint = {
                    x:
                        (chart.chartArea.right - chart.chartArea.left) / 2 +
                        chart.chartArea.left,
                    y:
                        (chart.chartArea.bottom - chart.chartArea.top) / 2 +
                        chart.chartArea.top
                };
                chart.config.data.labels.forEach((label, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const arc = meta.data[i];
                    const dataset = chart.config.data.datasets[0];

                    // Prepare data to draw
                    // important point 1
                    const centerPoint = arc.getCenterPoint();
                    const model = arc;
                    let color = model.borderColor;
                    let labelColor = model.borderColor;
                    if (dataset.polyline && dataset.polyline.color) {
                        color = dataset.polyline.color;
                    }

                    if (dataset.polyline && dataset.polyline.labelColor) {
                        labelColor = dataset.polyline.labelColor;
                    }

                    const angle = Math.atan2(
                        centerPoint.y - chartCenterPoint.y,
                        centerPoint.x - chartCenterPoint.x
                    );
                    // important point 2, this point overlapsed with existed points
                    // so we will reduce y by 14 if it's on the right
                    // or add by 14 if it's on the left
                    const point2X =
                        chartCenterPoint.x + Math.cos(angle) * (model.outerRadius + 15);
                    let point2Y =
                        chartCenterPoint.y + Math.sin(angle) * (model.outerRadius + 15);

                    let suitableY;
                    if (point2X < chartCenterPoint.x) {
                        // on the left
                        suitableY = getSuitableY(point2Y, leftLabelCoordinates, "left");
                    } else {
                        // on the right

                        suitableY = getSuitableY(point2Y, rightLabelCoordinates, "right");
                    }

                    point2Y = suitableY;

                    let value = dataset.data[i];
                    if (dataset.polyline && dataset.polyline.formatter) {
                        value = dataset.polyline.formatter(value);
                    }
                    let edgePointX = point2X < chartCenterPoint.x ? 10 : chart.width - 10;

                    if (point2X < chartCenterPoint.x) {
                        leftLabelCoordinates.push(point2Y);
                    } else {
                        rightLabelCoordinates.push(point2Y);
                    }
                    //DRAW CODE
                    // first line: connect between arc's center point and outside point
                    let percentage = checkForDecimalAndNull((chart.data.datasets[0].data[i] / totalCost) * 100, 8)
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(centerPoint.x, centerPoint.y);
                    ctx.lineTo(point2X, point2Y);
                    ctx.stroke();

                    // second line: connect between outside point and chart's edge
                    ctx.beginPath();
                    ctx.moveTo(point2X, point2Y);

                    let line
                    let labelSecond
                    let forLeftLine = edgePointX + 300
                    let forLeftLabel = edgePointX + 100

                    let forRightLine = edgePointX - 300
                    let forRightLabel = edgePointX - 130
                    if (edgePointX < chartCenterPoint.x) {
                        line = forLeftLine
                        labelSecond = forLeftLabel

                        if (chart.data.labels[i].length < 20) {
                            labelSecond = labelSecond + 30
                        }
                    } else {
                        line = forRightLine
                        labelSecond = forRightLabel

                        if (chart.data.labels[i].length < 15) {
                            labelSecond = labelSecond - 30
                        }

                        if (chart.data.labels[i].length > 25) {
                            labelSecond = labelSecond + 50
                        }

                        if (i === 9 && edgePointX > chartCenterPoint.x) {
                            labelSecond = labelSecond + 60
                            line = line + 30
                        }
                    }

                    ctx.lineTo(line, point2Y);
                    ctx.stroke();
                    //fill custom label
                    const labelAlignStyle =
                        edgePointX < chartCenterPoint.x ? "left" : "right";
                    const labelX = edgePointX;
                    const labelY = point2Y;
                    ctx.textAlign = labelAlignStyle;
                    ctx.textBaseline = "middle";
                    // ctx.fillStyle = labelColor;
                    ctx.fillStyle = '#000000db'
                    ctx.fillText(`${chart.data.labels[i]} - ${percentage}%`, labelSecond, labelY);

                });
                ctx.restore();
            }
        }
    ];


    const data3 = {
        labels: vendorArray,
        datasets: [
            {
                label: '',
                data: vendorData,
                backgroundColor: doughnutColor,
                vendorPartCount: vendorPartCount,
                // borderWidth: 1,
                cutout: '70%',
                width: 200,
                height: 200
                // borderRadius: 20,
                // offset: 10
            },
        ],
    };
    const exitReport = () => {
        dispatch(sidebarAndNavbarHide(false))
        setGraphListing(false)
    }
    return (

        <div className="p-relative">{reportListing &&
            < div className="container-fluid custom-pagination report-listing-page supplier-contribution ag-grid-react" >
                <form noValidate >
                    {!hideSideBarNavbar && <Row className=" mb-2">
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
                    </Row>}
                </form>

            </div >}
            {isLoader && <LoaderCustom customClass="loader-center" />}
            {hideSideBarNavbar && <div className="supplier-back-btn"><button type="button" className={"apply ml-1"} onClick={exitReport}> <div className={'back-icon'}></div>Back</button></div>}
            {graphListing &&
                <div className="doughnut-graph-container">
                    <div className="doughnut-graph">
                        <Doughnut type="outlabeledDoughnut" data={data3} options={options3} plugins={plugins} height="600" width={550} />
                    </div>
                </div>

            }
            {noContent && !isLoader &&
                <NoContentFound
                    title={'There are no supplier contribution for this plant'}
                />
            }
        </div>

    )
}
export default SupplierContributionReport