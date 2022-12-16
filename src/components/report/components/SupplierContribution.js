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
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 15,
                    borderWidth: 1,
                    borderColor: doughnutColor,
                }
            },
        },
        cutout: '70%',
        width: 600
    };

    const data3 = {
        labels: vendorArray,
        datasets: [
            {
                label: '',
                data: vendorData,
                backgroundColor: doughnutColor,
                borderWidth: 1,
            },
        ],

    };
    // const data3 = {
    //     labels: ["Red", "Blue", "Yellow", "Green", "Greek", "Greek"],
    //     datasets: [
    //         {
    //             label: "# of Votes",
    //             data: [30, 1, .4, 2, 0.3, 80],
    //             backgroundColor: [
    //                 "rgba(255, 99, 132, 0.8)",
    //                 "rgba(54, 162, 235, 0.8)",
    //                 "rgba(255, 206, 86, 0.8)",
    //                 "rgba(75, 192, 192, 0.8)",
    //                 "rgba(153, 102, 255, 0.8)",
    //                 "rgba(75, 192, 192, 0.8)",
    //                 "rgba(255, 159, 64, 0.8)"
    //             ],
    //             borderColor: [
    //                 "rgba(255, 99, 132, 1)",
    //                 "rgba(54, 162, 235, 1)",
    //                 "rgba(255, 206, 86, 1)",
    //                 "rgba(75, 192, 192, 1)",
    //                 "rgba(153, 102, 255, 1)",
    //                 "rgba(255, 159, 64, 1)",
    //                 "rgba(75, 192, 192, 1)"
    //             ],
    //             borderWidth: 1,
    //             polyline: {
    //                 //   color: "gray",
    //                 //   labelColor: "gray",
    //                 formatter: (value) => `${value}`
    //             }
    //         }
    //     ]
    // }
    const plugins = [{

        beforeDraw: function (chart) {
            var width = chart.width,
                height = chart.height,
                ctx = chart.ctx;
            ctx.restore();
            var fontSize = (width + 3) / width;
            ctx.font = fontSize + "em sans-serif";
            ctx.textBaseline = "top";
            var text = `${getCurrencySymbol(getConfigurationKey().BaseCurrency)} ${totalCost.toLocaleString()}`,
                textX = width / 2.35,
                textY = height / 2.35;
            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }]

    // const getSuitableY = (y, yArray = [], direction) => {
    //     let result = y;
    //     yArray.forEach((existedY) => {
    //         if (existedY - 14 < result && existedY + 14 > result) {
    //             if (direction === "right") {
    //                 result = existedY + 14;
    //             } else {
    //                 result = existedY - 14;
    //             }
    //         }
    //     });
    //     return result;
    // };

    // const getOriginPoints = (source, center, l) => {
    //     // console.log(source, center, l)

    //     let a = { x: 0, y: 0 };
    //     var dx = (center.x - source.x) / l
    //     var dy = (center.y - source.y) / l
    //     a.x = center.x + l * dx
    //     a.y = center.y + l * dy
    //     return a
    // };

    // const plugins = [
    //     {
    //         afterDraw: (chart) => {
    //             const ctx = chart.ctx;
    //             ctx.save();
    //             ctx.font = "10px 'Averta Std CY'";
    //             const leftLabelCoordinates = [];
    //             const rightLabelCoordinates = [];
    //             const chartCenterPoint = {
    //                 x:
    //                     (chart.chartArea.right - chart.chartArea.left) / 2 +
    //                     chart.chartArea.left,
    //                 y:
    //                     (chart.chartArea.bottom - chart.chartArea.top) / 2 +
    //                     chart.chartArea.top
    //             };
    //             chart.config.data.labels.forEach((label, i) => {
    //                 const meta = chart.getDatasetMeta(0);
    //                 const arc = meta.data[i];
    //                 const dataset = chart.config.data.datasets[0];

    //                 // Prepare data to draw
    //                 // important point 1
    //                 const centerPoint = arc.getCenterPoint();
    //                 let color = chart.config._config.data.datasets[0].backgroundColor[i];
    //                 let labelColor = chart.config._config.data.datasets[0].backgroundColor[i];


    //                 const angle = Math.atan2(
    //                     centerPoint.y - chartCenterPoint.y,
    //                     centerPoint.x - chartCenterPoint.x
    //                 );
    //                 // important point 2, this point overlapsed with existed points
    //                 // so we will reduce y by 14 if it's on the right
    //                 // or add by 14 if it's on the left
    //                 let originPoint = getOriginPoints(chartCenterPoint, centerPoint, arc.outerRadius)
    //                 const point2X =
    //                     chartCenterPoint.x + Math.cos(angle) * (centerPoint.x < chartCenterPoint.x ? arc.outerRadius + 10 : arc.outerRadius + 10);
    //                 let point2Y =
    //                     chartCenterPoint.y + Math.sin(angle) * (centerPoint.y < chartCenterPoint.y ? arc.outerRadius + 15 : arc.outerRadius + 15);

    //                 let suitableY;
    //                 if (point2X < chartCenterPoint.x) {
    //                     // on the left
    //                     suitableY = getSuitableY(point2Y, leftLabelCoordinates, "left");
    //                 } else {
    //                     // on the right

    //                     suitableY = getSuitableY(point2Y, rightLabelCoordinates, "right");
    //                 }

    //                 point2Y = suitableY;

    //                 let value = dataset.data[i];
    //                 // if (dataset.polyline && dataset.polyline.formatter) {
    //                 //   value = dataset.polyline.formatter(value);
    //                 // }
    //                 let edgePointX = point2X < chartCenterPoint.x ? chartCenterPoint.x - arc.outerRadius - 10 : chartCenterPoint.x + arc.outerRadius + 10;

    //                 if (point2X < chartCenterPoint.x) {
    //                     leftLabelCoordinates.push(point2Y);
    //                 } else {
    //                     rightLabelCoordinates.push(point2Y);
    //                 }

    //                 //DRAW CODE
    //                 // first line: connect between arc's center point and outside point
    //                 ctx.lineWidth = 2;
    //                 ctx.strokeStyle = color;
    //                 ctx.beginPath();
    //                 ctx.moveTo(originPoint.x, originPoint.y);
    //                 ctx.lineTo(point2X, point2Y);
    //                 ctx.stroke();
    //                 // second line: connect between outside point and chart's edge
    //                 ctx.beginPath();
    //                 ctx.moveTo(point2X, point2Y);
    //                 ctx.lineTo(edgePointX, point2Y);
    //                 ctx.stroke();
    //                 //fill custom label
    //                 const labelAlignStyle =
    //                     edgePointX < chartCenterPoint.x ? "right" : "left";
    //                 const labelX = edgePointX < chartCenterPoint.x ? edgePointX : edgePointX + 0;
    //                 const labelY = point2Y + 7;
    //                 ctx.textAlign = labelAlignStyle;
    //                 ctx.textBaseline = "bottom";
    //                 ctx.font = "bold 12px Lato";
    //                 // ctx.fillStyle = labelColor;
    //                 ctx.fillText(value, labelX, labelY);
    //             });
    //             ctx.restore();
    //         }
    //     }
    // ];

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
                        <Doughnut type="doughnut" data={data3} options={options3} plugins={plugins} height="450" width={450} />
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