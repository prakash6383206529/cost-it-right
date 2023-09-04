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
import { EMPTY_DATA } from "../../../../config/constants";

const DisplayCharts = ({ productId }) => {
    const dispatch = useDispatch()
    const [pieChartData, setPieChartData] = useState({});
    const [doughnutData, setDoughnutData] = useState({})
    const [noContent, setNoContent] = useState(true)

    useEffect(() => {
        dispatch(getProductRolloutCostRatio(productId, (res) => {
            if (res && res.status === 200) {
                setNoContent(false)
                let pieChartDataTemp = res.data.Data;

                let Labels = [];
                let Dataset = []
                Object.keys(pieChartDataTemp).forEach((key) => {
                    if (key === 'RMCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("RM")
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'BOPCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("BOP")
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'CCCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("CC")
                        Dataset.push(pieChartDataTemp[key])
                    } else if (key === 'OtherCost' && pieChartDataTemp[key] !== 0) {
                        Labels.push("Other Cost")
                        Dataset.push(pieChartDataTemp[key])
                    }
                });

                setPieChartData({
                    labels: Labels,
                    datasets: [
                        {
                            label: '',
                            data: Dataset,
                            backgroundColor: colorArray,
                            borderWidth: 0.5,
                            hoverOffset: 10
                        },
                    ],
                })

            }
            else {
                setNoContent(true)
            }
        }))
        dispatch(getSupplierContributionDetails(productId, (res) => {
            if (res && res.status === 200) {
                let temp = res.data.Data;
                let Labels = []
                let dataSet = [];
                temp && temp.forEach((item) => {
                    Labels.push(item.Vendor)
                    dataSet.push(item.PartCount)
                })
                setDoughnutData({
                    labels: Labels,
                    datasets: [
                        {
                            label: '',
                            data: dataSet,
                            backgroundColor: colorArray,
                            borderWidth: 2,
                        },
                    ],
                })
            }

        }))
    }, []);

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
                        <h6>Supplier Contribution</h6>
                        <Suppliercontributiongraph data={doughnutData} options={doughnutOptions} />
                    </div>
                </Col>
                <Col md="6">
                    <div className="seprate-box">
                        <h6>Cost Ratio</h6>
                        {noContent ? <NoContentFound customClassName="" title={EMPTY_DATA} /> :
                            <Costratiograph data={pieChartData} options={pieChartOption} />}
                    </div>
                </Col>
            </Row>
        </>

    );
}
DisplayCharts.defualtProps = {
    productId: '0000-0000-0000-0000-00000'
}
export default React.memo(DisplayCharts);