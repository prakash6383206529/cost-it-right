import React from "react";
import { Col, Row } from "reactstrap";
import { Suppliercontributiongraph } from "../../../dashboard/SupplierContributionGraph";
import { Costratiograph } from "../../../dashboard/CostRatioGraph";
import { colorArray } from "../../../dashboard/ChartsDashboard";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProductRolloutCostRatio, getSupplierContributionDetails } from "../../actions/ReportListing";
import NoContentFound from "../../../common/NoContentFound";
import { EMPTY_DATA, EMPTY_GUID } from "../../../../config/constants";
import LoaderCustom from "../../../common/LoaderCustom";
import { showBopLabel } from "../../../../helper";
import { useLabels } from "../../../../helper/core";


const DisplayCharts = ({ productId }) => {
    const dispatch = useDispatch()
    const { vendorLabel } = useLabels()
    const [pieChartObj, setPieChartObj] = useState({});
    const [doughnutObj, setDoughnutObj] = useState({})
    const [chartStates, setChartStates] = useState({
        noContent: {
            pieChart: false,
            doughnut: false
        },
        isLoader: {
            pieChart: false,
            doughnut: false
        }
    });

    useEffect(() => {
        setChartStates(prevChartStates => ({
            ...prevChartStates,
            noContent: {
                ...prevChartStates.noContent,
                pieChart: true
            },
            isLoader: {
                ...prevChartStates.isLoader,
                pieChart: false
            }
        }));
        dispatch(getProductRolloutCostRatio(productId, (res) => {
            if (res && res.status === 200) {
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    noContent: {
                        ...prevChartStates.noContent,
                        pieChart: false
                    },
                    isLoader: {
                        ...prevChartStates.isLoader,
                        pieChart: false
                    }
                }));
                let pieChartDataTemp = res.data.Data;
                let Labels = [];
                let Dataset = []
                Object.keys(pieChartDataTemp).forEach((key) => {
                    if (key === 'RMCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("RM")
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'BOPCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push(`${showBopLabel()}`)
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'CCCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("CC")
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'OtherCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("Other Cost")
                        Dataset.push(pieChartDataTemp[key])
                    }
                });

                setPieChartObj({
                    labels: Labels,
                    datasets: Dataset
                })
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    isLoader: {
                        ...prevChartStates.isLoader,
                        pieChart: false
                    }
                }));

            }
            else {
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    noContent: {
                        ...prevChartStates.noContent,
                        pieChart: true
                    },
                    isLoader: {
                        ...prevChartStates.isLoader,
                        pieChart: false
                    }
                }));
            }
        }))
        dispatch(getSupplierContributionDetails(productId, (res) => {
            if (res && res.status === 200) {
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    noContent: {
                        ...prevChartStates.noContent,
                        doughnut: false
                    },
                    isLoader: {
                        ...prevChartStates.isLoader,
                        doughnut: false
                    }
                }));
                let temp = res.data.Data;
                let Labels = []
                let dataSet = [];
                temp && temp.forEach((item) => {
                    Labels.push(item.Vendor)
                    dataSet.push(item.PartCount)
                })
                setDoughnutObj({
                    labels: Labels,
                    datasets: dataSet
                })
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    isLoader: {
                        ...prevChartStates.isLoader,
                        doughnut: false
                    }
                }));

            } else {
                setChartStates(prevChartStates => ({
                    ...prevChartStates,
                    noContent: {
                        ...prevChartStates.noContent,
                        doughnut: true
                    },
                    isLoader: {
                        ...prevChartStates.isLoader,
                        doughnut: false
                    }
                }));
            }

        }))
    }, [productId]);
    const pieChartData = {
        labels: pieChartObj.labels,
        datasets: [
            {
                data: pieChartObj.datasets,
                backgroundColor: colorArray,
                borderWidth: 0.5,
                hoverOffset: 10
            }
        ]
    }
    const doughnutData = {
        labels: doughnutObj.labels,
        datasets: [
            {
                data: doughnutObj.datasets,
                backgroundColor: colorArray,
                borderWidth: 2,
            }
        ]
    }
    const pieChartOption = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
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
    const doughnutOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 15,
                    borderWidth: 1,
                    borderColor: colorArray,
                }
            },
        },
    }
    return (
        <>
            <Row className="product-rollout-graph">
                <Col md="6">
                    <div className="seprate-box">
                        <h6>{vendorLabel} Contribution</h6>
                        {chartStates.isLoader.doughnut && <LoaderCustom />}
                        {chartStates.noContent.doughnut ? <NoContentFound title={EMPTY_DATA} /> : <Suppliercontributiongraph data={doughnutData} options={doughnutOptions} />}
                    </div>
                </Col>
                <Col md="6">
                    <div className="seprate-box">
                        <h6>Cost Ratio</h6>
                        {chartStates.isLoader.pieChart && <LoaderCustom />}
                        {chartStates.noContent.pieChart ? <NoContentFound title={EMPTY_DATA} /> :
                            <Costratiograph data={pieChartData} options={pieChartOption} />
                        }
                    </div>
                </Col>
            </Row>
        </>

    );
}
DisplayCharts.defualtProps = {
    productId: EMPTY_GUID
}
export default React.memo(DisplayCharts);