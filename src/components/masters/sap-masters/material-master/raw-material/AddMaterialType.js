import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText } from "../../../../layout/FormInputs";
import { createMaterialTypeAPI, getMaterialDetailAPI, getMaterialTypeDataAPI } from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";

class AddMaterialType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { MaterialTypeId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getMaterialTypeDataAPI(MaterialTypeId, res => { });
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
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { MaterialTypeId, isEditFlag } = this.props;
        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                MaterialTypeId: MaterialTypeId,
                ModifiedBy: loggedInUserId(),
                CreatedDate: '',
                MaterialType: values.MaterialType,
                Description: values.Description,
                CalculatedDensityValue: values.CalculatedDensityValue,
                IsActive: true
            }
            this.props.updateMaterialtypeAPI(formData, () => {
                this.toggleModel()
            })
        } else {
            this.props.createMaterialTypeAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
                    this.props.getMaterialDetailAPI(res => { });
                    this.toggleModel()
                } else {
                    toastr.error(res.data.Message);
                }
            });
        }
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`Add Material Type`}</ModalHeader>
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
                                                label={`Material Type`}
                                                name={"MaterialType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="5">
                                            <Field
                                                label={`Density`}
                                                name={"CalculatedDensityValue"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            //customClassName=" withoutBorderBottom"
                                            />
                                        </Col>
                                        <Col md="1">
                                            <label>(kg/m3)</label>
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Description`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {`${CONSTANT.SAVE}`}
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
function mapStateToProps({ material }) {
    const { materialTypeData } = material;
    let initialValues = {};
    if (materialTypeData && materialTypeData != undefined) {
        initialValues = {
            MaterialType: materialTypeData.MaterialType,
            CalculatedDensityValue: materialTypeData.CalculatedDensityValue,
            Description: materialTypeData.Description,
        }
    }
    return { initialValues, materialTypeData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createMaterialTypeAPI,
    getMaterialDetailAPI,
    getMaterialTypeDataAPI,
})(reduxForm({
    form: 'AddMaterialType',
    enableReinitialize: true,
})(AddMaterialType));
