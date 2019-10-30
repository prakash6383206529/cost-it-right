import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import AddCategory from './AddCategory';
import AddCategoryType from './AddCategoryType';
import { CONSTANT } from '../../../../helper/AllConastant';
import CategoryDetail from './CategoryDetail';
import CategoryTypeDetail from './CategoryTypeDetail';
import classnames from 'classnames';


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
    openCategoryModel = () => {
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
                        <h3>Category Master </h3>
                    </Col>
                    <Col>
                        <button onClick={this.openModel}>Add Category</button>
                    </Col>
                    <Col>
                        <button onClick={this.openCategoryModel}>Add Category Type</button>
                    </Col>
                </Row>
                <hr />
                <div>
                <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Category Details
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Category Type Details
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <CategoryDetail/>
                            </TabPane>
                            <TabPane tabId="2">
                               <CategoryTypeDetail/> 
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
}


export default connect(
    null, null
)(CategoryMaster);

