import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class PackagListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,

            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],

        }
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit } = this.props;

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-30">

                    </Row>

                </form>
                <Row>
                    <Col>

                    </Col>
                </Row>
            </div >
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

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'PackagListing',
    enableReinitialize: true,
})(PackagListing));