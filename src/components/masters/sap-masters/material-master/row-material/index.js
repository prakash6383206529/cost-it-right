import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import AddRowMaterial from './AddRowMaterial';
import AddRMCategory from './AddCategory';
import AddRMGrade from './AddGrade';
import AddSpecification from './AddSpecification';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant'
import RMDetail from './RMDetail';
import RMGradeDetail from './RMGradeDetail';
import RMCategoryDetail from './RMCategoryDetail';
import RMSpecificationDetail from './RMSpecificationDetail';
import classnames from 'classnames';
import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';

class RowMaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            isCategory: false,
            isGrade: false,
            isSpecification: false,
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
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    openCategorymodel = () => {
        this.setState({ isCategory: true })
    }
    openGrademodel = () => {
        this.setState({ isGrade: true })
    }
    openSpecificationmodel = () => {
        this.setState({ isSpecification: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false, isCategory: false, isGrade: false, isSpecification: false }, () => {
            this.props.getRowMaterialDataAPI(res => { });
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCategory, isGrade, isSpecification } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col sm="2">
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.MATERIAL} `}</Button>
                    </Col>
                    <Col sm="2">
                        <Button onClick={this.openCategorymodel}>{`${CONSTANT.ADD} ${CONSTANT.CATEGORY} `}</Button>
                    </Col>
                    <Col sm="2">
                        <Button onClick={this.openGrademodel}>{`${CONSTANT.ADD} ${CONSTANT.GRADE} `}</Button>
                    </Col>
                    <Col sm="2">
                        <Button onClick={this.openSpecificationmodel}>{`${CONSTANT.ADD} ${CONSTANT.SPECIFICATION} `}</Button>
                    </Col>
                </Row>
                {/* <hr /> */}
                {/* <Row>
                    <Col>
                        <h5>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row> */}
                <Col>
                    <div>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Raw Material Details
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Grade Detail
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                    Category Detail
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                    Specification Detail
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <RMDetail />
                            </TabPane>
                            <TabPane tabId="2">
                                <RMGradeDetail />
                            </TabPane>
                            <TabPane tabId="3">
                                <RMCategoryDetail />
                            </TabPane>
                            <TabPane tabId="4">
                                <   RMSpecificationDetail />
                            </TabPane>
                        </TabContent>
                    </div>
                </Col>
                {isOpen && (
                    <AddRowMaterial
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isCategory &&
                    <AddRMCategory
                        isOpen={isCategory}
                        onCancel={this.onCancel}
                    />
                }
                {isGrade &&
                    <AddRMGrade
                        isOpen={isGrade}
                        onCancel={this.onCancel}
                    />
                }
                {isSpecification &&
                    <AddSpecification
                        isOpen={isSpecification}
                        onCancel={this.onCancel}
                    />
                }
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

