import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import Addfreight from './AddFreight';
import FreightDetail from './FreightDetail';
import { getFreightDetailAPI, getAllAdditionalFreightAPI } from '../../../../actions/master/Freight';
import PackagingDetail from './PackagingDetail';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import classnames from 'classnames';

class FreightMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: 1,
            freightId: ''

        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getFreightDetailAPI(res => { });
        this.props.getAllAdditionalFreightAPI(res => { });
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
        this.props.getFreightDetailAPI(res => { });
        this.props.getAllAdditionalFreightAPI(res => { });
    }

    /**
    * @method editFuelDetails
    * @description  used to edit fuel details
    */
    editFreighteDetails = (editFlag, isModelOpen, FreightId) => {
        this.setState({
            isEditFlag: editFlag,
            isOpenModel: isModelOpen,
            FreightId: FreightId,
        })
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
   * @method onCancel
   * @description  used to cancel filter form
   */
    onCancel = (tabId = 1) => {
        this.setState({
            isOpen: false,
        }, () => {
            this.toggle(tabId)
        })
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, freightId } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.FREIGHT} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.FREIGHT} `}</Button>
                    </Col>
                </Row>
                <hr />
                <div>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab == 1 })} onClick={() => { this.toggle(1); }}>
                                {`Freight`}
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab == 2 })} onClick={() => { this.toggle(2); }}>
                                {`Packaging`}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId={1}>
                            <FreightDetail
                                editFreightDetails={this.editFreighteDetails}
                                toggle={this.toggle}
                            />
                        </TabPane>
                        <TabPane tabId={2}>
                            <PackagingDetail
                                editPackagingDetails={this.editPackagingDetails}
                                toggle={this.toggle}
                            />
                        </TabPane>
                    </TabContent>
                </div>
                {isOpen && (
                    <Addfreight
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        freightId={freightId}
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
function mapStateToProps() {
    return {}
}


export default connect(
    mapStateToProps, {
    getFreightDetailAPI,
    getAllAdditionalFreightAPI
}
)(FreightMaster);

