import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import { CONSTANT } from '../../helper/AllConastant';
import classnames from 'classnames';
import { getCostingBySupplier } from '../../actions/costing/CostWorking';
import { fetchPlantDataAPI } from '../../actions/master/Comman';
import { uploadBOMxlsAPI } from '../../actions/master/BillOfMaterial';

class Costing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: '1',
        }
    }

    /**
    * @method componentDidMount
    * @description  called before mounting the component
    */
    componentDidMount() {
        this.props.fetchPlantDataAPI(() => { })
    }

    /**
    * @method toggle
    * @description toggling the tabs
    */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    /**
    * @method toggleUpload
    * @description toggling the file upload tabs
    */
    toggleUpload = () => {
        this.setState({
            isShowFileUpload: !this.state.isShowFileUpload
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <>
                <Row>
                    <Col>
                        <h3 className={'mt20'}>{`${CONSTANT.COSTING} Summary`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Cost Summary
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Cost Working
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                COST SUMMARY
                            </TabPane>
                            <TabPane tabId="2">
                                COST WORKING
                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman }) {
    const { plantList } = comman;
    return { plantList }
}


export default connect(
    mapStateToProps, {
    getCostingBySupplier,
    fetchPlantDataAPI,
    uploadBOMxlsAPI,
}
)(reduxForm({
    form: 'CostingForm',
    enableReinitialize: true,
})(Costing));

