import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderCheckboxInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { createPartAPI, updatePartsAPI, getOnePartsAPI, getAllPartsAPI } from '../../../../actions/master/Part';
import { fetchBOMComboAPI, fetchPlantDataAPI, fetchPartComboAPI } from '../../../../actions/master/Comman';
import {
    getAllBOMAPI, createBOMAPI, checkCostingExistForPart, deleteExisCostingByPartID,
    getBOMDetailAPI, createNewBOMAPI
} from '../../../../actions/master/BillOfMaterial';
import { getAllRawMaterialList } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class PartBOMRegister extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            IsPartAssociatedWithBOM: false,
            selectedBOMs: [],
            selectedParts: [],
            selectedChildParts: [],
            assyPartNo: [],
            ChildPart: [],
            isBOMDisabled: false,
            materialType: [],
            newPartRMType: [],
            selectedUOM: [],
            plantID: '',
            newPartPlantID: '',
            isPartShow: '',
            IsChildPart: false,
            isNewPartBtnShow: false,
            selectedPlant: [],
            selectedChildUOM: [],
            selectedChildPlant: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before rendering the component
    */
    componentWillMount() {
        this.props.fetchPartComboAPI(res => { });
        this.props.getAllBOMAPI(res => { });
        this.props.fetchBOMComboAPI(res => { });
        this.props.fetchPlantDataAPI(() => { });
        this.props.getAllRawMaterialList(() => { });
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { partId, isEditFlag } = this.props;
        console.log('isEditFlag', isEditFlag);
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getOnePartsAPI(partId, true, res => {
                    const { partData } = this.props;
                    this.setState({ IsPartAssociatedWithBOM: partData.IsPartAssociatedWithBOM })
                })
            })
        } else {
            this.props.getOnePartsAPI('', false, res => { })
        }
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
     * @method handleBOMSelection
     * @description Used for BOM numbers selection
     */
    handleBOMSelection = e => {
        this.setState({
            selectedBOMs: e
        });
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

    /**
    * @method handlePartSelection
    * @description called
    */
    handlePartSelection = e => {
        this.setState({
            selectedParts: e
        });
    };

    renderAssyPartList = (label) => {
        const { partList } = this.props;
        const { assyPartNo } = this.state;
        let temp = [];

        if (label === 'AssyPart') {
            partList && partList.length > 0 && partList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'ChildPart') {
            partList && partList.length > 0 && partList.map(item => {
                if (item.Value == 0) return false;
                if (assyPartNo && assyPartNo.value == item.Value) {
                    return false;
                }
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, plantList, materialTypeList, rowMaterialDetail, BOMListing } = this.props;
        const temp = [];
        if (label === 'material') {
            rowMaterialDetail && rowMaterialDetail.map(item =>
                temp.push({ label: item.RawMaterialName, value: item.RawMaterialId })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'searchableUOM') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'searchablePlant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'BOM') {
            BOMListing && BOMListing.map(item =>
                temp.push({ Text: item.BillNumber, Value: item.BillOfMaterialId })
            );
            return temp;
        }
    }

    onPressAssociatedWithBOM = () => {
        this.setState({ IsPartAssociatedWithBOM: !this.state.IsPartAssociatedWithBOM });
    }


    onPressAddChildPart = () => {
        const { assyPartNo } = this.state;
        this.emptyPartFields()
        // if (assyPartNo && assyPartNo.length == 0) {
        //     toastr.warning('Please select assembly part.')
        //     this.setState({ IsChildPart: false })
        // } else {
        this.setState({
            IsChildPart: !this.state.IsChildPart,
            isNewPartBtnShow: !this.state.isNewPartBtnShow,
            isPartShow: !this.state.isPartShow,
        }, () => {
            //         this.checkCostingExistForPart(assyPartNo.value)
            //         this.setState({ ChildPart: {} })
        })
        // }
    }

    /**
    * @method checkCostingExistForPart
    * @description Used to check costing exist for selected part.
    */
    checkCostingExistForPart = (PartId) => {
        this.props.checkCostingExistForPart(PartId, (Message) => {
            if (Message != '') {
                //toastr.warning(Message)
                this.deleteExistCosting(Message, PartId);
            }
        })
    }

    /**
    * @method deleteExistCosting
    * @description Use to delete exist costing
    */
    deleteExistCosting = (Message, PartId) => {
        const { reset } = this.props;
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteCosting(PartId)
            },
            onCancel: () => {
                this.setState({ assyPartNo: [], IsChildPart: false, isPartShow: false, isNewPartBtnShow: false })
                this.props.getBOMDetailAPI(false, '', () => {
                    this.setState({
                        materialType: [],
                        selectedUOM: [],
                    })
                })
                //this.resetBOMForm()
            }
        };
        return toastr.confirm(`${Message}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteCosting
    * @description confirm delete costing for the part
    */
    confirmDeleteCosting = (PartId) => {
        this.props.deleteExisCostingByPartID(PartId, (res) => {
            if (res.data.Result) {
                toastr.success("Costing has been deleted for selected part.");
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    resetBOMForm = () => {
        this.props.change("BillNumber", '')
        this.props.change("MaterialDescription", '')
        this.props.change("Quantity", '')
        this.props.change("AssemblyPartNumberMark", '')
        this.props.change("BOMLevel", '')
        this.props.change("EcoNumber", '')
        this.props.change("RevisionNumber", '')
        this.props.change("RawMaterialId", '')
        this.props.change("UnitOfMeasurementId", '')
        this.props.change("PlantId", '')
    }

    /**
    * @method assyPartNoHandler
    * @description Used to handle 
    */
    assyPartNoHandler = (newValue, actionMeta) => {
        if (newValue != null) {
            this.setState({ assyPartNo: newValue }, () => {
                const { assyPartNo, IsChildPart } = this.state;
                this.checkIsPartIdSame()
                if (IsChildPart == false) {
                    this.props.getBOMDetailAPI(true, assyPartNo.value, (res) => {
                        const { uniOfMeasurementList, rowMaterialDetail, unitBOMDetail } = this.props;
                        if (unitBOMDetail && unitBOMDetail != undefined) {

                            const tempMaterialObj = rowMaterialDetail.find(item => item.RawMaterialId == unitBOMDetail.RawMaterialId)
                            const tempUOMObj = uniOfMeasurementList.find(item => item.Value == unitBOMDetail.UnitOfMeasurementId)

                            this.setState({
                                materialType: { label: tempMaterialObj.RawMaterialName, value: tempMaterialObj.RawMaterialId },
                                selectedUOM: { label: tempUOMObj.Text, value: tempUOMObj.Value },
                            })

                        }
                    })
                }
            });
        } else {
            this.setState({ assyPartNo: [], IsChildPart: false, isNewPartBtnShow: false }, () => {
                this.checkIsPartIdSame()
            });
        }
    };

    checkIsPartIdSame = () => {
        const { assyPartNo, ChildPart } = this.state;
        if (assyPartNo && ChildPart) {
            this.props.change("AssemblyPartNumberMark", assyPartNo.label)
            if (assyPartNo.value == ChildPart.value) {
                this.props.change("BOMLevel", 0)
                this.setState({ isBOMDisabled: true })
            } else {
                this.props.change("BOMLevel", '')
                this.setState({ isBOMDisabled: false })
            }
        } else {
            this.props.change("BOMLevel", '')
            this.props.change("AssemblyPartNumberMark", '')
            this.setState({ isBOMDisabled: false })
        }
    }

    /**
    * @method ChildPartHandler
    * @description Used to handle 
    */
    ChildPartHandler = (newValue, actionMeta) => {
        this.setState({ ChildPart: newValue }, () => {
            const { ChildPart } = this.state;
            if (ChildPart && ChildPart.value != '') {
                this.setState({
                    isNewPartBtnShow: false,
                    isPartShow: true,
                })

                this.props.getOnePartsAPI(ChildPart.value, true, res => {
                    const { partData, uniOfMeasurementList, rowMaterialDetail, unitBOMDetail } = this.props;
                    if (partData && partData != undefined) {
                        this.props.change("NewChildPart_PartNumber", partData.PartNumber)
                        this.props.change("NewChildPart_PartName", partData.PartNumber)
                        this.props.change("NewChildPart_MaterialGroupCode", partData.MaterialGroupCode)
                        this.props.change("NewChildPart_PartDescription", partData.PartDescription)
                        this.props.change("NewChildPart_PlantId", partData.PlantId)
                        this.props.change("NewChildPart_UnitOfMeasurementId", partData.UnitOfMeasurementId)

                        const tempMaterialObj = rowMaterialDetail.find(item => item.RawMaterialId == partData.RawMaterialId)

                        this.setState({
                            newPartRMType: { label: tempMaterialObj.RawMaterialName, value: tempMaterialObj.RawMaterialId },
                        })
                    }
                })
            } else {
                this.props.change("NewChildPart_PartNumber", "")
                this.props.change("NewChildPart_PartName", "")
                this.setState({
                    isNewPartBtnShow: true,
                    //isPartShow: false,
                })
            }
            this.checkIsPartIdSame()
        });
    };

    /**
   * @method emptyPartFields
   * @description used for empty Part fields
   */
    emptyPartFields = () => {
        this.props.change("NewChildPart_PartNumber", '')
        this.props.change("NewChildPart_PartName", '')
        this.props.change("NewChildPart_MaterialGroupCode", '')
        this.props.change("NewChildPart_PartDescription", '')
        this.props.change("NewChildPart_PlantId", '')
        this.props.change("NewChildPart_UnitOfMeasurementId", '')
        this.props.change("NewChildPart_Quantity", '')
        this.props.change("NewChildPart_EcoNumber", '')
        this.props.change("NewChildPart_RevisionNumber", '')

        this.setState({
            newPartRMType: [],
        })
    }

    /**
   * @method handlePlantSelection
   * @description used for multi select child part
   */
    // ChildPartHandler = e => {
    //     this.setState({ ChildPart: e }, () => {
    //         this.checkIsPartIdSame()
    //     });
    // };



    /**
    * @method materialTypeHandler
    * @description Used to handle 
    */
    materialTypeHandler = (newValue, actionMeta) => {
        this.setState({ materialType: newValue });
    };

    /**
    * @method newPartRMTypeHandler
    * @description Used to handle 
    */
    newPartRMTypeHandler = (newValue, actionMeta) => {
        this.setState({ newPartRMType: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to handle 
    */
    uomHandler = (newValue, actionMeta) => {
        this.setState({ selectedUOM: newValue });
    };

    /**
    * @method uomChildHandler
    * @description Used to handle child UOM
    */
    uomChildHandler = (newValue, actionMeta) => {
        this.setState({ selectedChildUOM: newValue });
    };

    /**
    * @method plantHandler
    * @description Used to Submit the form
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ selectedPlant: newValue })
    }

    /**
    * @method childPlantHandler
    * @description Used to Submit the form
    */
    childPlantHandler = (newValue, actionMeta) => {
        this.setState({ selectedChildPlant: newValue })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log("values from BOM", values)
        const { selectedParts, IsChildPart, materialType, newPartRMType, selectedUOM, assyPartNo, ChildPart, plantID, newPartPlantID,
            isNewPartBtnShow } = this.state;
        let loginUserId = loggedInUserId();
        let plantArray = [];
        selectedParts && selectedParts.map((item, i) => {
            return plantArray.push({ PartId: item.Value });
        });
        /** Add new detail of the BOM  */
        // const bomData = {
        //     MaterialTypeName: materialType.label,
        //     UnitOfMeasurementName: selectedUOM.label,
        //     AssemblyBOMId: assyPartNo.value,
        //     BillNumber: values.BillNumber,
        //     MaterialDescription: values.MaterialDescription,
        //     Quantity: values.Quantity,
        //     AssemblyPartNumberMark: assyPartNo.label,
        //     BOMLevel: values.BOMLevel,
        //     EcoNumber: values.EcoNumber,
        //     RevisionNumber: values.RevisionNumber,
        //     MaterialTypeId: materialType.value,
        //     UnitOfMeasurementId: selectedUOM.value,
        //     AssemblyBOMPartId: assyPartNo.value,
        //     AssemblyBOMPartNumber: assyPartNo.label,
        //     PartId: assyPartNo.value,
        //     PartNumber: assyPartNo.label,
        //     PlantId: plantID,
        //     CreatedBy: "",
        //     SerialNumber: 0,
        //     PartType: materialType.label,
        //     IsActive: true
        // }

        let bomData = {
            IsAddNewChildPart: isNewPartBtnShow,
            MaterialTypeName: materialType.label,
            UnitOfMeasurementName: selectedUOM.label,
            NewChildPart: {
                Quantity: values.NewChildPart_Quantity,
                BOMLevel: values.BOMLevel,
                EcoNumber: values.NewChildPart_EcoNumber,
                RevisionNumber: values.NewChildPart_RevisionNumber,
                IsActive: true,
                CreatedBy: loginUserId,
                PartId: "",
                PartNumber: values.NewChildPart_PartNumber,
                PartDescription: values.NewChildPart_PartDescription,
                IndustrialIdentity: values.NewChildPart_PartName,
                MaterialGroupCode: values.NewChildPart_MaterialGroupCode,
                IsPartAssociatedWithBOM: true,
                IsAssembly: true,
                IsChildPart: true,
                PlantId: values.NewChildPart_PlantId,
                RawMaterialId: newPartRMType.value,
                RawMaterialIdName: newPartRMType.label,
                MaterialTypeId: "",
                UnitOfMeasurementId: values.NewChildPart_UnitOfMeasurementId,
            },
            AssemblyBOMId: assyPartNo.value,
            BillNumber: values.BillNumber,
            MaterialDescription: values.BillNumber,
            Quantity: values.Quantity,
            AssemblyPartNumberMark: assyPartNo.label,
            BOMLevel: values.BOMLevel,
            EcoNumber: values.EcoNumber,
            RevisionNumber: values.RevisionNumber,
            MaterialTypeId: "",
            RawMaterialId: materialType.value,
            UnitOfMeasurementId: selectedUOM.value,
            AssemblyBOMPartId: assyPartNo.value,
            AssemblyBOMPartNumber: assyPartNo.label,
            PartId: assyPartNo.value,
            PartNumber: assyPartNo.label,
            PlantId: values.PlantId,
            CreatedBy: loginUserId,
            SerialNumber: 0,
            PartType: materialType.label,
            IsActive: true
        }
        console.log("bomData from BOM 1111", bomData)

        if (assyPartNo.hasOwnProperty('value') && ChildPart.hasOwnProperty('value')) {
            if (assyPartNo.value == ChildPart.value) {
                bomData.PartId = assyPartNo.value;
                bomData.PartNumber = assyPartNo.label;
            } else {
                bomData.PartId = ChildPart.value;
                bomData.PartNumber = ChildPart.label;
            }
        }
        console.log("bomData from BOM 2222", bomData)
        this.props.createNewBOMAPI(bomData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_ADD_SUCCESS);
            } else {
                toastr.error(res.data.message);
            }
        });

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, partData } = this.props;
        const { isNewPartBtnShow, ChildPart } = this.state;

        return (

            <Container className="top-margin BOM_form">
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >



                    <Row>
                        <Col md={"6"}>
                            <Field
                                label={`Assy Part No.`}
                                name={"AssyPartNo"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`BOM Number`}
                                name={"BillNumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Material Description`}
                                name={"MaterialDescription"}
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
                                label={`Quantity`}
                                name={"Quantity"}
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
                                label={`Assembly Part Number`}
                                name={"AssemblyPartNumberMark"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Assembly BOM Level`}
                                name={"BOMLevel"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={this.state.isBOMDisabled}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`ECO ${CONSTANT.NUMBER}`}
                                name={"EcoNumber"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Revision Number`}
                                name={"RevisionNumber"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label="Assembly Raw Material Type"
                                name="MaterialTypeId"
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required, maxLength50]}
                                options={this.renderTypeOfListing('material')}
                                //required={true}
                                handleChangeDescription={this.materialTypeHandler}
                                valueDescription={this.state.materialType}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={'Assembly Unit Of Measurement'}
                                name={'UnitOfMeasurementId'}
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required]}
                                options={this.renderTypeOfListing('searchableUOM')}
                                //required={true}
                                handleChangeDescription={this.uomHandler}
                                valueDescription={this.state.selectedUOM}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={'Assembly Plant'}
                                name={'PlantId'}
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required]}
                                options={this.renderTypeOfListing('searchablePlant')}
                                //required={true}
                                handleChangeDescription={this.plantHandler}
                                valueDescription={this.state.selectedPlant}
                            />
                        </Col>
                    </Row>


















                    <Row className={'mt20'}>
                        <Col md="2">
                            <button
                                type="button"
                                onClick={() => this.setState({ isChildPart: !this.state.isChildPart, isNewPart: false })}
                                className={'btn btn-primary'}>Add Child Part</button>
                        </Col>
                        <Col md="2">
                            <button
                                type="button"
                                onClick={() => this.setState({ isNewPart: !this.state.isNewPart, isChildPart: false })}
                                className={'btn btn-primary'}>Add New Part</button>
                        </Col>
                    </Row>


                    {/* Below code for Add Child Part */}

                    {this.state.isChildPart &&
                        <>
                            <Row className={'mt20'}>
                                <Col>
                                    <h3><b>{'Add Child Part'}</b></h3>
                                    <hr />
                                </Col>
                            </Row>

                            <Row className="child-part">
                                <Col md="6">
                                    <Field
                                        label={'Child Part'}
                                        name={'ChildPart'}
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        component={searchableSelect}
                                        placeholder={'Select Part'}
                                        //validate={[required, maxLength50]}
                                        options={this.renderAssyPartList('ChildPart')}
                                        //required={true}
                                        handleChangeDescription={this.ChildPartHandler}
                                        valueDescription={this.state.ChildPart}
                                        disabled={false}
                                    />
                                </Col>

                                {/* <Col md="6">
                                    <Field
                                        label={`Part Number`}
                                        name={"Child_PartNumber"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder"
                                    />
                                </Col> */}
                                {/* <Col md="6">
                                    <Field
                                        label={`Part Name`}
                                        name={"Child_PartName"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col> */}
                                <Col md="6">
                                    <Field
                                        label="Raw Material Type"
                                        name="Child_MaterialTypeId"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={this.renderTypeOfListing('material')}
                                        //required={true}
                                        handleChangeDescription={this.newPartRMTypeHandler}
                                        valueDescription={this.state.newPartRMType}
                                    />
                                </Col>

                            </Row>
                            <Row className={'mt20'}>

                                <Col md="6">
                                    <Field
                                        label={'UOM'}
                                        name={'Child_UnitOfMeasurementId'}
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderTypeOfListing('searchableUOM')}
                                        placeholder={'Select UOM'}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        handleChangeDescription={this.uomChildHandler}
                                        valueDescription={this.state.selectedChildUOM}
                                    />
                                </Col>
                                <Col md="6">
                                    <Field
                                        label={'Plant'}
                                        name={'Child_PlantId'}
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderTypeOfListing('searchablePlant')}
                                        placeholder={'Select Plant'}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        handleChangeDescription={this.childPlantHandler}
                                        valueDescription={this.state.selectedChildPlant}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt20'}>
                                <Col md="6">
                                    <Field
                                        label={`BOM Level`}
                                        name={"Child_BOMLevel"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={this.state.isBOMDisabled}
                                    />
                                </Col>
                                <Col md="6">
                                    <Field
                                        label={`Quantity`}
                                        name={"Child_Quantity"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>

                            </Row>
                            <Row>
                                <Col md="6">
                                    <Field
                                        label={`ECO ${CONSTANT.NUMBER}`}
                                        name={"Child_EcoNumber"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>
                                <Col md="6">
                                    <Field
                                        label={`Revision Number`}
                                        name={"Child_RevisionNumber"}
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
                                        label={`${CONSTANT.PART} ${CONSTANT.GROUPCODE}`}
                                        name={"Child_MaterialGroupCode"}
                                        type="text"
                                        placeholder={''}
                                        component={renderText}
                                        className=" withoutBorder "
                                    />
                                </Col>
                                <Col md="6">
                                    <Field
                                        label={`Part Description`}
                                        name={"Child_PartDescription"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder "
                                    />
                                </Col>
                            </Row>
                        </>}


















                    {/* Below code for Add New Part */}

                    {this.state.isNewPart &&
                        <>
                            <Row className={'mt20'}>
                                <Col>
                                    <h3><b>{'Add New Part'}</b></h3>
                                    <hr />
                                </Col>
                            </Row>
                            <Row className="child-part">
                                <Col md="6">
                                    <Field
                                        label={`Part Number`}
                                        name={"NewPart_PartNumber"}
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
                                        label={`Part Name`}
                                        name={"NewPart_PartName"}
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
                                {/* <Col md="6">
                                    <Field
                                        label={`BOM Level`}
                                        name={"NewPart_BOMLevel"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={this.state.isBOMDisabled}
                                    />
                                </Col> */}

                                <Col md="6">
                                    <Field
                                        label="Raw Material Type"
                                        name="NewPart_MaterialTypeId"
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderTypeOfListing('material')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required, maxLength50]}
                                        //required={true}
                                        handleChangeDescription={this.newPartRMTypeHandler}
                                        valueDescription={this.state.newPartRMType}
                                    />
                                </Col>

                                <Col md="6">
                                    <Field
                                        label="UOM"
                                        name="NewPart_UnitOfMeasurementId"
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderTypeOfListing('searchableUOM')}
                                        placeholder={'Select UOM'}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required, maxLength50]}
                                        //required={true}
                                        handleChangeDescription={this.uomChildHandler}
                                        valueDescription={this.state.selectedChildUOM}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md="6">
                                    <Field
                                        label={`Quantity`}
                                        name={"NewPart_Quantity"}
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
                                        label={`ECO ${CONSTANT.NUMBER}`}
                                        name={"NewPart_EcoNumber"}
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
                                        label={`Revision Number`}
                                        name={"NewPart_RevisionNumber"}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>

                                <Col md="6">
                                    <Field
                                        label={'Plant'}
                                        name={'NewPart_PlantId'}
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderTypeOfListing('searchablePlant')}
                                        placeholder={'Select Plant'}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        handleChangeDescription={this.childPlantHandler}
                                        valueDescription={this.state.selectedChildPlant}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <Field
                                        label={`${CONSTANT.PART} ${CONSTANT.GROUPCODE}`}
                                        name={"NewPart_MaterialGroupCode"}
                                        type="text"
                                        placeholder={''}
                                        component={renderText}
                                        className=" withoutBorder "
                                    />
                                </Col>
                                <Col md="6">
                                    <Field
                                        label={`Part Description`}
                                        name={"NewPart_PartDescription"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder "
                                    />
                                </Col>
                            </Row>
                        </>}
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

        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
        */
