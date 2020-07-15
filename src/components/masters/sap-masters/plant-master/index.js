import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import AddPlant from './AddZBCPlant';
import { getPlantDataAPI, deletePlantAPI } from '../../../../actions/master/Plant';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'
import { convertISOToUtcDate, renderAction } from '../../../../helper/util'
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import NoContentFound from '../../../common/NoContentFound';
import { getMenuByUser } from '../../../../actions/auth/AuthActions';
import { loggedInUserId } from '../../../../helper/auth';
import classnames from 'classnames';
import AddZBCPlant from './AddZBCPlant';
import AddVBCPlant from './AddVBCPlant';

class PlantMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1'
        }
    }

    componentDidMount() {
        const loginUserId = loggedInUserId();
        if (loginUserId != null) {
            this.props.getMenuByUser(loginUserId, () => { })
        }
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
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, PlantId, isEditFlag } = this.state;
        return (
            <>
                <Container className="user-page p-0">
                    {/* {this.props.loading && <Loader/>} */}
                    
                    <Col>
                        <h1>Plant Master</h1>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    ZBC
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    VBC
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            {this.state.activeTab === '1' &&
                                <TabPane tabId="1">
                                    <AddZBCPlant
                                        toggle={this.toggle} />
                                </TabPane>}
                            {this.state.activeTab === '2' &&
                                <TabPane tabId="2">
                                    <AddVBCPlant
                                        toggle={this.toggle} />
                                </TabPane>}
                        </TabContent>
                    </Col>
                   
                </Container >
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ plant, auth }) {
    const { menusData } = auth
    const { plantDetail, loading } = plant;
    return { plantDetail, loading, menusData }
}


export default connect(
    mapStateToProps, { getPlantDataAPI, deletePlantAPI, getMenuByUser }
)(PlantMaster);

