import React, { Component } from 'react';
import C3 from 'react-c3js';
import ReactDOM from "react-dom";
import { connect } from 'react-redux';

class DonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            total: 0,
            color: {
                'Applied': '#87939F',
                'Posted': '#FFC30D',
                'Going to Expire': '#2C3138',
            },
        };
    }

    /**
 * @method renderChart
 * @description used to render chart
 */
    renderChart = () => {
        let data = [
            ["Applied", this.props.chartData.appliedRoleCount],
            ["Posted", this.props.chartData.postedOpportunityCount],
            ["Going to Expire", this.props.chartData.expirableOpportunityCount],
        ];
        const { chartData } = this.props;
        const { appliedRoleCount, expirableOpportunityCount, postedOpportunityCount } = chartData;
        let total = appliedRoleCount + expirableOpportunityCount + postedOpportunityCount;
        const chartObj = {
            type: 'donut',
            columns: data,
            colors: this.state.color,
        }
        const legend = {
            show: true,
            position: 'bottom'
        }
        const size = {
            height: 250,
        }
        const donut = {
            label: {
                format: function (value) {
                    return value
                },
                threshold: 0.01
            }
        }

        let node = ReactDOM.findDOMNode(this);
        if (node) {
            let elem = node.querySelector(".c3-chart-arcs-title");
            if (elem) {
                elem.innerHTML = total
            }
            const display = (this.props.chartData.appliedRoleCount === 0 && this.props.chartData.postedOpportunityCount === 0 && this.props.chartData.expirableOpportunityCount === 0) ? true : false
            return (
                <div className="medium-5 small-12 columns">
                    <div style={{ display: display ? 'block' : 'none' }} className="empty-donut">
                        <p className="text-center1">0</p>
                        <div className="custom-indexing">
                    <span className="applied" >Applied</span>
                    <span className="posted" >Posted</span>
                    <span className=" expire" >Going to Expire</span>
                    </div>
                    </div>
                    <div style={{ display: display ? 'none' : 'block' }}>
                        <C3 data={chartObj} donut={donut} size={size} legend={legend} className="char_resp" />
                        <p className="text-center"></p>
                    </div>
                </div>
            )
        }
    }

    /**
     * @method render
     * @description Renders the component
     */
    render() {
        return (
            <div className="py-3 dounet-chart-render">
                {this.renderChart()}
                <h4>Total</h4>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ dashboard }) {
    const { chartData, loading } = dashboard;
    return {
        loading,
        chartData
    };
}

export default connect(mapStateToProps, {})(DonutChart);


