import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import AddFuelDetail from './AddFuelDetail';
import AddFuel from './AddFuel';
import FuelDetail from './FuelDetail';
import FuelTypeDetail from './FuelTypeDetail';
import { getFuelAPI, getFuelDetailAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import classnames from 'classnames';

class FuelMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenModel: false,
            activeTab: '1',
            isEditFlag: false,
            fuelId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getFuelDetailAPI(res => { });
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
        this.props.getFuelDetailAPI(res => { });
        this.props.getFuelAPI(res => { });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false,
        })
    }

    /**
    * @method openFuelModel
    * @description  used to open fuel form 
    */
    openFuelModel = () => {
        this.setState({ isOpenModel: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({
            isOpen: false,
            isOpenModel: false
        }, () => {
            this.props.getFuelDetailAPI(res => { });
        })
    }

    /**
    * @method editFuelDetails
    * @description  used to edit fuel details
    */
    editFuelDetails = (editFlag, isModelOpen, FuelId) => {
        this.setState({
            isEditFlag: editFlag,
            isOpenModel: isModelOpen,
            fuelId: FuelId,
        })
    }

    /**
    * @method editFuelTypeDetails
    * @description  used to edit fuel type details
    */
    editFuelTypeDetails = (editFlag, isModelOpen, FuelId) => {
        this.setState({
            isEditFlag: editFlag,
            isOpen: isModelOpen,
            fuelId: FuelId,
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isOpenModel, fuelId, isEditFlag } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col md="3">
                        <h3>Fuel Master </h3>
                    </Col>
                    <Col md="3">
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.FUEL}`}</Button>
                    </Col>
                    <Col md="3">
                        <Button onClick={this.openFuelModel}>{`${CONSTANT.ADD} ${CONSTANT.FUEL} ${CONSTANT.DETAILS}`}</Button>
                    </Col>
                </Row>
                {/* <hr /> */}
                <Row>
                    <Col>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Fuel Type
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Fuel Details
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <FuelTypeDetail
                                    editFuelTypeDetails={this.editFuelTypeDetails}
                                    toggle={this.toggle} />
                            </TabPane>
                            <TabPane tabId="2">
                                <FuelDetail
                                    editFuelDetails={this.editFuelDetails}
                                    toggle={this.toggle} />
                            </TabPane>

                        </TabContent>
                    </Col>
                </Row>
                {isOpen && (
                    <AddFuel
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        fuelId={fuelId}
                        isEditFlag={isEditFlag}
                    />
                )}
                {isOpenModel && (
                    <AddFuelDetail
                        isOpen={isOpenModel}
                        onCancel={this.onCancel}
                        fuelId={fuelId}
                        isEditFlag={isEditFlag}
                    />
                )}

            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ fuel }) {
    const { fuelDataList } = fuel;
    return { fuelDataList }
}


export default connect(
    mapStateToProps, { getFuelAPI, getFuelDetailAPI }
)(FuelMaster);

