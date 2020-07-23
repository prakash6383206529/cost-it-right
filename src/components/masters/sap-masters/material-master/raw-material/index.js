import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddRMDomestic from './AddRMDomestic';
import RMListing from './RMListing';
import SpecificationListing from './SpecificationListing';

import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import AddRMImport from './AddRMImport';

class RowMaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRMOpen: false,
            isOpen: false,
            isEditFlag: false,
            Id: '',
            activeTab: '1'
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
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = (tab) => {
        this.setState({
            activeTab: tab,
            isOpen: false,
            isRMOpen: false,
            isEditFlag: false,
        }, () => {
            this.props.getRowMaterialDataAPI(res => { });
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpenMaterialType, isRMOpen, isOpen, isCategory, isGrade, isSpecification } = this.state;
        return (
            <Container>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Raw Material (Domestic)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Raw Material (Import)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Manage Specification
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                        Manage RM Material
                                </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <AddRMDomestic
                                            isOpen={isRMOpen}
                                            onCancel={this.onCancel}
                                            RawMaterialDetailsId={this.state.Id}
                                            isEditFlag={this.state.isEditFlag}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        <AddRMImport
                                            isOpen={isRMOpen}
                                            onCancel={this.onCancel}
                                            RawMaterialDetailsId={this.state.Id}
                                            isEditFlag={this.state.isEditFlag}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 3 &&
                                    <TabPane tabId="3">
                                        <SpecificationListing
                                            toggle={this.toggle} />
                                    </TabPane>}

                                {this.state.activeTab == 4 &&
                                    <TabPane tabId="4">
                                        <RMListing
                                            toggle={this.toggle} />
                                    </TabPane>}

                            </TabContent>
                        </div>
                    </Col>
                </Row>

            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {
    // const { partsListing ,loading } = part;
    // console.log('partsListing: ', partsListing);
    // return { partsListing, loading }
}


export default connect(
    mapStateToProps, { getRowMaterialDataAPI }
)(RowMaterialMaster);

