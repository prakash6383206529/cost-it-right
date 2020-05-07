import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddMaterialType from './AddMaterialType';
import AddRMDetail from './AddRMDetail';
import AddRowMaterial from './AddRowMaterial';
import AddRMCategory from './AddCategory';
import AddRMGrade from './AddGrade';
import AddSpecification from './AddSpecification';

import MaterialTypeDetail from './MaterialTypeDetail';
import RMDetail from './RMDetail';
import RMGradeDetail from './RMGradeDetail';
import RMCategoryDetail from './RMCategoryDetail';
import RMSpecificationDetail from './RMSpecificationDetail';
import MaterialDetail from './MaterialDetail';

import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';

class RowMaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenMaterialType: false,
            isRMOpen: false,
            isOpen: false,
            isEditFlag: false,
            isCategory: false,
            isGrade: false,
            isSpecification: false,
            Id: '',
            activeTab: '6'
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
     * @method openMaterialTypeModel
     * @description  used to open Material type form 
     */
    openMaterialTypeModel = () => {
        this.setState({ isOpenMaterialType: true })
    }

    /**
     * @method editMaterialTypeHandler
     * @description  used to open Material type form 
     */
    editMaterialTypeHandler = (Id) => {
        this.setState({
            isOpenMaterialType: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    /**
     * @method editRawMaterialHandler
     * @description  used to open Raw Material form 
     */
    editRawMaterialHandler = (Id) => {
        this.setState({
            isOpen: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    openCategorymodel = () => {
        this.setState({ isCategory: true })
    }

    /**
     * @method editCategoryHandler
     * @description  used to open category form 
     */
    editCategoryHandler = (Id) => {
        this.setState({
            isCategory: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    openGrademodel = () => {
        this.setState({ isGrade: true })
    }

    /**
     * @method editMaterialTypeHandler
     * @description  used to open RM Grade form 
     */
    editRMGradeHandler = (Id) => {
        this.setState({
            isGrade: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    openSpecificationmodel = () => {
        this.setState({ isSpecification: true })
    }

    /**
     * @method editRMSpecificationHandler
     * @description  used to open RM Specification form 
     */
    editRMSpecificationHandler = (Id) => {
        this.setState({
            isSpecification: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    /**
    * @method openRMModel
    * @description  used to open filter form 
    */
    openRMModel = () => {
        this.setState({ isRMOpen: true })
    }

    /**
     * @method editRawMaterialDetailsHandler
     * @description  used to open RM Detail form 
     */
    editRawMaterialDetailsHandler = (Id) => {
        this.setState({
            isRMOpen: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = (tab) => {
        this.setState({
            activeTab: tab,
            isOpen: false,
            isCategory: false,
            isGrade: false,
            isSpecification: false,
            isOpenMaterialType: false,
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
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                </Row>
                <Row>
                    <Col className={'mt15 mb15'} md="12">
                        {/* Removed 'Raw' from title on 23/12/2019 MOM */}
                        {/* <Button className={'mr15'} onClick={this.openMaterialTypeModel}>{`Add Material Type`}</Button> */}

                        {/* <Button className={'mr15'} onClick={this.openGrademodel}>{`Add Grade`}</Button> */}

                        {/* <Button className={'mr15'} onClick={this.openCategorymodel}>{`Add Category`}</Button> */}

                        {/* <Button className={'mr15'} onClick={this.openSpecificationmodel}>{`Add Specification`}</Button> */}

                        {/* <Button className={'mr15'} onClick={this.openModel}>{`Add Raw Material`}</Button> */}

                        {/* Removed 'Raw' from title on 23/12/2019 MOM */}
                        {/* <Button className={'mr15'} onClick={this.openRMModel}>{`Add Raw Material Details`}</Button> */}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '6' })} onClick={() => { this.toggle('6'); }}>
                                        Manage Raw Material (Domestic)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '7' })} onClick={() => { this.toggle('7'); }}>
                                        Manage Raw Material (Import)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '5' })} onClick={() => { this.toggle('5'); }}>
                                        Manage Specification
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage RM Material
                                </NavLink>
                                </NavItem>
                                {/* <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Material Type
                                </NavLink>
                                </NavItem> */}
                                {/* <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Grade Detail
                                </NavLink>
                                </NavItem> */}
                                {/* <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                        Category Detail
                                </NavLink>
                                </NavItem> */}

                            </Nav>
                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 6 && <TabPane tabId="6">
                                    {/* {isRMOpen && ( */}
                                    <AddRMDetail
                                        isOpen={isRMOpen}
                                        onCancel={this.onCancel}
                                        RawMaterialDetailsId={this.state.Id}
                                        isEditFlag={this.state.isEditFlag}
                                    />
                                    {/* )} */}
                                    {/* <MaterialDetail editRawMaterialDetailsHandler={this.editRawMaterialDetailsHandler} /> */}
                                </TabPane>}

                                {this.state.activeTab == 7 && <TabPane tabId="7">
                                    <AddRMDetail
                                        isOpen={isRMOpen}
                                        onCancel={this.onCancel}
                                        RawMaterialDetailsId={this.state.Id}
                                        isEditFlag={this.state.isEditFlag}
                                    />
                                </TabPane>}

                                {this.state.activeTab == 4 && <TabPane tabId="4">
                                    <RMCategoryDetail editCategoryHandler={this.editCategoryHandler} />
                                </TabPane>}

                                {this.state.activeTab == 2 && <TabPane tabId="2">
                                    <AddMaterialType
                                        isOpen={isOpenMaterialType}
                                        MaterialTypeId={this.state.Id}
                                        isEditFlag={this.state.isEditFlag}
                                        onCancel={this.onCancel}
                                    />
                                    {/* <RMDetail editRawMaterialHandler={this.editRawMaterialHandler} /> */}
                                </TabPane>}

                                {this.state.activeTab == 1 && <TabPane tabId="1">
                                    <MaterialTypeDetail editMaterialTypeHandler={this.editMaterialTypeHandler} />
                                </TabPane>}

                                {this.state.activeTab == 3 && <TabPane tabId="3">
                                    <RMGradeDetail editRMGradeHandler={this.editRMGradeHandler} />
                                </TabPane>}

                                {this.state.activeTab == 5 && <TabPane tabId="5">
                                    <AddSpecification
                                        isOpen={isSpecification}
                                        onCancel={this.onCancel}
                                        SpecificationId={this.state.Id}
                                        isEditFlag={this.state.isEditFlag}
                                    />
                                    {/* <RMSpecificationDetail editRMSpecificationHandler={this.editRMSpecificationHandler} /> */}
                                </TabPane>}

                            </TabContent>
                        </div>
                    </Col>
                </Row>
                {/* {isOpenMaterialType && (
                    <AddMaterialType
                        isOpen={isOpenMaterialType}
                        MaterialTypeId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                        onCancel={this.onCancel}
                    />
                )} */}
                {isOpen && (
                    <AddRowMaterial
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        RawMaterialId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                    />
                )}
                {isCategory &&
                    <AddRMCategory
                        isOpen={isCategory}
                        CategoryId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                        onCancel={this.onCancel}
                    />
                }
                {isGrade &&
                    <AddRMGrade
                        isOpen={isGrade}
                        onCancel={this.onCancel}
                        GradeId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                    />
                }
                {/* {isSpecification &&
                    <AddSpecification
                        isOpen={isSpecification}
                        onCancel={this.onCancel}
                        SpecificationId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                    />
                } */}
                {/* {isRMOpen && (
                    <AddRMDetail
                        isOpen={isRMOpen}
                        onCancel={this.onCancel}
                        RawMaterialDetailsId={this.state.Id}
                        isEditFlag={this.state.isEditFlag}
                    />
                )} */}
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