function mapStateToProps({ part, comman, billOfMaterial, material }) {
    const { rowMaterialDetail } = material;
    const { partList, plantList } = comman;
    const { uniOfMeasurementList, partData, materialTypeList } = part;
    const { BOMListing, unitBOMDetail } = billOfMaterial;

    let initialValues = {};
    if (unitBOMDetail && unitBOMDetail !== undefined) {
        initialValues = {
            BillNumber: unitBOMDetail.BillNumber,
            MaterialDescription: unitBOMDetail.MaterialDescription,
            Quantity: unitBOMDetail.Quantity,
            AssemblyPartNumberMark: unitBOMDetail.AssemblyPartNumber,
            BOMLevel: unitBOMDetail.BOMLevel,
            EcoNumber: unitBOMDetail.EcoNumber,
            RevisionNumber: unitBOMDetail.RevisionNumber,
            RawMaterialId: unitBOMDetail.RawMaterialId,
            UnitOfMeasurementId: unitBOMDetail.UnitOfMeasurementId,
            PlantId: unitBOMDetail.PlantId,
        }
    }
    return {
        uniOfMeasurementList,
        initialValues,
        materialTypeList,
        plantList,
        partData,
        BOMListing,
        partList,
        plantList,
        rowMaterialDetail,
        unitBOMDetail,
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createPartAPI,
    updatePartsAPI,
    getOnePartsAPI,
    fetchPartComboAPI,
    getAllPartsAPI,
    getAllBOMAPI,
    createBOMAPI,
    fetchBOMComboAPI,
    fetchPlantDataAPI,
    getAllRawMaterialList,
    checkCostingExistForPart,
    deleteExisCostingByPartID,
    getBOMDetailAPI,
    createNewBOMAPI,
})(reduxForm({
    form: 'PartBOMRegister',
    enableReinitialize: true,
})(PartBOMRegister));
