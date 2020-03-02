import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number, getSupplierCode } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect, focusOnError } from "../../../layout/FormInputs";
import { getPlantBySupplier } from '../../../../actions/master/Comman';
import {
    createOverheadProfitAPI, getOverheadProfitComboData, getOverheadProfitDataAPI,
    updateOverheadProfitAPI, getOverheadProfitAPI
} from '../../../../actions/master/OverheadProfit';
//import { createOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddOverheadProfit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processOperationValue: [],
            supplierValue: [],
            overHeadValue: [],
            profitTypesValue: [],
            typeOfListing: [],
            technologyValue: '',
            TechnologyId: '',
            PlantId: '',
            modelId: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getOverheadProfitComboData(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { OverheadProfitId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getOverheadProfitDataAPI(OverheadProfitId, res => {
                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    setTimeout(() => { this.getData(Data) }, 500)
                }
            })
        } else {
            this.props.getOverheadProfitDataAPI('', res => { })
        }
    }

    getData = (Data) => {
        this.props.getPlantBySupplier(Data.SupplierId, () => {
            const { filterPlantList, Suppliers, ModelTypes, OverheadTypes, ProfitTypes, Technologies } = this.props;
            console.log('filterPlantList', filterPlantList)
            const tempObj1 = Suppliers.find(item => item.Value == Data.SupplierId)
            const tempObj2 = OverheadTypes.find(item => item.Value == Data.OverheadTypeId)
            const tempObj3 = ProfitTypes.find(item => item.Value == Data.ProfitTypeId)
            const tempObj4 = filterPlantList.find(item => item.Value == Data.PlantId)
            const tempObj5 = ModelTypes.find(item => item.Value == Data.ModelTypeId)
            const tempObj6 = Technologies.find(item => item.Value == Data.TechnologyId)

            this.setState({
                supplierValue: { label: tempObj1.Text, value: tempObj1.Value },
                overHeadValue: { label: tempObj2.Text, value: tempObj2.Value },
                profitTypesValue: { label: tempObj3.Text, value: tempObj3.Value },
                PlantId: tempObj4.Value,
                modelId: tempObj5.Value,
                TechnologyId: tempObj6.Value,
            });
        })
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
        const { overHeadValue, profitTypesValue, supplierValue, modelId, TechnologyId, PlantId } = this.state;
        const { Technologies, OverheadProfitId } = this.props;

        if (PlantId == '' || PlantId == 0) {
            return false;
        }
        if (modelId == '' || modelId == 0) {
            return false;
        }
        values.TechnologyId = TechnologyId != '' ? TechnologyId : Technologies[0].Value;;
        values.SupplierId = supplierValue.value;
        values.OverheadTypeId = overHeadValue.value;
        values.ProfitTypeId = profitTypesValue.value;
        values.PlantId = PlantId;
        values.ModelTypeId = modelId;
        values.CreatedBy = loggedInUserId();

        if (this.props.isEditFlag) {

            this.setState({ isSubmitted: true });
            let formData = {
                OverheadProfitId: OverheadProfitId,
                TechnologyName: '',
                SupplierName: supplierValue.label,
                PlantName: '',
                OverheadTypeName: overHeadValue.label,
                ProfitTypeName: profitTypesValue.label,
                ModelTypeName: '',
                OverheadPercentage: values.OverheadPercentage,
                ProfitPercentage: values.ProfitPercentage,
                OverheadMachiningCCPercentage: values.OverheadMachiningCCPercentage,
                ProfitMachiningCCPercentage: values.ProfitMachiningCCPercentage,
                SupplierCode: '',
                TechnologyId: TechnologyId,
                SupplierId: supplierValue.value,
                OverheadTypeId: overHeadValue.value,
                ProfitTypeId: profitTypesValue.value,
                ModelTypeId: modelId,
                PlantId: PlantId,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId()
            }
            this.props.updateOverheadProfitAPI(formData, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.OVERHEAD_PROFIT_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getOverheadProfitAPI(res => { });
                }
            });
        } else {
            this.props.createOverheadProfitAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.OVERHEAD_PROFIT_ADDED_SUCCESS);
                    { this.toggleModel() }
                }
            });
        }
    }

    processOperationHandler = (newValue, actionMeta) => {
        this.setState({ processOperationValue: newValue });
    };

    technologyHandler = (e) => {
        this.setState({ TechnologyId: e.target.value });
    }

    handleChangeSupplier = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ supplierValue: newValue }, () => {
                const { supplierValue } = this.state;
                this.props.getPlantBySupplier(supplierValue.value, () => {
                    const supplierCode = getSupplierCode(supplierValue.label);
                    this.props.change('SupplierCode', supplierCode)
                })
            });
        } else {
            this.setState({ supplierValue: [] })
            this.props.change('SupplierCode', '')
        }
    };

    handleChangeOverheadType = (newValue, actionMeta) => {
        this.setState({ overHeadValue: newValue });
    };

    handleChangeProfitTypes = (newValue, actionMeta) => {
        this.setState({ profitTypesValue: newValue });
    };

    uomHandler = (e) => {
        this.setState({
            uom: e.target.value
        })
    }

    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }

    modelHandler = (e) => {
        this.setState({
            modelId: e.target.value
        })
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { ModelTypes, ProfitTypes, OverheadTypes, Plants, Suppliers, Technologies, filterPlantList } = this.props;
        const temp = [];
        //const tempSupplier = [];
        if (label == 'technology') {
            Technologies && Technologies.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'modelTypes') {
            ModelTypes && ModelTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'profitTypes') {
            ProfitTypes && ProfitTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'overheadTypes') {
            OverheadTypes && OverheadTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'supplier') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'plant') {
            filterPlantList && filterPlantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }


    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;

        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Overhead and Profit' : 'Add Overhead and Profit'}</ModalHeader>
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
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('technology')}
                                                //options={technologyOptions}
                                                onChange={this.technologyHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
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
                                                //validate={[required]}
                                                options={this.renderTypeOfListing('supplier')}
                                                //required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Supplier Code"
                                                name={"SupplierCode"}
                                                type="text"
                                                placeholder={'Enter Supplier Code'}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={'Enter Plant'}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.plantHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                id="OverheadTypeId"
                                                name="OverheadTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Overhead Type"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('overheadTypes')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeOverheadType}
                                                valueDescription={this.state.overHeadValue}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Overhead (%)"
                                                name={"OverheadPercentage"}
                                                type="text"
                                                placeholder={'Enter Overhead (%)'}
                                                validate={[number]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                id="ProfitTypeId"
                                                name="ProfitTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Profit Type"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('profitTypes')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeProfitTypes}
                                                valueDescription={this.state.profitTypesValue}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Profit (%)"
                                                name={"ProfitPercentage"}
                                                type="text"
                                                placeholder={'Enter Profit (%)'}
                                                validate={[number]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Overhead Machining(CC) (%)"
                                                name={"OverheadMachiningCCPercentage"}
                                                type="text"
                                                placeholder={''}
                                                validate={[number]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Profit Machining(CC) (%) "
                                                name={"ProfitMachiningCCPercentage"}
                                                type="text"
                                                placeholder={''}
                                                validate={[number]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col>
                                            <Field
                                                label={`Model Type`}
                                                name={"ModelTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('modelTypes')}
                                                onChange={this.modelHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>


                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
                                                    {'Reset'}
                                                </button>}
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
function mapStateToProps({ overheadProfit, comman }) {
    const { filterPlantList } = comman;
    if (overheadProfit && overheadProfit.overheadProfitComboData != undefined) {
        const { overheadProfitData, overheadProfitComboData } = overheadProfit;
        let { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies } = overheadProfit.overheadProfitComboData;

        let initialValues = {};
        if (overheadProfitData && overheadProfitData != undefined) {
            initialValues = {
                OverheadPercentage: overheadProfitData.OverheadPercentage,
                ProfitPercentage: overheadProfitData.ProfitPercentage,
                OverheadMachiningCCPercentage: overheadProfitData.OverheadMachiningCCPercentage,
                ProfitMachiningCCPercentage: overheadProfitData.ProfitMachiningCCPercentage,
                SupplierCode: overheadProfitData.SupplierCode,
                PlantId: overheadProfitData.PlantId,
                ModelTypeId: overheadProfitData.ModelTypeId,
            }
        }
        return { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, filterPlantList, overheadProfitData, initialValues };
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantBySupplier,
    getOverheadProfitComboData,
    createOverheadProfitAPI,
    getOverheadProfitDataAPI,
    updateOverheadProfitAPI,
    getOverheadProfitAPI,
})(reduxForm({
    form: 'addOverheadProfit',
    onSubmitFail: errors => {
        console.log('ddd', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(AddOverheadProfit));
