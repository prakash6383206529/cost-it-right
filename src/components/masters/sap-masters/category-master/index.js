import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col } from "reactstrap";
import AddCategory from './AddCategory';
import AddCategoryType from './AddCategoryType'


class CategoryMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenModel: false
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

