import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import AddCategory from './AddCategory';
import AddCategoryType from './AddCategoryType';
import { CONSTANT } from '../../../../helper/AllConastant';
import CategoryDetail from './CategoryDetail';
import CategoryTypeDetail from './CategoryTypeDetail';
import classnames from 'classnames';
import { getCategoryDataAPI } from '../../../../actions/master/Category';

class CategoryMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenModel: false,
            activeTab: '1',
            ID: '',
            isEditFlag: false,
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
        this.setState({ isOpen: true })
    }

    /**
     * @method editCategory
     * @description  Category type detail edit section
     */
    editCategory = (CategoryId) => {
        console.log('CategoryId', CategoryId)
        this.setState({
            isOpen: true,
            ID: CategoryId,
            isEditFlag: true,
        })
    }

    /**
     * @method openCategoryModel
     * @description  used to open category type form 
     */
    openCategoryModel = () => {
        this.setState({ isOpenModel: true })
    }

    /**
     * @method editCategoryType
     * @description  Category type detail edit section
     */
    editCategoryType = (CategoryTypeId) => {
        this.setState({
            isOpenModel: true,
            ID: CategoryTypeId,
            isEditFlag: true,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = (tab) => {
        this.setState({
            isOpen: false,
            isOpenModel: false,
            isEditFlag: false,
        }, () => {
            this.props.getCategoryDataAPI(res => { });
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isOpenModel } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.CATEGORY} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <button onClick={this.openCategoryModel}>{`ADD BOP Category Type`}</button>
                    </Col>
                    <Col>
                        <button onClick={this.openModel}>{`ADD BOP Category`}</button>
                    </Col>
                </Row>
                <hr />
                <div>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                {`BOP Category Type`}
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                {`BOP Category`}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <CategoryTypeDetail editCategoryType={this.editCategoryType} />
                        </TabPane>
                        <TabPane tabId="2">
                            <CategoryDetail editCategory={this.editCategory} />
                        </TabPane>
                    </TabContent>
                </div>
                {isOpen && (
                    <AddCategory
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        CategoryId={this.state.ID}
                        isEditFlag={this.state.isEditFlag}
                    />
                )}
                {isOpenModel && (
                    <AddCategoryType
                        isOpen={isOpenModel}
                        onCancel={this.onCancel}
                        CategoryTypeId={this.state.ID}
                        isEditFlag={this.state.isEditFlag}
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
    return {}
}


export default connect(mapStateToProps, { getCategoryDataAPI }
)(CategoryMaster);

