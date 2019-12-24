import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import AddMaterialType from './AddMaterialType';
import AddRMDetail from './AddRMDetail';
import MaterialDetail from './MaterialDetail';
import MaterialTypeDetail from './MaterialTypeDetail';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import classnames from 'classnames';


class MaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isRMOpen: false,
            activeTab: '1'
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
    * @method openRMModel
    * @description  used to open filter form 
    */
    openRMModel = () => {
        this.setState({ isRMOpen: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false, isRMOpen: false })
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
        const { isOpen, isRMOpen } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.MATERIAL_MASTER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h3>
                    </Col>
                    <Col md="2">
                        {/* Removed 'Raw' from title on 23/12/2019 MOM */}
                        <Button onClick={this.openModel}>{`Add Material Type`}</Button>
                    </Col>
                    <Col md="3">
                        {/* Removed 'Raw' from title on 23/12/2019 MOM */}
                        <Button onClick={this.openRMModel}>{`Add Material Details`}</Button>
                    </Col>
                </Row>
                {/* <hr /> */}
                {/* <Row>
                    <Col>
                        <h5>{`${CONSTANT.MATERIAL_MASTER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row> */}
                <div>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Material Type
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                Raw Material Details
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <MaterialDetail />
                        </TabPane>
                        <TabPane tabId="2">
                            <MaterialTypeDetail />
                        </TabPane>
                    </TabContent>
                </div>
                {isOpen && (
                    <AddMaterialType
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isRMOpen && (
                    <AddRMDetail
                        isOpen={isRMOpen}
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
function mapStateToProps({ }) {
}


export default connect(
    mapStateToProps, {}
)(MaterialMaster);

