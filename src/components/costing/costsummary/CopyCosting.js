import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import { copyCostingAPI } from '../../../actions/costing/costing';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { required, maxLength100 } from "../../../helper/validation";
import { renderTextAreaField } from "../../layout/FormInputs";
import { userDetails, loggedInUserId } from "../../../helper/auth";
import { PENDING, DRAFT, WAITING_FOR_APPROVAL, FINAL_APPROVAL } from '../../../config/constants';

class CopyCosting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            remarks: '',
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { costingId, supplierId } = this.props;
    }

    /**
    * @method reasonHandler
    * @description Used to handle reason
    */
    reasonHandler = (newValue, actionMeta) => {
        this.setState({ reason: newValue });
    };

    /**
    * @method cancel
    * @description used to cancel form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.onCancelApproval();
    }

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    onSubmit = (values) => {

        const { remarks } = this.state;
        const { costingId, supplierId, PlantId, PartId } = this.props;

        let formData = {};

        formData = {
            CostingId: costingId,
            Comments: remarks,
            SupplierId: supplierId,
            PlantId: PlantId.value,
            PartId: PartId,
            loggedInUserId: loggedInUserId()
        }
        this.props.copyCostingAPI(formData, (res) => {
            toastr.success(MESSAGES.COPY_COSTING_SUCCESS)
            this.props.onCancelApproval();
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, costingStatusText } = this.props;

        return (
            <>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit)}
                >
                    <Row>
                        <Col>
                            <h2>{'Copy Costing'}</h2>
                        </Col>
                    </Row>
                    <Row className="mt20">
                        <Col>
                            <Field
                                label={'Remarks'}
                                name={`Remarks`}
                                placeholder="Type your message here..."
                                value={this.state.remarks}
                                className="withoutBorder"
                                onChange={this.handleMessageChange}
                                validate={[required, maxLength100]}
                                required={true}
                                component={renderTextAreaField}
                                maxLength="5000"
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-center">
                            <button type="submit" className="btn mr20 btn-primary" >
                                {'Submit'}
                            </button>

                            <button type={'button'} className="btn btn-secondary" onClick={this.cancel} >
                                {'Cancel'}
                            </button>
                        </div>
                    </Row>
                </form>
            </>

        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ costing }) {

    let initialValues = {};

    return { initialValues }
}

export default connect(mapStateToProps, {
    copyCostingAPI,
})(reduxForm({
    form: 'CopyCosting',
    enableReinitialize: true,
})(CopyCosting));