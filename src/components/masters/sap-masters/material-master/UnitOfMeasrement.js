import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col,Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText } from "../../../layout/FormInputs";
import { createPartAPI } from '../../../../actions/Part';

class UnitOfMeasurement extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log('submit the form', values);
        // this.props.createPartAPI(values, (res) => {
        //     if (res.data.Result === true) {
        //       toastr.success(res.data.Message,'success');
        //     } else {
        //       toastr.error(res.data.message,'danger');
        //     }
        //   });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>Add Part</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Material Code"
                                                name={"mCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //maxLength={26}
                                            />
                                        </Col>

                                        <Col md="6">
                                            <Field
                                                label="Material Type"
                                                name={"mTYpe"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //maxLength={26}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Material Group code"
                                                name={"mTYpe"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                //maxLength={26}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Unit Of Measurement"
                                                name={"unitOfMeasurment"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //maxLength={26}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="12">
                                            <Field
                                                label="Description"
                                                name={"description"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //maxLength={26}
                                            />
                                        </Col>
                                    </Row>
                                    
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                Save
                                            </button>
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
                    </ModalBody>
                </Modal>
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


// export default connect(
//     mapStateToProps, null
// )(PartMaster);

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, null)(reduxForm({
    //validate,
    form: 'AddPart',
    //enableReinitialize: true,
    // onSubmitFail: (errors) => {
    //     focusOnError(errors)
    // }
})(UnitOfMeasurement));
