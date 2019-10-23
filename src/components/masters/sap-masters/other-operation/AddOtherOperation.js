import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getOtherOperationData } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddOtherOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueDescription: [],
            supplierValue: [],
            typeOfListing: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getOtherOperationData(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { uomId, isEditFlag } = this.props;

        // if (isEditFlag) {
        //     this.setState({ isEditFlag }, () => {
        //         this.props.getOneUnitOfMeasurementAPI(uomId, true, res => { })
        //     })
        // } else {
        //     this.props.getOneUnitOfMeasurementAPI('', false, res => { })
        // }
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
        // if (this.props.isEditFlag) {
        //     console.log('values', values);
        //     const { uomId } = this.props;
        //     this.setState({ isSubmitted: true });
        //     let formData = {
        //         Name: values.Name,
        //         Title: values.Title,
        //         Description: values.Description,
        //         Id: uomId
        //     }
        //     this.props.updateUnitOfMeasurementAPI(uomId, formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
        //             this.toggleModel();
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // } else {
        //     this.props.createUnitOfMeasurementAPI(values, (res) => {
        //         if (res.data.Result === true) {
        //             toastr.success(MESSAGES.UOM_ADD_SUCCESS);
        //             { this.toggleModel() }
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(res.data.message);
        //         }
        //     });
        // }
    }

    handleChangeDescription = (newValue, actionMeta) => {
        //console.log(newValue);
        this.setState({ valueDescription: newValue });
    };

    handleChangeSupplier = (newValue, actionMeta) => {
        //console.log(newValue);
        this.setState({ supplierValue: newValue });
    };

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    uomHandler = (e) => {

    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        // const { uniOfMeasurementList, plantList, materialTypeList } = this.props;

        const options = [
            { label: "test 1", value: "test1" },
            { label: "test 2", value: "test2" },
            { label: "test 3", value: "test3" },
        ];

        const technologyOptions = [{
            "Disabled": false,
            "Group": null,
            "Selected": false,
            "Text": "--Select Operation--",
            "Value": "0"
        },
        {
            "Disabled": false,
            "Group": null,
            "Selected": false,
            "Text": "Turning(O-TURN-29603)",
            "Value": "fb9ada58-cc95-4912-8a98-289127469620"
        },
        {
            "Disabled": false,
            "Group": null,
            "Selected": false,
            "Text": "Molding(O-MOLD-29603)",
            "Value": "0350b41f-ac5d-48fb-85cf-cda8f136703b"
        }];

        const supplierOptions = [
            {
                "Disabled": false,
                "Group": null,
                "Selected": false,
                "Text": "--Select Operation--",
                "Value": "0"
            },
            {
                "Disabled": false,
                "Group": null,
                "Selected": false,
                "Text": "Turning(O-TURN-29603)",
                "Value": "fb9ada58-cc95-4912-8a98-289127469620"
            }
        ];



        // const temp = [];
        // const tempSupplier = [];
        // if (label == 'technology') {
        //     technologyOptions && technologyOptions.map(item =>
        //         temp.push({ label: item.Text, value: item.Value })
        //     );
        //     return temp;
        // }
        // if (label == 'supplier') {
        //     supplierOptions && supplierOptions.map(item =>
        //         tempSupplier.push({ label: item.Text, value: item.Value })
        //     );
        //     return tempSupplier;
        // }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;

        const options = [
            { label: "test 1", value: "test1" },
            { label: "test 2", value: "test2" },
            { label: "test 3", value: "test3" },
        ];

        const technologyOptions = [
            { label: "test 1", value: "test1" },
            { label: "test 2", value: "test2" },
            { label: "test 3", value: "test3" },
        ];

        const uomOptions = [
            { label: "UOM 1", value: "UOM1" },
            { label: "UOM 2", value: "UOM2" },
            { label: "UOM 3", value: "UOM3" },
        ];

        const supplierOptions = [
            { label: "UOM 1", value: "UOM1" },
            { label: "UOM 2", value: "UOM2" },
            { label: "UOM 3", value: "UOM3" },
        ];


        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update UOM' : 'Add UOM'}</ModalHeader>
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
                                                label={`Technology`}
                                                name={"technology"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                //options={this.renderTypeOfListing('technology')}
                                                options={technologyOptions}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Process Code"
                                                name={"processCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                id="processOperation"
                                                name="processOperation"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Process Operation"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                //options={this.renderTypeOfListing('processOperation')}
                                                options={options}
                                                required={true}
                                                handleChangeDescription={this.handleChangeDescription}
                                                valueDescription={this.state.valueDescription}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                id="supplier"
                                                name="supplier"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Supplier"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                //options={this.renderTypeOfListing('supplier')}
                                                options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`UOM`}
                                                name={"uom"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                //options={this.renderTypeOfListing('uom')}
                                                options={uomOptions}
                                                onChange={this.uomHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Rate"
                                                name={"Rate"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
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
function mapStateToProps({ comman }) {
    //const { technologyList, operations, suppliers, uoms } = comman.otherOperationFormData;
    // console.log('technologyList: ', technologyList, technologyList);
    // let initialValues = {};
    // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
    //     initialValues = {
    //         technologyList,
    //         uniOfMeasurementList
    //     }
    // }
    // return { uniOfMeasurementList, initialValues, technologyList };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchMasterDataAPI,
    getOtherOperationData
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddOtherOperation));
