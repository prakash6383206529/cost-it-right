import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import { Field } from "redux-form";
import { renderMultiSelectField } from "../../layout/FormInputs";
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import {
    agGridStatus,
} from '../../../actions/Common';
import { fetchCostingHeadsAPI, } from '../../../actions/Common';

class valuesFloatingFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            maxValue: props.maxValue,
            currentValue: 0,
            dropdownData: []
        }
    }

    componentDidMount() {

        this.props.fetchCostingHeadsAPI('--Costing Heads--', res => {
            if (res) {
                let temp = []
                res?.data?.SelectList && res?.data?.SelectList.map((item) => {
                    if (item.Value === '0' || item.Text === 'Net Cost') return false;
                    temp.push(item)
                    return null;
                })
                this.setState({ dropdownData: temp })
            }

        });


    }

    valueChanged = (event) => {

        setTimeout(() => {

        }, 500);
        this.props.agGridStatus(event?.target?.value, this?.props?.maxValue)

        this.setState({
            currentValue: event.target.value
        },
            () => {
                this.props.onFloatingFilterChanged({ model: this.buildModel() });
            })

    };

    onParentModelChanged(parentModel) {
        // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
        // so just read off the value and use that
        this.setState({
            currentValue: !parentModel ? 0 : parentModel.filter
        });
    }

    buildModel() {
        if (this.state.currentValue === 0) {
            return null;
        }
        return {
            filterType: 'number',
            type: 'greaterThan',
            filter: this.state.currentValue,
            filterTo: null
        };
    }

    render() {
        return (
            <div className="custom-select-grid">
                <span className="chevron"></span>
                <select name="status" id="status" onChange={this.valueChanged} >
                    <option value="0">Select</option>
                    {this.state.dropdownData && this.state.dropdownData.map((item) => {
                        return (
                            <option value={item.Text}> {item.Text}</option>
                        )
                    })
                    }
                </select>
            </div>
        )
    }
}


function mapStateToProps({ bop }) {
    return {}
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    agGridStatus,
    fetchCostingHeadsAPI
})(reduxForm({
    form: 'valuesFloatingFilter',
    enableReinitialize: true,
    touchOnChange: true
})(valuesFloatingFilter));