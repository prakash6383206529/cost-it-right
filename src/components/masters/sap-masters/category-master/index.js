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
        this.setState({ isOpen: true })
    }

    /**
     * @method openCategoryModel
     * @description  used to open category type form 
     */
    openCategoryModel = () => {
        this.setState({ isOpenModel: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = (tab) => {
        this.setState({
            isOpen: false,
            isOpenModel: false,
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
                        <button onClick={this.openCategoryModel}>{`${CONSTANT.ADD} ${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}</button>
                    </Col>
                    <Col>
                        <button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.CATEGORY}`}</button>
                    </Col>
                </Row>
                <hr />
                <div>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                {`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                {`${CONSTANT.CATEGORY}`}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <CategoryTypeDetail />
                        </TabPane>
                        <TabPane tabId="2">
                            <CategoryDetail />
                        </TabPane>
                    </TabContent>
                </div>
                {isOpen && (
                    <AddCategory
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isOpenModel && (
                    <AddCategoryType
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
function mapStateToProps({ }) {
    return {}
}


export default connect(mapStateToProps, { getCategoryDataAPI }
)(CategoryMaster);

