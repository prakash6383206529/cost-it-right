import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody,Label,Input } from 'reactstrap';
import { required, email, minLength7, maxLength70 } from "../../../../helper/validation";
import { renderText, renderSelectField, renderEmailInputField, renderMultiSelectField} from "../../../layout/FormInputs";
import { createSupplierAPI, updateSupplierAPI,getSupplierByIdAPI } from '../../../../actions/master/Supplier';
import { fetchMasterDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddSupplier extends Component {
    constructor(props) {
        super(props);
        this.state = {
            supplierType: 'ZBC',
            cityListing: [],
            selectedPlants: [],
            plantsArray: []
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.fetchMasterDataAPI(res => {});
    }

     /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount(){
        const { supplierId,isEditFlag,supplierData } = this.props;
        let plantArray = [];
        if (supplierData && supplierData !== undefined) {
            supplierData.SelectedPlants.map((val, index) => {
                const plantObj = supplierData.SelectedPlants.find(item => item.Value === val);
                return plantArray.push(plantObj);
            });
        }
        this.setState({
            SelectedPlants: plantArray,
        });

        if(isEditFlag){
            this.setState({isEditFlag},()=>{  
            this.props.getSupplierByIdAPI(supplierId,true, res => {
                this.setState({
                    supplierType: res.data.Data.SupplierType
                });
            });   
            })
        }else{
            this.props.getSupplierByIdAPI('',false, res => {})   
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
   * @method handlePlantSelection
   * @description called
   */
    handlePlantSelection = e => {
        this.setState({
            selectedPlants: e
        });
    };
    
    /**
    * @method handleCityChange
    * @description  used to handle city selection
    */
    handleCityChange = (value) => {
        this.setState({
            cityListing: value
        });
    }

    supplierType = (e) => {
        this.setState({
            supplierType: e.target.value
        });
    }

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method renderSelectPlantList
    * @description Used to render listing of selected plants
    */
    renderSelectPlantList = () => {
        const { plantList } = this.props;
        const temp = [];
            plantList && plantList.map(item => {
                if (item.Value != 0) {
                    temp.push({ Text: item.Text, Value: item.Value })
                }
            }
        );
        return temp;
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedPlants } = this.state;
        let plantArray = [];
        selectedPlants.map((item, i) => {
            return plantArray.push({ PlantId: item.Value, PlantName: item.Text });
        });
        let formData = {
            SupplierName: values.SupplierName,
            SupplierCode: values.SupplierCode,
            SupplierEmail: values.SupplierEmail,
            Description: values.Description,
            CityId: values.CityId,
            SupplierType: this.state.supplierType,
            SelectedPlants: plantArray
        }
        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {
            const { supplierId } = this.props;
            formData = {
                SupplierName: values.SupplierName,
                SupplierCode: values.SupplierCode,
                SupplierEmail: values.SupplierEmail,
                Description: values.Description,
                CityId: values.CityId,
                SupplierType: this.state.supplierType,
                SelectedPlants: plantArray,
                SupplierId: supplierId,
                IsActive: true,
            }
            this.setState({ isSubmitted: true });
            this.props.updateSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        }else{/** Add new detail for creating supplier master **/
            this.props.createSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
                     this.toggleModel()
                } else {
                    toastr.error(res.data.Message);
                }
            });
        }
       
    }

    /**
    * @method supplierTypeHandler
    * @description Used to handle selection of supplier type
    */
    supplierTypeHandler = (value) => {
        this.setState({
            supplierType: value
        })
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Supplier detail' : 'Add Supplier Detail'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                     <Row className={'supplierRadio'}>
                                        <Col className='form-group'>
                                            <Label
                                                className={'zbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('ZBC')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'ZBC'}
                                                    checked={this.state.supplierType == 'ZBC' ? true : false}
                                                    name="SupplierType"
                                                    value="ZBC" />{' '}
                                                ZBC
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('VBC')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'VBC'}
                                                    checked={this.state.supplierType == 'VBC' ? true : false}
                                                    name="SupplierType"
                                                    value="VBC" />{' '}
                                                VBC
                                            </Label>
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}
                                                name={"SupplierName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.CODE}`}
                                                name={"SupplierCode"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.EMAIL}`}
                                                name={"SupplierEmail"}
                                                type="email"
                                                //placeholder={'email@domain.com/co.us'}
                                                validate={[required, email, minLength7, maxLength70]}
                                                component={renderEmailInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.DESCRIPTION}`}
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
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.CITY}`}
                                                name={"CityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.cityListing}
                                                required={true}
                                                options={this.selectType('city')}
                                                onChange={(Value) => this.handleCityChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Plants"
                                                name="SelectedPlants"
                                                placeholder="--Select Plant--"
                                                selection={this.state.selectedPlants}
                                                options={this.renderSelectPlantList()}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={false}
                                                className="withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Add'}
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
function mapStateToProps({ comman, supplier }) {
    const { cityList, plantList } = comman;
    const { supplierData } = supplier;
    let initialValues = {};
    if(supplierData && supplierData !== undefined){
        initialValues = {
            SupplierName: supplierData.SupplierName,
            SupplierCode: supplierData.SupplierCode,
            SupplierEmail: supplierData.SupplierEmail,
            Description: supplierData.Description,
            CityId: supplierData.CityId,
            SupplierType: supplierData.SupplierType,
        }
    }
    return { cityList, plantList, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createSupplierAPI, updateSupplierAPI, getSupplierByIdAPI,fetchMasterDataAPI
})(reduxForm({
    form: 'AddSupplier',
    enableReinitialize: true,
})(AddSupplier));
