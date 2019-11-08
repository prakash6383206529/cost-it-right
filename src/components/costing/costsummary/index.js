import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Container, Col } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { renderText, renderSelectField, searchableSelect } from "../../layout/FormInputs";
import { fetchMaterialComboAPI } from '../../../actions/master/Comman';
import { getPlantCombo, getExistingSupplierDetailByPartId, createPartWithSupplier } from '../../../actions/costing/costing';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';


class CostSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            plant: [],
            supplier: [],
            partNo: '',
            addSupplier1: false,
            supplierOneName: ''
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        this.props.fetchMaterialComboAPI(res => { });
        this.props.getPlantCombo(res => { });
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
    * @method renderTypeOfListing
    * @description Used to show type of listing
    */
    renderTypeOfListing = (label) => {
        const { technologyList, plantList, Parts, Suppliers } = this.props;
        const temp = [];

        if (label === 'technology') {
            technologyList && technologyList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'part') {
            Parts && Parts.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'supplier') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method plantHandler
    * @description Used to handle plant
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ plant: newValue });
    };

    /**
    * @method partHandler
    * @description Used to handle plant
    */
    partHandler = (e) => {
        this.setState({ partNo: e.target.value }, () => {
            this.props.getExistingSupplierDetailByPartId(this.state.partNo, res => { })
        });
    };

    /**
    * @method supplierHandler
    * @description Used to handle plant
    */
    supplierHandler = (newValue, actionMeta) => {
        this.setState({ supplier: newValue }, () => {
            const { supplier } = this.state;
            const phrase = supplier.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match[1].slice(1, -1);
            this.props.change("SupplierCode", result)
        });
    };

    addSupplier1 = () => {
        const { supplier, addSupplier1, partNo } = this.state;
        console.log("supplier", supplier.value)
        const requestData = {
            PartId: partNo,
            SupplierId: supplier.value
        }
        this.setState({
            addSupplier1: true
        }, () => {
            this.props.createPartWithSupplier(requestData, res => {
                const phrase = supplier.label;
                const myRegexp = /'.'(.*)/;
                const match = myRegexp.exec(phrase);
                var result = match[1].slice(1, -1);
                this.setState({
                    supplierOneName: result
                })
            })
        })
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
        return (
            <div>
                {this.props.loading && <Loader />}
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row>
                        <Col md="4">
                            <h5>{`Item Detail`}</h5>
                            <Col md="12">
                                <Field
                                    label={`Technology Id`}
                                    name={"TechnologyId"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('technology')}
                                    onChange={this.handleTypeofListing}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                    disabled={true}
                                />
                            </Col>
                            <Col>
                                <Field
                                    id="PlantId"
                                    name="PlantId"
                                    type="text"
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    label="Plant"
                                    component={searchableSelect}
                                    //validate={[required, maxLength50]}
                                    options={this.renderTypeOfListing('plant')}
                                    //options={options}
                                    required={true}
                                    handleChangeDescription={this.plantHandler}
                                    valueDescription={this.state.plant}
                                />
                            </Col>
                            <Col>
                                <Field
                                    label={`Part No.`}
                                    name={"part"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('part')}
                                    onChange={this.partHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            </Col>
                        </Col>
                        <Col md="8">
                            <h5>{`Existing Supplier Details`}</h5>
                            <Col md="4">
                                <Field
                                    id="SupplierName"
                                    name="SupplierName"
                                    type="text"
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    label="Supplier Name"
                                    component={searchableSelect}
                                    //validate={[required, maxLength50]}
                                    options={this.renderTypeOfListing('supplier')}
                                    //options={options}
                                    required={true}
                                    handleChangeDescription={this.supplierHandler}
                                    valueDescription={this.state.supplier}
                                />
                            </Col>
                            <Col md="3">
                                <Field
                                    label={`Supplier Code`}
                                    name={"SupplierCode"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <Field
                                    label={`PO Price`}
                                    name={"POPrice"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    required={true}
                                    className="withoutBorder"
                                />
                            </Col>
                            <Col md="2">
                                <button onClick={this.addSupplier1} className={'btn btn-secondary'}>Add</button>
                            </Col>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col md="2">ZBC V/s VBC</Col>
                        <Col md="2">ZBC</Col>
                        <Col md="2">
                            {!this.state.addSupplier1 && <div>Supplier1</div>}
                            {this.state.addSupplier1 &&
                                // <Field
                                //     label={`Part No.`}
                                //     name={"part"}
                                //     type="text"
                                //     placeholder={''}
                                //     //validate={[required]}
                                //     // required={true}
                                //     className=" withoutBorder custom-select"
                                //     options={this.renderTypeOfListing('part')}
                                //     onChange={this.partHandler}
                                //     optionValue={'Value'}
                                //     optionLabel={'Text'}
                                //     component={renderSelectField}
                                // />
                                <a href="#">{this.state.supplierOneName}</a>
                            }
                        </Col>
                        <Col md="2">
                            <div>Supplier2</div>

                        </Col>
                        <Col md="2">Supplier3</Col>
                    </Row>
                </form>
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, costing }) {
    const { plantList, technologyList } = comman;
    if (costing && costing.plantComboDetail) {
        const { Plants, Parts, Suppliers } = costing.plantComboDetail;
        return { technologyList, plantList, Plants, Parts, Suppliers }
    }

}


export default connect(mapStateToProps, {
    fetchMaterialComboAPI,
    getPlantCombo,
    getExistingSupplierDetailByPartId,
    createPartWithSupplier
})(reduxForm({
    form: 'CostSummary',
    enableReinitialize: true,
})(CostSummary));

