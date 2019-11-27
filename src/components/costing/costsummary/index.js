import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Container, Col, CardTitle } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { renderText, renderSelectField, searchableSelect } from "../../layout/FormInputs";
import { fetchMaterialComboAPI, fetchCostingHeadsAPI, fetchModelTypeAPI } from '../../../actions/master/Comman';
import {
    getPlantCombo, getExistingSupplierDetailByPartId, createPartWithSupplier,
    checkPartWithTechnology, getCostingByCostingId
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
            activeZBCSupplier: '',
            netRMCostZBC: '',
            netRMCostSupplier1: '',
            netRMCostSupplier2: '',
            netRMCostSupplier3: '',
            modelTypeZBC: ''
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        this.props.fetchMaterialComboAPI(res => { });
        this.props.getPlantCombo(res => { });
        this.props.fetchCostingHeadsAPI('--select--', () => { })
        this.props.fetchModelTypeAPI('--Model Type--', () => { })
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
        const { technologyList, plantList, Parts, Suppliers, ZBCSupplier, supplier2CostingDat, costingHead,
            modelTypes } = this.props;
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

        if (label === 'zbcSupplierDropdown') {
            ZBCSupplier && ZBCSupplier.ZBCCostings.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'Rejection') {
            costingHead && costingHead.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'modelType') {
            modelTypes && modelTypes.map(item =>
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
                console.log(index)
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
                activeSupplier1: '',
                activeSupplier2: '',
                activeSupplier3: '',
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

    activeZBCSupplierHandler = (e) => {
        this.setState({
            activeZBCSupplier: e.target.value
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
        }, () => {
            this.props.getCostingByCostingId(this.state.activeSupplier2, (res) => {
                if (res.data.Data) {
                    const { supplier2CostingData } = this.props;
                    console.log("ModelTypes", supplier2CostingData.ModelTypes)




                }
            })
        })
    }

    activeSupplierHandler3 = (e) => {
        this.setState({
            activeSupplier3: e.target.value
        })
    }

    supplierCosting = (supplierId) => {
        const data = {
            supplierId: supplierId,
            plantId: this.state.plant.value,
            partId: this.state.partNo
        }
        this.props.supplierCosting(data)
    }

    modelTypeHandlerZBC = (e) => {
        this.setState({
            modelTypeZBC: e.target.value
        })
    }

    modelTypeHandlerSupplier1 = (e) => {
        this.setState({
            modelTypeSupplier1: e.target.value
        })
    }

    modelTypeHandlerSupplier2 = (e) => {
        this.setState({
            modelTypeSupplier2: e.target.value
        })
    }

    modelTypeHandlerSupplier3 = (e) => {
        this.setState({
            modelTypeSupplier3: e.target.value
        })
    }

    rejectionHandlerZBC = (e) => {
        this.setState({
            rejectionTypeZBC: e.target.value
        })
    }

    rejectionHandlerSupplier1 = (e) => {
        this.setState({
            rejectionTypeSupplier1: e.target.value
        })
    }

    rejectionHandlerSupplier2 = (e) => {
        this.setState({
            rejectionTypeSupplier2: e.target.value
        })
    }

    rejectionHandlerSupplier3 = (e) => {
        this.setState({
            rejectionTypeSupplier3: e.target.value
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
        const { handleSubmit, ZBCSupplier, supplier2CostingData } = this.props;
        const { supplier, supplier2, supplier3 } = this.state;
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
                        <Col md="2">
                            <div>ZBC</div>
                            {ZBCSupplier && <a href="javascript:void(0)" >{`${ZBCSupplier.SupplierName}`}</a>}
                            {ZBCSupplier && ZBCSupplier.ZBCCostings &&
                                <Field
                                    label={``}
                                    name={"zbcSupplier"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('zbcSupplierDropdown')}
                                    onChange={this.activeZBCSupplierHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            }
                        </Col>
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
                            {this.state.supplierTwoName != '' && <a href="javascript:void(0)" onClick={() => this.supplierCosting(supplier2.value)} >{`${this.state.supplierTwoName}`}</a>}
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
                            {this.state.supplierThreeName != '' && <a href="javascript:void(0)" onClick={() => this.supplierCosting(supplier3.value)} >{`${this.state.supplierThreeName}`}</a>}
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
                    <hr />

                    {/* ---------------Material Cost start------------------ */}
                    <Row className={'divider'} >
                        <Col>A) Material Cost</Col>
                    </Row>
                    <Row>
                        <Col md="1">
                            Net RM Cost
                        </Col>
                        <Col md="2">
                            <input
                                type="text"
                                disabled
                                className={'mt20'}
                                value={this.state.netRMCostZBC}
                                title="NET NRM Cost" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                disabled
                                className={'mt20'}
                                value={this.state.netRMCostSupplier1}
                                title="NET NRM Cost" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                disabled
                                className={'mt20'}
                                value={this.state.netRMCostSupplier2}
                                title="NET NRM Cost" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                disabled
                                className={'mt20'}
                                value={this.state.netRMCostSupplier3}
                                title="NET NRM Cost" />
                        </Col>

                        <Col md="1" className={'mt20'}>
                            ECO No.
                        </Col>
                        <Col md="2">
                            <input
                                type="text"
                                className={'mt20'}
                                value={this.state.ecoNoZBC}
                                title="Enter ECO No" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                className={'mt20'}
                                value={this.state.ecoNoSupplier1}
                                title="Enter ECO No" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                className={'mt20'}
                                value={this.state.ecoNoSupplier2}
                                title="Enter ECO No" />
                        </Col>
                        <Col md="3">
                            <input
                                type="text"
                                className={'mt20'}
                                value={this.state.ecoNoSupplier3}
                                title="Enter ECO No" />
                        </Col>

                        <Col md="1" className={'mt20'}>
                            Rev No.
                        </Col>
                        <Col md="2">
                            <input
                                type="text"
                                className={'mt20'}
                                value={this.state.revNoZBC}
                                title="Enter Rev No" />
                        </Col>
                        <Col md="3">
                            <input type="text" className={'mt20'} value={this.state.revNoSupplier1} title="Enter Rev No" />
                        </Col>
                        <Col md="3">
                            <input type="text" className={'mt20'} value={this.state.revNoSupplier2} title="Enter Rev No" />
                        </Col>
                        <Col md="3">
                            <input type="text" className={'mt20'} value={this.state.revNoSupplier3} title="Enter Rev No" />
                        </Col>
                    </Row>
                    <hr />
                    {/* ------------------Material Cost end----------------- */}

                    {/* ------------------BOP/Job cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>B) BOP/Job Cost</Col>
                    </Row>
                    <Row>
                        <Col md="1">
                            Total BOP/Job Cost
                        </Col>
                        <Col md="2">
                            <input type="text" disabled value={this.state.totalBOPCostZBC} className={'mt20'} title="Total BOP/Job Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalBOPCostSupplier1} className={'mt20'} title="Total BOP/Job Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalBOPCostSupplier2} className={'mt20'} title="Total BOP/Job Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalBOPCostSupplier3} className={'mt20'} title="Total BOP/Job Cost" />
                        </Col>
                    </Row>
                    <hr />
                    {/* ----------------BOP/Job cost end------------------- */}


                    {/* ------------------Conversion Cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>C) Conversion Cost</Col>
                    </Row>
                    <Row>
                        <Col md="1">
                            Process Cost
                        </Col>
                        <Col md="2">
                            <input type="text" disabled value={this.state.processCostZBC} className={'mt20'} title="Process Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.processCostSupplier1} className={'mt20 supplier-input'} title="Process Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.processCostSupplier2} className={'mt20 supplier-input'} title="Process Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.processCostSupplier3} className={'mt20 supplier-input'} title="Process Cost" />
                        </Col>

                        <Col md="1">
                            Other Operation Cost
                        </Col>
                        <Col md="2">
                            <input type="text" disabled value={this.state.otherOpsCostZBC} className={'mt20 zbc-input'} title="Other Operation Cost" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.otherOpsCostSupplier1} className={'mt20'} title="Other Operation Cost" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.otherOpsCostSupplier2} className={'mt20'} title="Other Operation Cost" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.otherOpsCostSupplier3} className={'mt20'} title="Other Operation Cost" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>

                        <Col md="1">
                            Surface Treatment
                        </Col>
                        <Col md="2">
                            <input type="text" value={this.state.surfaceTreatmentZBC} className={'mt20 zbc-input'} title="Surface Treatment" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" value={this.state.surfaceTreatmentSupplier1} className={'mt20'} title="Surface Treatment" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" value={this.state.surfaceTreatmentSupplier2} className={'mt20'} title="Surface Treatment" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>
                        <Col md="3">
                            <input type="text" value={this.state.surfaceTreatmentSupplier3} className={'mt20'} title="Surface Treatment" />
                            <button className={'btn btn-primary'}>Show</button>
                        </Col>

                        <Col md="1">
                            Total Conversion Cost
                        </Col>
                        <Col md="2">
                            <input type="text" disabled value={this.state.totalConvCostZBC} className={'mt20 zbc-input'} title="Total Conversion Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalConvCostSupplier1} className={'mt20 supplier-input'} title="Total Conversion Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalConvCostSupplier2} className={'mt20 supplier-input'} title="Total Conversion Cost" />
                        </Col>
                        <Col md="3">
                            <input type="text" disabled value={this.state.totalConvCostSupplier3} className={'mt20 supplier-input'} title="Total Conversion Cost" />
                        </Col>

                    </Row>
                    <hr />
                    {/* ----------------Conversion Cost end------------------- */}

                    {/* ------------------Other Cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>D) Other Cost</Col>
                    </Row>
                    <Row>
                        <Col md="1">
                            {''}
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>Base</div>
                            <div className={'base-cost'}>Cost</div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>Base</div>
                            <div className={'base-cost'}>Cost</div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>Base</div>
                            <div className={'base-cost'}>Cost</div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>Base</div>
                            <div className={'base-cost'}>Cost</div>
                        </Col>

                        {/* ----------------ModelType-Overhead/Profit------------------- */}
                        <Col md="1">
                            ModelType-Overhead/Profit
                        </Col>
                        <Col md="2">
                            <Field
                                label={``}
                                name={"overhead-profit-zbc"}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={this.modelTypeHandlerZBC}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={"overhead-profit-supplier1"}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={this.modelTypeHandlerSupplier1}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={"overhead-profit-supplier2"}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={this.modelTypeHandlerSupplier2}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={"overhead-profit-supplier3"}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={this.modelTypeHandlerSupplier3}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        {/* ----------------ModelType-Overhead/Profit------------------- */}

                        {/* ----------------Overhead Percent start------------------- */}
                        <Col md="1">
                            {'Overhead % on'}
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadPercentZBC} className={'mt20 overhead-percent-zbc'} title="OverHead Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadCostZBC} className={'mt20 overhead-percent-zbc'} title="OverHead Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadPercentSupplier1} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadCostSupplier1} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadPercentSupplier2} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadCostSupplier2} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadPercentSupplier3} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.overheadCostSupplier3} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Overhead Percent ended------------------- */}

                        {/* ----------------Rejection (% on Matl + Conv.) start------------------- */}
                        <Col md="1">
                            Rejection (% on Matl + Conv.)
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={this.rejectionHandlerZBC}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionBasePercentZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.rejectionCostZBC} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={this.rejectionHandlerSupplier1}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionBasePercentSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.rejectionCostSupplier1} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={this.rejectionHandlerSupplier2}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionBasePercentSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.rejectionCostSupplier2} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={this.rejectionHandlerSupplier3}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionBasePercentSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.rejectionCostSupplier3} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}

                        {/* ----------------RM inventorycost (% on No of days) start------------------- */}
                        <Col md="1">
                            RM inventorycost (% on No of days)
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Days`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryDaysBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                                <button>Ref ICC</button>
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.rmInventoryCostZBC} className={'mt20 overhead-percent-supplier'} title="(((WIP Inventorycost / 100) * TotalBOP) + NetRM + Tcc) * WIP Inventory Days) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%) on RM+CC`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier1}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                <button>Ref ICC</button>
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCCostSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rmInventoryICCSupplier2"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier2}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                <button>Refresh ICC</button>
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rmInventoryCostSupplier2"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCCostSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier3}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                <button>Refresh ICC</button>
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCCostSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}


                        {/* ----------------WIP inventory cost start------------------- */}
                        <Col md="1">
                            WIP inventory cost (% on No of days)
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Days`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryDaysBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.wipInventoryCostZBC} className={'mt20 overhead-percent-supplier'} title="(((WIP Inventorycost / 100) * TotalBOP) + NetRM + Tcc) * WIP Inventory Days) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%) on RM+CC`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCBaseSupplier1}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCCostSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCBaseSupplier2}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCCostSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCBaseSupplier3}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.wipInventoryICCCostSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------WIP inventory cost end------------------- */}

                        {/* ----------------Payment terms Credit start------------------- */}
                        <Col md="1">
                            Payment terms Credit (No of days)
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Days`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentDaysBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCBaseZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.paymentCostZBC} className={'mt20 overhead-percent-supplier'} title="((((WIP Inventory Cost) / 100) * (((((RM Inventory Cost) + (WIP Inventory Cost) + (Rejection Cost) + (Overhead Cost) + (Other Cost If Any) + (Packaging Cost) + (Freight Cost) +(Profit Cost))) + (Total BOP) + (Net Casting Cost ) + (Total Conversion Cost ))) * (Payment terms Credit )) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%) on RM+CC`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCBaseSupplier1}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCCostSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title={'(RM + CC) * ICC(%) / 100'}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCBaseSupplier2}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCCostSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`ICC(%)`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCBaseSupplier3}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={"rejection-zbc"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.paymentICCCostSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Payment terms Credit end------------------- */}

                        {/* ----------------Profit start------------------- */}
                        <Col md="1">
                            {'Profit (% on'}
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitBaseZBC} className={'mt20 overhead-percent-zbc'} title="Profit Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitCostZBC} className={'mt20 overhead-percent-zbc'} title="Profit Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Profit Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitCostSupplier1} className={'mt20 overhead-percent-supplier'} title="Profit Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Profit Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitCostSupplier2} className={'mt20 overhead-percent-supplier'} title="Profit Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Profit Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.profitCostSupplier3} className={'mt20 overhead-percent-supplier'} title="Profit Cost" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Profit ended------------------- */}


                        {/* ----------------Freight start------------------- */}
                        <Col md="1">
                            Freight
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={"freight-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('part')}
                                    onChange={this.partHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <input type="text" value={this.state.freightBaseZBC} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.freightCostZBC} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={"freight-supplier1"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('part')}
                                    onChange={this.partHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <input type="text" value={this.state.freightBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.freightCostSupplier1} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={"freight-supplier2"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('part')}
                                    onChange={this.partHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <input type="text" value={this.state.freightBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.freightCostSupplier2} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={"freight-supplier3"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('part')}
                                    onChange={this.partHandler}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <input type="text" value={this.state.freightBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.freightCostSupplier3} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}

                        {/* ----------------Additional Freight start------------------- */}
                        <Col md="1">
                            Additional Freight
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.additionalFreightBaseZBC} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                                <button>Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.additionalFreightBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                                <button>Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.additionalFreightBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                                <button>Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.additionalFreightBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" />
                                <button>Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <hr />
                        {/* ----------------Additional Freight end------------------- */}

                    </Row>
                    <hr />
                    {/* ------------------Other Cost end---------------- */}


                    {/* ------------------CED cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>E) CED / Plating Other Operation costs</Col>
                    </Row>
                    <Row>
                        {/* --------------CED Cost ----------------- */}
                        <Col md="1">
                            CED Cost
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseZBC} className={'mt10 overhead-percent-supplier'} title="" />

                                <button title="Select CED Other Operation">CED Add</button>

                                <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseZBC} className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetZBC} className={'mt10 overhead-percent-supplier'} title="" />

                                <button title="Toggle Disabled">Toggle</button>

                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostZBC} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Select CED Other Operation">CED Add</button>

                                <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Toggle Disabled">Toggle</button>

                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Select CED Other Operation">CED Add</button>

                                <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Toggle Disabled">Toggle</button>

                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Select CED Other Operation">CED Add</button>

                                <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" />

                                <button title="Toggle Disabled">Toggle</button>

                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" />
                            </div>
                        </Col>
                        <hr />
                        {/* ------------------CED Cost end---------------- */}

                        {/* ------------------Transportation Cost start---------------- */}
                        <Col md="1">
                            Transportation Cost
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseZBC} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" />

                                <label>Net FinishWt</label>
                                <input type="text" disabled value={this.state.TransCostFinishWtBaseZBC} className={'mt10 overhead-percent-supplier'} title="Net Finish Wt/Component" />
                                <button title="Toggle Disable">Toggle</button>
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostZBC} className={'mt10 overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" />

                                <label>Net FinishWt</label>
                                <input type="text" disabled value={this.state.TransCostFinishWtBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Net Finish Wt/Component" />
                                <button title="Toggle Disable">Toggle</button>
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostSupplier1} className={'mt10 overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" />

                                <label>Net FinishWt</label>
                                <input type="text" disabled value={this.state.TransCostFinishWtBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Net Finish Wt/Component" />
                                <button title="Toggle Disable">Toggle</button>
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostSupplier2} className={'mt10 overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" />

                                <label>Net FinishWt</label>
                                <input type="text" disabled value={this.state.TransCostFinishWtBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Net Finish Wt/Component" />
                                <button title="Toggle Disable">Toggle</button>
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostSupplier3} className={'mt10 overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------Transportation Cost end ----------------- */}


                        {/* ------------------CED Overhead/Profit Cost start---------------- */}
                        <Col md="1">
                            CED Overhead/Profit Cost
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseZBC} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostZBC} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------CED Overhead/Profit Cost end ----------------- */}


                        {/* ------------------CED Remarks start---------------- */}
                        <Col md="1">
                            Remarks
                        </Col>
                        <Col md="2">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedCostRemarksZBC} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedCostRemarksSupplier1} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedCostRemarksSupplier2} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedCostRemarksSupplier3} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        {/* ----------CED Remarks end ----------------- */}


                    </Row>
                    <Row className={'dark-divider'} >
                        <Col md="1">
                            CED Total Cost
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.cedTotalZBC} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.cedTotalSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.cedTotalSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.cedTotalSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="1">
                            Packaging Cost
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.packagingCostZBC} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.packagingCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.packagingCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.packagingCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>

                        {/* ------------------CED Total Remarks start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Remarks
                        </Col>
                        <Col md="2">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedTotalRemarksZBC} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedTotalRemarksSupplier1} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedTotalRemarksSupplier2} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedTotalRemarksSupplier3} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        {/* ----------CED Total Remarks end ----------------- */}

                        {/* ------------------Other Cost start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Other cost if Any
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.otherCostZBC} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.otherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.otherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.otherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                        {/* ------------------Other Cost start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Total Other Costs
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.totalOtherCostZBC} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.totalOtherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.totalOtherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.totalOtherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                    </Row>
                    <hr />
                    {/* ----------------CED / Plating Other Operation end------------------- */}


                    {/* ----------------Tool costs start------------------- */}
                    <Row className={'divider'}>
                        <Col>F) Tool costs</Col>
                    </Row>
                    <Row>
                        {/* ------------------Other Cost start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Tool Cost
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.toolCostZBC} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.toolCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.toolCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.toolCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                        {/* ------------------Tool Maintenance Cost start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Tool Maintenance Cost
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceZBC} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" />
                            </div>
                        </Col>
                        {/* ----------Tool Maintenance Cost end ----------------- */}

                        {/* ------------------Tool Amortization Cost start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Tool Amortization Cost
                        </Col>
                        <Col md="2">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceZBC} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <input type="text" value={this.state.toolMaintenanceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        {/* ----------Tool Amortization Cost Cost end ----------------- */}

                        {/* ------------------Total Cost start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Total Cost
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" value={this.state.totalCostZBC} className={'mt10 overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" value={this.state.totalCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" value={this.state.totalCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" value={this.state.totalCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        {/* ----------Total Cost end ----------------- */}

                        {/* ------------------Hundi/ Other Discount start---------------- */}
                        <Col md="1">
                            Hundi/ Other Discount
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.hundiBaseZBC} className={'mt10 overhead-percent-supplier'} title="Enter Hundi/Other Discount in Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.hundiCostZBC} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Hundi or Other Discount)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.hundiBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.hundiCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.hundiBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.hundiCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.hundiBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.hundiCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------Hundi/ Other Discount end ----------------- */}

                        {/* ------------------Other Base/Cost start---------------- */}
                        <Col md="1">
                            Other Base/Cost
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherBaseZBC} className={'mt10 overhead-percent-supplier'} title="Other Base" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherCostZBC} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Other Base" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Other Base" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Other Base" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.otherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" />
                            </div>
                        </Col>
                        <hr />
                        {/* ----------Other Base/Cost end ----------------- */}

                        {/* ------------------Total cost Remarks start---------------- */}
                        <Col md="1" className={'mt20'}>
                            Remarks
                        </Col>
                        <Col md="2">
                            <div className={'remarks'}>
                                <textarea value={this.state.totalCostRemarksZBC} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.totalCostRemarksSupplier1} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.totalCostRemarksSupplier2} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.totalCostRemarksSupplier3} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        {/* ----------Total cost Remarks end ----------------- */}


                        {/* ------------------Net PO Price start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Net PO Price
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.netPOPriceZBC} className={'mt10 overhead-percent-supplier'} title="Total Cost - Hundi Cost" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.netPOPriceSupplier1} className={'mt10 overhead-percent-supplier'} title="Total Cost - Hundi Cost" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.netPOPriceSupplier2} className={'mt10 overhead-percent-supplier'} title="Total Cost - Hundi Cost" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <input type="text" disabled value={this.state.netPOPriceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        {/* ----------Net PO Price end ----------------- */}

                        {/* ------------------Landed Factor(%) start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Landed Factor(%)
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.landedFactorBaseZBC} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.landedFactorCostZBC} className={'mt10 overhead-percent-supplier not-allowed'} title="Landed Factor Percent" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.landedFactorBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.landedFactorCostSupplier1} className={'mt10 overhead-percent-supplier not-allowed'} title="Landed Factor Percent" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.landedFactorBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.landedFactorCostSupplier2} className={'mt10 overhead-percent-supplier not-allowed'} title="Landed Factor Percent" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <input type="text" value={this.state.landedFactorBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <input type="text" disabled value={this.state.landedFactorCostSupplier3} className={'mt10 overhead-percent-supplier not-allowed'} title="Landed Factor Percent" />
                            </div>
                        </Col>
                        {/* <hr /> */}
                        {/* ----------Landed Factor(%) end ----------------- */}

                        {/* ------------------Attachment start---------------- */}
                        {/* <Col md="1" className={'divider'}>
                            Attachment
                        </Col>
                        <Col md="2" className={'divider'}>
                            <div className={'full-width'}>
                                <input type="file" className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                        </Col>
                        <Col md="3" className={'divider'}>
                            <div className={'full-width'}>
                                <input type="file" className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                        </Col>
                        <Col md="3" className={'divider'}>
                            <div className={'full-width'}>
                                <input type="file" className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                        </Col>
                        <Col md="3" className={'divider'}>
                            <div className={'full-width'}>
                                <input type="file" className={'mt10 overhead-percent-supplier'} title="" />
                            </div>
                        </Col> */}
                        {/* ----------Attachment end ----------------- */}

                    </Row>
                    <hr />
                    {/* ----------------Tool costs end------------------- */}

                    <Row>
                        <Col md="3" className={'divider'}>
                            <div>ZBC</div>
                            {ZBCSupplier && <a href="javascript:void(0)" >{`${ZBCSupplier.SupplierName}`}</a>}
                        </Col>
                        <Col md="3" className={'divider'}>
                            {!this.state.addSupplier1 && this.state.supplierOneName == '' && <div>Supplier1</div>}
                            {this.state.supplierOneName != '' && <a href="javascript:void(0)" >{`${this.state.supplierOneName}`}</a>}

                        </Col>
                        <Col md="3" className={'divider'}>
                            {!this.state.addSupplier2 && this.state.supplierTwoName == '' && <div>Supplier2</div>}
                            {this.state.supplierTwoName != '' && <a href="javascript:void(0)"  >{`${this.state.supplierTwoName}`}</a>}

                        </Col>
                        <Col md="3" className={'divider'}>
                            {!this.state.addSupplier3 && this.state.supplierTwoName == '' && <div>Supplier3</div>}
                            {this.state.supplierThreeName != '' && <a href="javascript:void(0)" >{`${this.state.supplierThreeName}`}</a>}
                        </Col>
                    </Row>
                    <hr />

                    <Row>
                        <Col md="3" >
                            <button className={'btn btn-primary mr5'}>Save</button>
                            <button className={'btn btn-primary'}>Send For Approval</button>
                            <button className={'btn btn-warning'}>Copy Costing</button>
                        </Col>
                        <Col md="3" >
                            <button className={'btn btn-primary mr5'}>Save</button>
                            <button className={'btn btn-primary'}>Send For Approval</button>
                            <button className={'btn btn-warning'}>Copy Costing</button>
                        </Col>
                        <Col md="3" >
                            <button className={'btn btn-primary mr5'}>Save</button>
                            <button className={'btn btn-primary'}>Send For Approval</button>
                            <button className={'btn btn-warning'}>Copy Costing</button>
                        </Col>
                        <Col md="3" >
                            <button className={'btn btn-primary mr5'}>Save</button>
                            <button className={'btn btn-primary'}>Send For Approval</button>
                            <button className={'btn btn-warning'}>Copy Costing</button>
                        </Col>
                    </Row>
                    <hr />

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
    const { plantList, technologyList, modelTypes, costingHead } = comman;
    if (costing && costing.plantComboDetail) {
        const { existingSupplierDetail, supplier2CostingData } = costing;
        const { Plants, Parts, Suppliers, ZBCSupplier } = costing.plantComboDetail;

        return {
            technologyList,
            plantList,
            Plants,
            Parts,
            Suppliers,
            ZBCSupplier,
            existingSupplierDetail,
            supplier2CostingData,
            modelTypes,
            costingHead,
        }
    }
}

export default connect(mapStateToProps, {
    fetchMaterialComboAPI,
    fetchCostingHeadsAPI,
    fetchModelTypeAPI,
    getPlantCombo,
    getExistingSupplierDetailByPartId,
    createPartWithSupplier,
    checkPartWithTechnology,
    getCostingByCostingId,
})(reduxForm({
    form: 'CostSummary',
    enableReinitialize: true,
})(CostSummary));

