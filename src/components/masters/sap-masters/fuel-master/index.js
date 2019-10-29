import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button} from "reactstrap";
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
            activeTab: '1'
        }
    }

    componentDidMount() {
        this.props.getFuelDetailAPI(res => {});
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
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true })
    }

     /**
     * @method openFuelModel
     * @description  used to open fuel form 
     */
    openFuelModel = () => {
        this.setState({ isOpenModel: true})
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false, isOpenModel: false})
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen,isOpenModel } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>Fuel Master </h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.FUEL}`}</Button>
                    </Col>
                    <Col>
                        <Button onClick={this.openFuelModel}>{`${CONSTANT.ADD} ${CONSTANT.FUEL} ${CONSTANT.DETAILS}`}</Button>
                    </Col>
                </Row>
                <hr />
                <Col>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                Fuel Details
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Fuel Type Details
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <FuelDetail/>
                        </TabPane>
                        <TabPane tabId="2">
                            <FuelTypeDetail/> 
                        </TabPane>
                    </TabContent>
                </Col>
                {isOpen && (
                    <AddFuel
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isOpenModel && (
                    <AddFuelDetail
                        isOpen={isOpenModel}
                        onCancel={this.onCancel}
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
    const { fuelList } = fuel;
    console.log('fuelList: ', fuelList);
    return { fuelList }
}


export default connect(
    mapStateToProps, { getFuelAPI, getFuelDetailAPI }
)(FuelMaster);

