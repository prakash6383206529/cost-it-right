import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Container, Col } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { renderText, renderSelectField, searchableSelect } from "../../layout/FormInputs";
import { fetchMaterialComboAPI } from '../../../actions/master/Comman';
import {
    getPlantCombo, getExistingSupplierDetailByPartId, createPartWithSupplier,
    checkPartWithTechnology
} from '../../../actions/costing/costing';
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
            supplier2: [],
            supplier3: [],
            partNo: '',
            addSupplier1: false,
            TechnologyId: '',
            hideButtonAdd1: true,
            hideButtonAdd2: true,
            hideButtonAdd3: true,
            addSupplier2: false,
            supplierOneName: '',
            supplierTwoName: '',
            supplierThreeName: '',
            supplierDropdown1Array: [],
            supplierDropdown2Array: [],
            supplierDropdown3Array: [],
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
        const { supplierDropdown1Array, supplierDropdown2Array, supplierDropdown3Array } = this.state;
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

        if (label === 'supplier2') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'supplier3') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'supplierDropdown1') {
            supplierDropdown1Array && supplierDropdown1Array.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'supplierDropdown2') {
            supplierDropdown2Array && supplierDropdown2Array.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'supplierDropdown3') {
            supplierDropdown3Array && supplierDropdown3Array.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
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
        const { partNo, supplier, TechnologyId } = this.state;
        const { technologyList } = this.props;
        const selectedTechnology = TechnologyId != '' ? TechnologyId : technologyList[0].Value;

        this.props.change("SupplierCode", "")
        this.props.change("POPrice", "")
        this.setState({ partNo: e.target.value, supplier: [] }, () => {
            const checkPartData = {
                PartId: this.state.partNo,
                TechnologyId: selectedTechnology
            }
            this.props.checkPartWithTechnology(checkPartData, res => {
                this.props.getExistingSupplierDetailByPartId(this.state.partNo, res => {
                    // After get listing of exis suppliers
                    this.existingSupplierDetail()
                })
            })
        });
    };

    existingSupplierDetail = () => {
        const { existingSupplierDetail, Suppliers } = this.props;
        if (existingSupplierDetail) {
            this.props.change("PartDescription", existingSupplierDetail.PartDescription)

            const existSuppliers = existingSupplierDetail && existingSupplierDetail.ExistingSupplierDetails;
            //console.log('%c 🍤 existSuppliers: 11', 'font-size:20px;background-color: #ED9EC7;color:#fff;', existSuppliers);

            let supplierArray = {};
            let supplier2Array = {};
            let supplier3Array = {};
            let supplierDropdown1Array = [];
            let supplierDropdown2Array = [];
            let supplierDropdown3Array = [];
            this.props.change("POPrice", "");
            this.props.change("POPrice2", "");
            this.props.change("POPrice3", "");
            this.props.change("SupplierCode", "");
            this.props.change("SupplierCode2", "");
            this.props.change("SupplierCode3", "");

            existSuppliers.map((Value, index) => {
                //console.log('%c 🍍 Value: 22', 'font-size:20px;background-color: #F5CE50;color:#fff;', Value);
                const supplierObj = Suppliers.find(item => item.Value === Value.SupplierId);
                if (index == 0) {
                    this.props.change("POPrice", Value.PurchaseOrderPrice);
                    supplierDropdown1Array = Value.ActiveCostingSelectList;
                    this.setState({
                        supplierOneName: supplierObj.Text.substring(0, supplierObj.Text.indexOf('(')),
                    })
                    //return supplierArray.push({ label: supplierObj.Text, value: supplierObj.Value });
                    return supplierArray = { label: supplierObj.Text, value: supplierObj.Value };
                }
                if (index == 1) {
                    this.props.change("POPrice2", Value.PurchaseOrderPrice)
                    supplierDropdown2Array = Value.ActiveCostingSelectList;
                    this.setState({
                        supplierTwoName: supplierObj.Text.substring(0, supplierObj.Text.indexOf('(')),
                    })
                    //return supplier2Array.push({ label: supplierObj.Text, value: supplierObj.Value });
                    return supplier2Array = { label: supplierObj.Text, value: supplierObj.Value };
                }
                if (index == 2) {
                    this.props.change("POPrice3", Value.PurchaseOrderPrice)
                    supplierDropdown3Array = Value.ActiveCostingSelectList;
                    this.setState({
                        supplierThreeName: supplierObj.Text.substring(0, supplierObj.Text.indexOf('(')),
                    })
                    //return supplier3Array.push({ label: supplierObj.Text, value: supplierObj.Value });
                    return supplier3Array = { label: supplierObj.Text, value: supplierObj.Value };
                }
            });
            this.setState({
                supplier: supplierArray,
                supplier2: supplier2Array,
                supplier3: supplier3Array,
                hideButtonAdd1: supplierArray.hasOwnProperty('label') ? false : true,
                hideButtonAdd2: supplier2Array.hasOwnProperty('label') ? false : true,
                hideButtonAdd3: supplier3Array.hasOwnProperty('label') ? false : true,
                supplierDropdown1Array: supplierDropdown1Array,
                supplierDropdown2Array: supplierDropdown2Array,
                supplierDropdown3Array: supplierDropdown3Array,
                addSupplier1: supplierArray.hasOwnProperty('label') ? true : false,
                addSupplier2: supplier2Array.hasOwnProperty('label') ? true : false,
                addSupplier3: supplier3Array.hasOwnProperty('label') ? true : false,
            }, () => {
                this.setSupplierCode()
            });
        } else {
            this.setState({
                //supplier: supplierArray,
                //supplier2: supplier2Array,
                //supplier3: supplier3Array,
                //hideButtonAdd1: supplierArray.length > 0 ? false : true,
                //hideButtonAdd2: supplier2Array.length > 0 ? false : true,
                //hideButtonAdd3: supplier3Array.length > 0 ? false : true,
                //supplierDropdown1Array: supplierDropdown1Array,
                //supplierDropdown2Array: supplierDropdown2Array,
                //supplierDropdown3Array: supplierDropdown3Array,
                //addSupplier1: supplierArray.length > 0 ? true : false,
                //addSupplier2: supplier2Array.length > 0 ? true : false,
                //addSupplier3: supplier3Array.length > 0 ? true : false,
            });
        }
    }

    setSupplierCode = () => {
        const { supplier, supplier2, supplier3 } = this.state;
        if (supplier) {
            console.log('innn 1')
            const phrase = supplier.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            const result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode", result)
        }

        if (supplier2) {
            const phrase = supplier2.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            const result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode2", result)
        }

        if (supplier3) {
            const phrase = supplier3.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            const result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode3", result)
        }
    }

    /**
    * @method supplierHandler
    * @description Used to handle plant
    */
    supplierHandler = (newValue, actionMeta) => {
        console.log('%c 🌮 newValue: ', 'font-size:20px;background-color: #E41A6A;color:#fff;', newValue);
        this.setState({ supplier: newValue }, () => {
            const { supplier } = this.state;
            const phrase = supplier && supplier.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode", result)
        });
    };

    /**
    * @method supplierHandler
    * @description Used to handle plant
    */
    supplier2Handler = (newValue, actionMeta) => {
        this.setState({ supplier2: newValue }, () => {
            const { supplier2 } = this.state;
            const phrase = supplier2 && supplier2.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode2", result)
        });
    };

    /**
    * @method supplier2Handler
    * @description Used to handle plant
    */
    supplier3Handler = (newValue, actionMeta) => {
        this.setState({ supplier3: newValue }, () => {
            const { supplier3 } = this.state;
            const phrase = supplier3 && supplier3.label;
            const myRegexp = /-(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match && match[1].slice(1, -1);
            this.props.change("SupplierCode3", result)
        });
    };

    addSupplier1 = () => {
        const { supplier, addSupplier1, partNo } = this.state;
        console.log("supplier", supplier.value)
        const requestData = {
            PartId: partNo,
            SupplierId: supplier.value
        }

        this.props.createPartWithSupplier(requestData, res => {
            const phrase = supplier.label;
            const myRegexp = /'.'(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match[1].slice(1, -1);
            this.setState({
                supplierOneName: result,
                addSupplier1: true
            })

        })
    }

    addSupplier2 = () => {
        const { supplier2, partNo } = this.state;
        console.log("supplier2", supplier2.value)
        const requestData = {
            PartId: partNo,
            SupplierId: supplier2.value
        }

        this.props.createPartWithSupplier(requestData, res => {
            const phrase = supplier2.label;
            const myRegexp = /'.'(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match[1].slice(1, -1);
            this.setState({
                supplierTwoName: result,
                addSupplier2: true
            })
        })
    }

    addSupplier3 = () => {
        const { supplier3, addSupplier1, partNo } = this.state;
        console.log("supplier3", supplier3.value)
        const requestData = {
            PartId: partNo,
            SupplierId: supplier3.value
        }

        this.props.createPartWithSupplier(requestData, res => {
            const phrase = supplier3.label;
            const myRegexp = /'.'(.*)/;
            const match = myRegexp.exec(phrase);
            var result = match[1].slice(1, -1);
            this.setState({
                supplierThreeName: result,
                addSupplier3: true
            })

        })
    }

    activeSupplierHandler1 = (e) => {
        this.setState({
            activeSupplier1: e.target.value
        })
    }

    activeSupplierHandler2 = (e) => {
        this.setState({
            activeSupplier2: e.target.value
        })
    }

    activeSupplierHandler3 = (e) => {
        this.setState({
            activeSupplier3: e.target.value
        })
    }

    supplierCosting = (supplierId) => {
        this.props.supplierCosting(supplierId)
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
        const { supplier } = this.state;
        return (
            <div>
                {this.props.loading && <Loader />}
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row>
                        {/* -------------start left section------------------- */}
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
                            <Col>
                                <Field
                                    label={`Part Desc`}
                                    name={"PartDescription"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </Col>
                        </Col>
                        {/* -----------------end left section-------------------- */}
                        {/* -----------------start right section-------------------- */}
                        <Col md="8">
                            <h5>{`Existing Supplier Details`}</h5>
                            <Col md="4" className={'existing-supplier'}>
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
                            <Col md="3" className={'existing-supplier'}>
                                <Field
                                    label={`Supplier Code`}
                                    name={"SupplierCode"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    required={true}
                                    className=""
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3" className={'existing-supplier'}>
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
                            <Col md="2" className={'existing-supplier'}>
                                {this.state.hideButtonAdd1 &&
                                    <button onClick={this.addSupplier1} className={'btn btn-secondary'}>Add</button>
                                }
                            </Col>


                            <hr />
                            <Col md="4" className={'existing-supplier'}>
                                <Field
                                    id="SupplierName2"
                                    name="SupplierName2"
                                    type="text"
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    label="Supplier2 Name"
                                    component={searchableSelect}
                                    //validate={[required, maxLength50]}
                                    options={this.renderTypeOfListing('supplier2')}
                                    //options={options}
                                    required={true}
                                    handleChangeDescription={this.supplier2Handler}
                                    valueDescription={this.state.supplier2}
                                />
                            </Col>
                            <Col md="3" className={'existing-supplier'}>
                                <Field
                                    label={`Supplier2 Code`}
                                    name={"SupplierCode2"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    required={true}
                                    className=""
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3" className={'existing-supplier'}>
                                <Field
                                    label={`PO Price`}
                                    name={"POPrice2"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    required={true}
                                    className="withoutBorder"
                                />
                            </Col>
                            <Col md="2" className={'existing-supplier'}>
                                {this.state.hideButtonAdd2 &&
                                    <button onClick={this.addSupplier2} className={'btn btn-secondary'}>Add</button>
                                }
                            </Col>


                            <hr />
                            <Col md="4" className={'existing-supplier'}>
                                <Field
                                    id="SupplierName3"
                                    name="SupplierName3"
                                    type="text"
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    label="Supplier 3 Name"
                                    component={searchableSelect}
                                    //validate={[required, maxLength50]}
                                    options={this.renderTypeOfListing('supplier3')}
                                    //options={options}
                                    required={true}
                                    handleChangeDescription={this.supplier3Handler}
                                    valueDescription={this.state.supplier3}
                                />
                            </Col>
                            <Col md="3" className={'existing-supplier'}>
                                <Field
                                    label={`Supplier 3 Code`}
                                    name={"SupplierCode3"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    required={true}
                                    className=""
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3" className={'existing-supplier'}>
                                <Field
                                    label={`PO Price`}
                                    name={"POPrice3"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    required={true}
                                    className="withoutBorder"
                                />
                            </Col>
                            <Col md="2" className={'existing-supplier'}>
                                {this.state.hideButtonAdd3 &&
                                    <button onClick={this.addSupplier3} className={'btn btn-secondary'}>Add</button>
                                }
                            </Col>
                        </Col>
                        {/* -----------------end right section-------------------- */}
                    </Row>
                    <hr />
                    <Row>
                        <Col md="1">ZBC V/s VBC</Col>
                        <Col md="2">ZBC</Col>
                        <Col md="3">
                            {!this.state.addSupplier1 && this.state.supplierOneName == '' && <div>Supplier1</div>}
                            {this.state.supplierOneName != '' && <a href="javascript:void(0)" onClick={() => this.supplierCosting(supplier.value)} >{`${this.state.supplierOneName}`}</a>}
                            {this.state.addSupplier1 &&
                                <div>
                                    <Field
                                        label={``}
                                        name={"activeSupplier1"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        // required={true}
                                        className=" withoutBorder custom-select"
                                        options={this.renderTypeOfListing('supplierDropdown1')}
                                        onChange={this.activeSupplierHandler1}
                                        optionValue={'Value'}
                                        optionLabel={'Text'}
                                        component={renderSelectField}
                                    />
                                </div>
                            }
                        </Col>
                        <Col md="3">
                            {!this.state.addSupplier2 && this.state.supplierTwoName == '' && <div>Supplier2</div>}
                            {this.state.supplierTwoName != '' && <a href="javascript:void(0)" onClick={() => this.supplierCosting(supplier.value)} >{`${this.state.supplierTwoName}`}</a>}
                            {this.state.addSupplier2 &&
                                <Field
                                    label={``}
                                    name={"activeSupplier2"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('supplierDropdown2')}
                                    onChange={this.activeSupplierHandler2}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            }
                        </Col>
                        <Col md="3">
                            {!this.state.addSupplier3 && this.state.supplierTwoName == '' && <div>Supplier3</div>}
                            {this.state.supplierThreeName != '' && <a href="javascript:void(0)" onClick={() => this.supplierCosting(supplier.value)} >{`${this.state.supplierThreeName}`}</a>}
                            {this.state.addSupplier3 &&
                                <Field
                                    label={``}
                                    name={"activeSupplier3"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('supplierDropdown3')}
                                    onChange={this.activeSupplierHandler3}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            }</Col>
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
        const { existingSupplierDetail } = costing;
        const { Plants, Parts, Suppliers } = costing.plantComboDetail;
        return { technologyList, plantList, Plants, Parts, Suppliers, existingSupplierDetail }
    }

}


export default connect(mapStateToProps, {
    fetchMaterialComboAPI,
    getPlantCombo,
    getExistingSupplierDetailByPartId,
    createPartWithSupplier,
    checkPartWithTechnology
})(reduxForm({
    form: 'CostSummary',
    enableReinitialize: true,
})(CostSummary));

