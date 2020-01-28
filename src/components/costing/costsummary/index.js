import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Container, Col, CardTitle } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { renderText, renderSelectField, searchableSelect, renderTextAreaField, renderNumberInputField } from "../../layout/FormInputs";
import { fetchMaterialComboAPI, fetchCostingHeadsAPI, fetchModelTypeAPI } from '../../../actions/master/Comman';
import {
    getPlantCombo, getExistingSupplierDetailByPartId, createPartWithSupplier, checkPartWithTechnology,
    getCostingByCostingId, setInventoryRowData, getCostingOverHeadProByModelType, saveCosting, fetchFreightHeadsAPI,
    getCostingFreight, emptyCostingData,
} from '../../../actions/costing/costing';
import { getInterestRateAPI } from '../../../actions/master/InterestRateMaster';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import { required, number, alphaNumeric, checkForNull, getSupplierCode, trimDecimalPlace } from '../../../helper';
import OtherOperationsModal from './OtherOperationsModal';
import CEDotherOperations from './CEDotherOperations';
import AddFreightModal from './AddFreightModal';
import Approval from './Approval';
import { MESSAGES } from '../../../config/message';
import { DRAFT, REJECTED, APPROVED, PENDING, TWO_DECIMAL_PRICE } from '../../../config/constants';
const selector = formValueSelector('CostSummary');


class CostSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            plant: null,
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
            modelTypeZBC: '',
            isShowOtherOpsModal: false,
            isShowCEDotherOpsModal: false,
            supplierColumn: '',
            isShowFreightModal: false,
            supplierIdForCEDOtherOps: '',
            TotalConversionCost: 33,
            isOpenSendForApproval: false,
            sendForApprovalSupplierId: '',
            sendForApprovalCostingId: '',
            RejectionHeadType: '',
            SupplierOneCostingStatus: false,
            SupplierTwoCostingStatus: false,
            SupplierThreeCostingStatus: false,
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
        this.props.getInterestRateAPI(res => { });
        this.props.fetchFreightHeadsAPI(() => { })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.costingData && nextProps.costingData.supplierOne && (nextProps.costingData.supplierOne != this.props.costingData.supplierOne)) {
            const Content = nextProps.costingData.supplierOne.CostingDetail;
            const CostingHeads = nextProps.costingData.supplierOne.CostingDetail.CostingHeads;
            const returnContent = this.columnCalculation(Content, CostingHeads);

            if (Content.CostingStatusName == APPROVED || Content.CostingStatusName == PENDING) {
                this.setState({ SupplierOneCostingStatus: true })
            } else if (Content.CostingStatusName == DRAFT || Content.CostingStatusName == REJECTED) {
                this.setState({ SupplierOneCostingStatus: false })
            }

            this.props.change('supplier1Data', returnContent)
        }

        if (nextProps.costingData && nextProps.costingData.supplierTwo && (nextProps.costingData.supplierTwo != this.props.costingData.supplierTwo)) {
            const Content = nextProps.costingData.supplierTwo.CostingDetail;
            const CostingHeads = nextProps.costingData.supplierTwo.CostingDetail.CostingHeads;
            const returnContent = this.columnCalculation(Content, CostingHeads);

            if (Content.CostingStatusName == APPROVED || Content.CostingStatusName == PENDING) {
                this.setState({ SupplierTwoCostingStatus: true })
            } else if (Content.CostingStatusName == DRAFT || Content.CostingStatusName == REJECTED) {
                this.setState({ SupplierTwoCostingStatus: false })
            }

            this.props.change('supplier2Data', returnContent)
        }

        if (nextProps.costingData && nextProps.costingData.supplierThree && (nextProps.costingData.supplierThree != this.props.costingData.supplierThree)) {
            const Content = nextProps.costingData.supplierThree.CostingDetail;
            const CostingHeads = nextProps.costingData.supplierThree.CostingDetail.CostingHeads;
            const returnContent = this.columnCalculation(Content, CostingHeads);

            if (Content.CostingStatusName == APPROVED || Content.CostingStatusName == PENDING) {
                this.setState({ SupplierThreeCostingStatus: true })
            } else if (Content.CostingStatusName == DRAFT || Content.CostingStatusName == REJECTED) {
                this.setState({ SupplierThreeCostingStatus: false })
            }

            this.props.change('supplier3Data', returnContent)
        }
    }

    columnCalculation = (Content, CostingHeads) => {
        console.log("Content >>>", Content)
        const RMCostingHeadObj = CostingHeads.find(item => item.Value == Content.RMCostingHeadsId)
        const WIPCostingHeadObj = CostingHeads.find(item => item.Value == Content.WIPCostingHeadsId)
        const PaymentTermCostingHeadObj = CostingHeads.find(item => item.Value == Content.PaymentTermsCostingHeadsId)

        const RMICCCostValue = RMCostingHeadObj ? this.InventoryCostCalculation(RMCostingHeadObj.Text, Content, 'RMICC') : 0;
        const WIPICCCostValue = WIPCostingHeadObj ? this.InventoryCostCalculation(WIPCostingHeadObj.Text, Content, 'WIPICC') : 0;
        const PaymentTermICCCostValue = PaymentTermCostingHeadObj ? this.InventoryCostCalculation(PaymentTermCostingHeadObj.Text, Content, 'PaymentTermICC') : 0;

        Content.TotalConversionCost = checkForNull(Content.NetProcessCost) + checkForNull(Content.NetOtherOperationCost) + checkForNull(Content.NetSurfaceCost);
        Content.RMInventotyCost = checkForNull(RMICCCostValue);
        Content.WIPInventotyCost = checkForNull(WIPICCCostValue);
        Content.PaymentTermsCost = checkForNull(PaymentTermICCCostValue);
        Content.NetSurfaceArea = 4.8; // CED net surface area
        Content.NetSurfaceAreaCost = checkForNull(Content.Quantity) * checkForNull(Content.CEDOperationRate) * checkForNull(Content.NetSurfaceArea); // CED cost 
        Content.OverheadProfitCost = (checkForNull(Content.OverheadProfitPercentage) * checkForNull(Content.NetSurfaceAreaCost)) / 100    //  (CED cost * overheat % ) / 100 
        Content.CEDtotalCost = checkForNull(Content.NetSurfaceAreaCost) + checkForNull(Content.OverheadProfitCost) + checkForNull(Content.TransportationOperationCost);

        // Total Other Costs
        Content.TotalOtherCosts = checkForNull(Content.OverheadCost) + checkForNull(Content.ProfitCost) + checkForNull(Content.RejectionCost)
            + checkForNull(Content.RMInventotyCost) + checkForNull(Content.WIPInventotyCost) + checkForNull(Content.PaymentTermsCost)
            + checkForNull(Content.ProfitCost) + checkForNull(Content.NetFreightCost);

        Content.ToolMaintenanceCost = checkForNull(Content.ToolMaintenanceCost);
        Content.ToolAmortizationCost = checkForNull(Content.ToolAmortizationCost);
        Content.PackagingCost = checkForNull(Content.PackagingCost);
        Content.OtherAnyCostAndCharges = checkForNull(Content.OtherAnyCostAndCharges);
        Content.Discount = checkForNull(Content.Discount);

        //Tool Cost
        Content.ToolCost = checkForNull(Content.ToolMaintenanceCost) + checkForNull(Content.ToolAmortizationCost);

        //Total Cost
        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);

        const HundiDiscount = ((Content.TotalCost * checkForNull(Content.Discount)) / 100);
        Content.DiscountCost = HundiDiscount != NaN ? HundiDiscount : 0;

        //Net PO price
        const NetPOPrice = Content.TotalCost - Content.DiscountCost;
        Content.NetPurchaseOrderPrice = NetPOPrice != NaN ? NetPOPrice : 0;

        return Content;
    }

    /**
    * @method InventoryCostCalculation
    * @description Used for Inventory Cost Calculation
    */
    checkForDecimalAndNull = () => {

    }

    /**
    * @method InventoryCostCalculation
    * @description Used for Inventory Cost Calculation
    */
    InventoryCostCalculation = (HeadType, Content, InventoryHead) => {

        let inventoryPercentage = 0;
        if (InventoryHead == 'RMICC') {
            inventoryPercentage = Content.RMICCPercentage
        } else if (InventoryHead == 'WIPICC') {
            inventoryPercentage = Content.WIPICCPercentage
        } else if (InventoryHead == 'PaymentTermICC') {
            inventoryPercentage = Content.PaymentTermsICCPercentage
        }

        let total = 0;
        const TotalConversionCost = Content.NetProcessCost + Content.NetOtherOperationCost + Content.NetSurfaceCost;

        if (HeadType == "BOP + CC") {
            total = (Content.NetBoughtOutParCost + TotalConversionCost) * inventoryPercentage / 100;
        } else if (HeadType == "CC") {
            total = TotalConversionCost * inventoryPercentage / 100;
        } else if (HeadType == "CC + Net Machining") {
            total = (TotalConversionCost + 0) * inventoryPercentage / 100;
        } else if (HeadType == "Fixed") {
            total = 0;
        } else if (HeadType == "Net Machining") {
            total = 0;
        } else if (HeadType == "Other Operation") {
            total = Content.NetOtherOperationCost * inventoryPercentage / 100;
        } else if (HeadType == "RM") {
            total = Content.NetRawMaterialCost * inventoryPercentage / 100;
        } else if (HeadType == "RM + (CC/2)") {
            total = (Content.NetRawMaterialCost + (TotalConversionCost / 2)) * inventoryPercentage / 100;
        } else if (HeadType == "RM + BOP") {
            total = (Content.NetRawMaterialCost + Content.NetBoughtOutParCost) * inventoryPercentage / 100;
        } else if (HeadType == "RM + Casting Process Cost") {
            total = (Content.NetRawMaterialCost + Content.NetProcessCost) * inventoryPercentage / 100;
        } else if (HeadType == "RM + CC") {
            total = (Content.NetRawMaterialCost + TotalConversionCost) * inventoryPercentage / 100;
        } else if (HeadType == "RM + CC + BOP") {
            total = (Content.NetRawMaterialCost + TotalConversionCost + Content.NetBoughtOutParCost) * inventoryPercentage / 100;
        } else if (HeadType == "RM + CC + Net Machining") {
            total = (Content.NetRawMaterialCost + TotalConversionCost + 0) * inventoryPercentage / 100;
        } else if (HeadType == "RM + Net Machining") {
            total = (Content.NetRawMaterialCost + 0) * inventoryPercentage / 100;
        } else {
            total = 0;
        }

        return total;
    }

    /**
    * @method plantHandler
    * @description Used to handle plant
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ plant: newValue }, () => this.props.change("part", '0'));
    };

    /**
    * @method partHandler
    * @description Used to handle part
    */
    partHandler = (e) => {
        const { partNo, plant, supplier, TechnologyId } = this.state;
        const { technologyList } = this.props;
        const selectedTechnology = TechnologyId != '' ? TechnologyId : technologyList[0].Value;

        if (plant == null) {
            this.props.change("part", '0')
            toastr.warning(MESSAGES.SELECT_PLANT_FOR_COSTING);
            return false;
        }

        this.props.change("SupplierCode", "")
        this.props.change("POPrice", "")
        this.props.change('supplier1Data', {})
        this.props.change('supplier2Data', {})
        this.props.change('supplier3Data', {})
        this.props.emptyCostingData();

        this.setState({
            partNo: e.target.value,
            supplier: [],
        }, () => {
            const checkPartData = {
                PartId: this.state.partNo,
                TechnologyId: selectedTechnology
            }
            this.props.checkPartWithTechnology(checkPartData, res => {
                this.props.getExistingSupplierDetailByPartId(this.state.partNo, res => {
                    // After get listing of exist suppliers
                    if (res && res.data && res.data.Message != '') {
                        toastr.warning(res.data.Message);
                    }
                    this.existingSupplierDetail()
                })
            })
        });
    };

    existingSupplierDetail = () => {
        const { existingSupplierDetail, Suppliers } = this.props;
        this.props.change("PartDescription", existingSupplierDetail.PartDescription)
        if (existingSupplierDetail && existingSupplierDetail.ExistingSupplierDetails) {

            const existSuppliers = existingSupplierDetail && existingSupplierDetail.ExistingSupplierDetails;

            this.props.change("POPrice", "");
            this.props.change("POPrice2", "");
            this.props.change("POPrice3", "");
            this.props.change("SupplierCode", "");
            this.props.change("SupplierCode2", "");
            this.props.change("SupplierCode3", "");

            let tempArray = [];

            existSuppliers.map((Value, index) => {
                const supplierObj = Suppliers.find(item => item.Value === Value.SupplierId);

                let tempObj = {
                    [`Data${index}`]: {
                        supplierDropdown: Value.ActiveCostingSelectList,
                        supplierName: supplierObj.Text.substring(0, supplierObj.Text.indexOf('(')),
                        supplier: { label: supplierObj.Text, value: supplierObj.Value },
                        POPrice: Value.PurchaseOrderPrice,
                        ShareOfBusiness: Value.ShareOfBusiness,
                    }
                }

                tempArray.push(tempObj);
                tempObj = {};
            });

            this.props.change("POPrice", tempArray.length > 0 && tempArray[0].Data0 ? tempArray[0].Data0.POPrice : 0);
            this.props.change("POPrice2", tempArray.length > 1 && tempArray[1].Data1 ? tempArray[1].Data1.POPrice : 0);
            this.props.change("POPrice3", tempArray.length > 2 && tempArray[2].Data2 ? tempArray[2].Data2.POPrice : 0);

            this.props.change("ShareOfBusiness1", tempArray.length > 0 && tempArray[0].Data0 ? tempArray[0].Data0.ShareOfBusiness : 0);
            this.props.change("ShareOfBusiness2", tempArray.length > 1 && tempArray[1].Data1 ? tempArray[1].Data1.ShareOfBusiness : 0);
            this.props.change("ShareOfBusiness3", tempArray.length > 2 && tempArray[2].Data2 ? tempArray[2].Data2.ShareOfBusiness : 0);

            this.setState({
                supplier: tempArray.length > 0 && tempArray[0].Data0 ? tempArray[0].Data0.supplier : [],
                supplier2: tempArray.length > 1 && tempArray[1].Data1 ? tempArray[1].Data1.supplier : [],
                supplier3: tempArray.length > 2 && tempArray[2].Data2 ? tempArray[2].Data2.supplier : [],
                hideButtonAdd1: tempArray.length > 0 && tempArray[0].Data0.supplier.hasOwnProperty('label') ? false : true,
                hideButtonAdd2: tempArray.length > 1 && tempArray[1].Data1.supplier.hasOwnProperty('label') ? false : true,
                hideButtonAdd3: tempArray.length > 2 && tempArray[2].Data2.supplier.hasOwnProperty('label') ? false : true,
                supplierDropdown1Array: tempArray.length > 0 && tempArray[0].Data0 ? tempArray[0].Data0.supplierDropdown : [],
                supplierDropdown2Array: tempArray.length > 1 && tempArray[1].Data1 ? tempArray[1].Data1.supplierDropdown : [],
                supplierDropdown3Array: tempArray.length > 2 && tempArray[2].Data2 ? tempArray[2].Data2.supplierDropdown : [],
                addSupplier1: tempArray.length > 0 && tempArray[0].Data0.supplier.hasOwnProperty('label') ? true : false,
                addSupplier2: tempArray.length > 1 && tempArray[1].Data1.supplier.hasOwnProperty('label') ? true : false,
                addSupplier3: tempArray.length > 2 && tempArray[2].Data2.supplier.hasOwnProperty('label') ? true : false,
                activeSupplier1: '',
                activeSupplier2: '',
                activeSupplier3: '',
                supplierOneName: tempArray.length > 0 && tempArray[0].Data0 ? tempArray[0].Data0.supplierName : '',
                supplierTwoName: tempArray.length > 1 && tempArray[1].Data1 ? tempArray[1].Data1.supplierName : '',
                supplierThreeName: tempArray.length > 2 && tempArray[2].Data2 ? tempArray[2].Data2.supplierName : '',
            }, () => {
                this.setSupplierCode()
            });
        } else {
            this.setState({
                supplier: [],
                supplier2: [],
                supplier3: [],
                hideButtonAdd1: true,
                hideButtonAdd2: true,
                hideButtonAdd3: true,
                supplierDropdown1Array: [],
                supplierDropdown2Array: [],
                supplierDropdown3Array: [],
                addSupplier1: false,
                addSupplier2: false,
                addSupplier3: false,
                supplierOneName: '',
                supplierTwoName: '',
                supplierThreeName: '',
            });
            this.props.change("POPrice", 0);
            this.props.change("POPrice2", 0);
            this.props.change("POPrice3", 0);

            this.props.change("ShareOfBusiness1", 0);
            this.props.change("ShareOfBusiness2", 0);
            this.props.change("ShareOfBusiness3", 0);

            this.props.change("SupplierCode", '')
            this.props.change("SupplierCode2", '')
            this.props.change("SupplierCode3", '')
        }
    }

    /**
    * @method setSupplierCode
    * @description Used to set supplier's code in supplier code field
    */
    setSupplierCode = () => {
        const { supplier, supplier2, supplier3 } = this.state;
        if (supplier) {
            const result = supplier && supplier.label ? getSupplierCode(supplier.label) : '';
            this.props.change("SupplierCode", result)
        }

        if (supplier2) {
            const result = supplier2 && supplier2.label ? getSupplierCode(supplier2.label) : '';
            this.props.change("SupplierCode2", result)
        }

        if (supplier3) {
            const result = supplier3 && supplier3.label ? getSupplierCode(supplier3.label) : '';
            this.props.change("SupplierCode3", result)
        }
    }

    /**
    * @method supplierHandler
    * @description Used to handle plant
    */
    supplierHandler = (newValue, actionMeta) => {
        if (newValue == null) {
            this.setState({
                supplier: newValue,
                hideButtonAdd1: true,
                supplierOneName: '',
                addSupplier1: false,
            })
            this.props.change("SupplierCode", '')
        } else {
            this.setState({ supplier: newValue }, () => {
                const { supplier } = this.state;
                const result = supplier && supplier.label ? getSupplierCode(supplier.label) : '';
                this.props.change("SupplierCode", result)
            });
        }
    };

    /**
    * @method supplierHandler
    * @description Used to handle plant
    */
    supplier2Handler = (newValue, actionMeta) => {
        if (newValue == null) {
            this.setState({
                supplier2: newValue,
                hideButtonAdd2: true,
                supplierTwoName: '',
                addSupplier2: false,
            })
            this.props.change("SupplierCode2", '')
        } else {
            this.setState({ supplier2: newValue }, () => {
                const { supplier2 } = this.state;
                const result = supplier2 && supplier2.label ? getSupplierCode(supplier2.label) : '';
                this.props.change("SupplierCode2", result)
            });
        }
    };

    /**
    * @method supplier2Handler
    * @description Used to handle plant
    */
    supplier3Handler = (newValue, actionMeta) => {
        if (newValue == null) {
            this.setState({
                supplier3: newValue,
                hideButtonAdd3: true,
                supplierThreeName: '',
                addSupplier3: false,
            })
            this.props.change("SupplierCode3", '')
        } else {
            this.setState({ supplier3: newValue }, () => {
                const { supplier3 } = this.state;
                const result = supplier3 && supplier3.label ? getSupplierCode(supplier3.label) : '';
                this.props.change("SupplierCode3", result)
            });
        }
    };

    /**
    * @method addSupplier
    * @description Using common function for addsupplier function its 1, 2 and 3
    */
    addSupplier = (Number) => {
        const { supplier, supplier2, supplier3, partNo, plant } = this.state;
        const { sobObject } = this.props;

        let SupplierId = '';
        let SupplierLabel = '';
        let SupplierName = '';
        let ShareOfBusiness = 0;

        if (sobObject.hasOwnProperty('ShareOfBusiness1') || sobObject.hasOwnProperty('ShareOfBusiness2') || sobObject.hasOwnProperty('ShareOfBusiness3')) {
            const sob1 = sobObject && sobObject.ShareOfBusiness1 ? parseInt(sobObject.ShareOfBusiness1) : 0;
            const sob2 = sobObject && sobObject.ShareOfBusiness2 ? parseInt(sobObject.ShareOfBusiness2) : 0;
            const sob3 = sobObject && sobObject.ShareOfBusiness3 ? parseInt(sobObject.ShareOfBusiness3) : 0;
            const sobTotal = sob1 + sob2 + sob3;
            if (sobTotal > 100) {
                toastr.warning(MESSAGES.SOB_LESS_THAN_100)
                return false;
            }
            if (sobTotal == 0) {
                toastr.warning(MESSAGES.SOB_GREATER_THAN_ZERO)
                return false;
            }
        }

        if (Number == 1) {
            SupplierId = supplier && supplier.value ? supplier.value : '';
            SupplierLabel = supplier && supplier.label ? supplier.label : '';
            ShareOfBusiness = sobObject && sobObject.ShareOfBusiness1 ? sobObject.ShareOfBusiness1 : '';
            SupplierName = 'supplierOneName';
        } else if (Number == 2) {
            SupplierId = supplier2 && supplier2.value ? supplier2.value : '';
            SupplierLabel = supplier2 && supplier2.label ? supplier2.label : '';
            ShareOfBusiness = sobObject && sobObject.ShareOfBusiness2 ? sobObject.ShareOfBusiness2 : '';
            SupplierName = 'supplierTwoName';
        } else if (Number == 3) {
            SupplierId = supplier3 && supplier3.value ? supplier3.value : '';
            SupplierLabel = supplier3 && supplier3.label ? supplier3.label : '';
            ShareOfBusiness = sobObject && sobObject.ShareOfBusiness3 ? sobObject.ShareOfBusiness3 : '';
            SupplierName = 'supplierThreeName';
        }

        //if (supplier3 && supplier3.value) {
        const requestData = {
            PartId: partNo,
            SupplierId: SupplierId,
            ShareOfBusiness: ShareOfBusiness,
            PlantId: plant.value,
        }

        this.props.createPartWithSupplier(requestData, res => {
            const phrase = SupplierLabel;
            var result = phrase.substr(0, phrase.indexOf('('));
            this.setState({
                [SupplierName]: result,
            })
        })
        //}
    }

    /**
    * @method activeSupplierHandler
    * @description Costing dropdown handler to set costing in column
    */
    activeSupplierHandler = (e, activeSupplier, supplier) => {

        let responseData = '';
        let supplierColumn = '';
        if (supplier == 'supplierOne') {
            supplierColumn = 'supplier1Data';
        } else if (supplier == 'supplierTwo') {
            supplierColumn = 'supplier2Data';
        } else if (supplier == 'supplierThree') {
            supplierColumn = 'supplier3Data';
        }

        this.setState({
            [activeSupplier]: e.target.value
        }, () => {
            if (e.target.value != '' && e.target.value != 0) {
                this.props.getCostingByCostingId(e.target.value, supplier, (res) => {
                    if (res && res.data && res.data.Result) {
                        const { costingData } = this.props;
                        if (supplier == 'supplierOne') {
                            responseData = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
                        } else if (supplier == 'supplierTwo') {
                            responseData = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
                        } else if (supplier == 'supplierThree') {
                            responseData = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
                        }
                        this.props.change(supplierColumn, responseData)
                    }
                })
            } else {
                this.props.change(supplierColumn, {})
            }
        })
    }

    /**
    * @method ecoNumberHandler
    * @description ecoNumber Handler
    */
    ecoNumberHandler = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }
        Content.ECONumber = e.target.value * 1;
        this.props.change(supplierColumn, Content)
    }

    /**
    * @method RevsionNumber
    * @description RevsionNumber Handler
    */
    RevsionNumber = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }
        Content.RevsionNumber = e.target.value * 1;
        this.props.change(supplierColumn, Content)
    }

    /**
    * @method modelTypeHandlerSupplier
    * @description model Type Handler
    */
    modelTypeHandlerSupplier = (e, Number) => {
        const { supplier, supplier2, supplier3 } = this.state;
        const { costingData } = this.props;

        let supplierColumn = '';
        let Content = '';
        let SupplierId = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            SupplierId = supplier.value;
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            SupplierId = supplier2.value;
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            SupplierId = supplier3.value;
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        const TotalConversionCost = Content.NetProcessCost + Content.NetOtherOperationCost + Content.NetSurfaceCost;
        this.setState({
            modelTypeSupplier3: e.target.value
        }, () => {
            if (e.target.value != '') {
                let formData = {
                    ModelTypeId: e.target.value,
                    SupplierId: SupplierId,
                }
                this.props.getCostingOverHeadProByModelType(formData, (res) => {
                    if (res && res.data && res.data.Result) {
                        let Data = res.data.Data;
                        let overHeadCalculation = this.HeadsCalculation(Data.OverheadProfitTypeCostingHead, Content);
                        let profitCostCalculation = this.HeadsCalculation(Data.ProfitTypeCostingHead, Content);

                        Content.ModelTypeId = e.target.value;
                        Content.OverheadPercentage = Data.OverheadProfitPercentage;
                        Content.OverheadCost = (overHeadCalculation * Data.OverheadProfitPercentage) / 100;
                        Content.ProfitPercentage = Data.ProfitPercentage;
                        Content.ProfitCost = (profitCostCalculation * Data.ProfitPercentage) / 100;

                        // TotalOtherCosts
                        Content.TotalOtherCosts = Content.OverheadCost + Content.ProfitCost + Content.RejectionCost
                            + Content.RMInventotyCost + Content.WIPInventotyCost + Content.PaymentTermsCost
                            + Content.ProfitCost + Content.NetFreightCost;

                        this.props.change(supplierColumn, Content)
                    } else {
                        Content.ModelTypeId = e.target.value;
                        Content.OverheadPercentage = 0;
                        Content.OverheadCost = 0;
                        Content.ProfitCost = 0;
                        Content.ProfitPercentage = 0;

                        Content.TotalOtherCosts = Content.OverheadCost + Content.ProfitCost + Content.RejectionCost
                            + Content.RMInventotyCost + Content.WIPInventotyCost + Content.PaymentTermsCost
                            + Content.ProfitCost + Content.NetFreightCost;

                        this.props.change(supplierColumn, Content)
                    }
                })
            } else {
                Content.ModelTypeId = 0;
                Content.OverheadPercentage = 0;
                Content.OverheadCost = 0;
                this.props.change(supplierColumn, Content)
            }
        })
    }

    /**
    * @method HeadsCalculation
    * @description Used for handle heads calculation like RM, RM + CC and RM + CC + BOP like wise
    */
    HeadsCalculation = (HeadType, Content) => {
        console.log("HeadType", HeadType, Content)
        let total = 0;
        const TotalConversionCost = Content.NetProcessCost + Content.NetOtherOperationCost + Content.NetSurfaceCost;

        if (HeadType == "BOP + CC") {
            total = Content.NetBoughtOutParCost + TotalConversionCost;
        } else if (HeadType == "CC") {
            total = TotalConversionCost;
        } else if (HeadType == "CC + Net Machining") {
            total = TotalConversionCost + 0;
        } else if (HeadType == "Fixed") {
            total = 0;
        } else if (HeadType == "Net Machining") {
            total = 0;
        } else if (HeadType == "Other Operation") {
            total = Content.NetOtherOperationCost;
        } else if (HeadType == "RM") {
            total = Content.NetRawMaterialCost;
        } else if (HeadType == "RM + (CC/2)") {
            total = Content.NetRawMaterialCost + (TotalConversionCost / 2);
        } else if (HeadType == "RM + BOP") {
            total = Content.NetRawMaterialCost + Content.NetBoughtOutParCost;
        } else if (HeadType == "RM + Casting Process Cost") {
            total = Content.NetRawMaterialCost + Content.NetProcessCost;
        } else if (HeadType == "RM + CC") {
            total = Content.NetRawMaterialCost + TotalConversionCost
        } else if (HeadType == "RM + CC + BOP") {
            total = Content.NetRawMaterialCost + TotalConversionCost + Content.NetBoughtOutParCost;
        } else if (HeadType == "RM + CC + Net Machining") {
            total = Content.NetRawMaterialCost + TotalConversionCost + 0;
        } else if (HeadType == "RM + Net Machining") {
            total = Content.NetRawMaterialCost + 0;
        } else {
            total = 0;
        }

        return total;
    }

    /**
    * @method rejectionHandlerSupplier
    * @description Used to handle rejection
    */
    rejectionHandlerSupplier = (e, Number) => {
        const { costingData } = this.props;

        let supplierColumn = '';
        let Content = '';
        let SupplierId = '';

        let rejectionTypeValue = '';
        let RejectionTypeCostingHeadID = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
            rejectionTypeValue = 'rejectionTypeValue1';
            RejectionTypeCostingHeadID = 'RejectionTypeCostingHead1ID';
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
            rejectionTypeValue = 'rejectionTypeValue2';
            RejectionTypeCostingHeadID = 'RejectionTypeCostingHead2ID';
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
            rejectionTypeValue = 'rejectionTypeValue3';
            RejectionTypeCostingHeadID = 'RejectionTypeCostingHead3ID';
        }

        const RejectionCostingHeadObj = Content.CostingHeads && Content.CostingHeads.find(item => item.Value == e.target.value)

        let RejectionTypeCalculatedValue = 0;

        if (RejectionCostingHeadObj.Text == 'Fixed') {
            RejectionTypeCalculatedValue = 0;
        } else {
            RejectionTypeCalculatedValue = this.HeadsCalculation(RejectionCostingHeadObj.Text, Content)
        }

        this.setState({
            [rejectionTypeValue]: RejectionTypeCalculatedValue,
            [RejectionTypeCostingHeadID]: e.target.value,
            RejectionHeadType: RejectionCostingHeadObj.Text,
        }, () => { this.RejectionCostCalculation(Number) })
    }

    /**
    * @method RejectionCostCalculation
    * @description Used to handle rejection calculation
    */
    RejectionCostCalculation = (Number) => {

        const { RejectionHeadType, rejectionTypeValue1, rejectionTypeValue2, rejectionTypeValue3, rejectionBasePercentSupplier1,
            rejectionBasePercentSupplier2, rejectionBasePercentSupplier3, RejectionTypeCostingHead1ID,
            RejectionTypeCostingHead2ID, RejectionTypeCostingHead3ID } = this.state;

        const { costingData } = this.props;

        let supplierColumn = '';
        let Content = '';

        let rejectionTypeValue = '';
        let RejectionTypeCostingHeadID = '';
        let rejectionBasePercentSupplier = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
            rejectionTypeValue = rejectionTypeValue1;
            RejectionTypeCostingHeadID = RejectionTypeCostingHead1ID;
            rejectionBasePercentSupplier = rejectionBasePercentSupplier1;
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
            rejectionTypeValue = rejectionTypeValue2;
            RejectionTypeCostingHeadID = RejectionTypeCostingHead2ID;
            rejectionBasePercentSupplier = rejectionBasePercentSupplier2;
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
            rejectionTypeValue = rejectionTypeValue3;
            RejectionTypeCostingHeadID = RejectionTypeCostingHead3ID;
            rejectionBasePercentSupplier = rejectionBasePercentSupplier3;
        }

        if (RejectionHeadType == 'Fixed') {
            Content.RejectionTypeCostingHeadId = RejectionTypeCostingHeadID;
            Content.RejectionPercentage = rejectionBasePercentSupplier;
            Content.RejectionCost = rejectionBasePercentSupplier;
        } else {
            Content.RejectionTypeCostingHeadId = RejectionTypeCostingHeadID;
            Content.RejectionPercentage = rejectionBasePercentSupplier;
            Content.RejectionCost = (rejectionTypeValue * rejectionBasePercentSupplier) / 100
        }


        this.props.change(supplierColumn, Content)
    }

    rejectionPercentHandlerSupplier = (e, Number) => {
        let rejectionBasePercentSupplier = '';
        if (Number == 1) {
            rejectionBasePercentSupplier = 'rejectionBasePercentSupplier1';
        } else if (Number == 2) {
            rejectionBasePercentSupplier = 'rejectionBasePercentSupplier2';
        } else if (Number == 3) {
            rejectionBasePercentSupplier = 'rejectionBasePercentSupplier3';
        }

        this.setState({
            [rejectionBasePercentSupplier]: e.target.value
        }, () => { this.RejectionCostCalculation(Number) })
    }

    /**
    * @method freightHeadsHandler
    * @description Used to handle freight heads
    */
    freightHeadsHandler = (e, Number) => {
        const { plant, supplier, supplier2, supplier3 } = this.state;
        const { FreightHeadsList, costingData } = this.props;

        let supplierColumn = '';
        let Content = '';
        let supplierId = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            supplierId = supplier.value;
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            supplierId = supplier2.value;
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            supplierId = supplier3.value;
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        if (e.target.value && e.target.value != '') {
            const tempObj = FreightHeadsList.find(item => item.Value == e.target.value)
            this.setState({ freightHead: e.target.value }, () => {
                const freightData = {
                    FreightHeadId: tempObj.Value,
                    FreightHead: tempObj.Text,
                    SourceSupplierId: supplierId,
                    SourceSupplierPlantId: plant.value,
                }
                this.props.getCostingFreight(freightData, res => {
                    Content.FreightId = e.target.value;
                    const { FreightData } = this.props;
                    if (FreightData && FreightData != undefined) {
                        Content.InputFreight = checkForNull(Content.InputFreight);
                        FreightData.NetFreightCost = checkForNull(FreightData.FreightLoadRate);
                        if (FreightData.FreightHeadName == 'Rs/Kg' || FreightData.FreightHeadName == 'perCubic feet') {
                            Content.NetFreightCost = (checkForNull(Content.InputFreight) * checkForNull(FreightData.NetFreightCost));
                        } else {
                            Content.NetFreightCost = (checkForNull(FreightData.NetFreightCost) / checkForNull(Content.InputFreight));
                        }

                        Content.NetFreightCost = checkForNull(Content.NetFreightCost)
                        this.props.change(supplierColumn, Content)
                    }
                })
            });
        }
    };



    /**
    * @method freightAmountHandler
    * @description Used for freight amount handling
    */
    freightAmountHandler = (e, Number) => {
        const isSupplierAdded = this.isSupplierAdded(Number);
        if (!isSupplierAdded) {
            toastr.warning(MESSAGES.SELECT_SUPPLIER_BEFORE_ADD_VALUE)
            return false;
        }
        const { costingData, FreightData } = this.props;
        const FreightAmount = e.target.value;

        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        if (FreightData && FreightData != undefined) {
            Content.InputFreight = checkForNull(FreightAmount);
            FreightData.NetFreightCost = checkForNull(FreightData.FreightLoadRate);
            if (FreightData.FreightHeadName == 'Rs/Kg' || FreightData.FreightHeadName == 'perCubic feet') {
                Content.NetFreightCost = (checkForNull(Content.InputFreight) * checkForNull(FreightData.NetFreightCost));
            } else {
                Content.NetFreightCost = (checkForNull(FreightData.NetFreightCost) / checkForNull(Content.InputFreight));
            }
            this.props.change(supplierColumn, Content)
        }
    }

    /**
    * @method transportationCostFinishWtHandler
    * @description Used for transportation cost calculation
    */
    transportationCostFinishWtHandler = (e, Number) => {
        const isSupplierAdded = this.isSupplierAdded(Number);
        if (!isSupplierAdded) {
            toastr.warning(MESSAGES.SELECT_SUPPLIER_BEFORE_ADD_VALUE)
            return false;
        }

        if (e.target.value != null && e.target.value != '') {
            const TransportationOperationFinishWeight = e.target.value;
            const { costingData } = this.props;

            let supplierColumn = '';
            let Content = '';

            if (Number == 1) {
                supplierColumn = 'supplier1Data';
                Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
            } else if (Number == 2) {
                supplierColumn = 'supplier2Data';
                Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
            } else if (Number == 3) {
                supplierColumn = 'supplier3Data';
                Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
            }

            const TransportationOperationCost = checkForNull(Content.Quantity) * checkForNull(TransportationOperationFinishWeight) * checkForNull(Content.TransportationOperationRate);
            Content.TransportationOperationFinishWeight = checkForNull(TransportationOperationFinishWeight);
            Content.TransportationOperationCost = checkForNull(TransportationOperationCost);
            Content.CEDtotalCost = checkForNull(Content.NetSurfaceAreaCost) + checkForNull(Content.OverheadProfitCost) + checkForNull(Content.TransportationOperationCost);

            Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
                + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);
            Content.DiscountCost = (Content.TotalCost * checkForNull(Content.Discount)) / 100;
            Content.NetPurchaseOrderPrice = (Content.TotalCost - Content.DiscountCost);
            this.props.change(supplierColumn, Content)
        }
    }

    /**
    * @method packageCostingHandler
    * @description If package cost then included in total cost
    */
    packageCostingHandler = (e, Number) => {

        const isSupplierAdded = this.isSupplierAdded(Number);
        if (!isSupplierAdded) {
            toastr.warning(MESSAGES.SELECT_SUPPLIER_BEFORE_ADD_VALUE)
            return false;
        }

        const packagingCost = e.target.value;
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        // TotalOtherCosts
        Content.PackagingCost = packagingCost * 1;
        Content.TotalOtherCosts = checkForNull(Content.OverheadCost) + checkForNull(Content.ProfitCost) + checkForNull(Content.RejectionCost)
            + checkForNull(Content.RMInventotyCost) + checkForNull(Content.WIPInventotyCost) + checkForNull(Content.PaymentTermsCost)
            + checkForNull(Content.ProfitCost) + checkForNull(Content.NetFreightCost) + checkForNull(Content.PackagingCost) + checkForNull(Content.OtherAnyCostAndCharges);

        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);

        Content.DiscountCost = (Content.TotalCost * checkForNull(Content.Discount)) / 100;

        Content.NetPurchaseOrderPrice = Content.TotalCost - Content.DiscountCost;

        this.props.change(supplierColumn, Content)

    }

    /**
    * @method anyOtherCostHandler
    * @description If package cost then included in total cost
    */
    anyOtherCostHandler = (e, Number) => {
        const { costingData } = this.props;

        const anyOtherCost = e.target.value;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        // TotalOtherCosts
        Content.OtherAnyCostAndCharges = checkForNull(anyOtherCost) * 1;
        Content.TotalOtherCosts = checkForNull(Content.OverheadCost) + checkForNull(Content.ProfitCost) + checkForNull(Content.RejectionCost)
            + checkForNull(Content.RMInventotyCost) + checkForNull(Content.WIPInventotyCost) + checkForNull(Content.PaymentTermsCost)
            + checkForNull(Content.ProfitCost) + checkForNull(Content.NetFreightCost) + checkForNull(Content.PackagingCost) + checkForNull(Content.OtherAnyCostAndCharges);

        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);

        this.props.change(supplierColumn, Content)
    }

    /**
    * @method toolMaintenanceHandler
    * @description Tool maintenance cost
    */
    toolMaintenanceHandler = (e, Number) => {
        const { costingData } = this.props;

        const toolMaintenanceCost = e.target.value;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        // TotalOtherCosts
        Content.ToolMaintenanceCost = checkForNull(toolMaintenanceCost) * 1;
        Content.ToolCost = checkForNull(Content.ToolMaintenanceCost) + checkForNull(Content.ToolAmortizationCost);
        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);
        Content.DiscountCost = (checkForNull(Content.TotalCost) * checkForNull(Content.Discount)) / 100;
        Content.NetPurchaseOrderPrice = Content.TotalCost - Content.DiscountCost;
        this.props.change(supplierColumn, Content)
    }

    /**
    * @method toolAmortizationHandler
    * @description Tool amortization cost
    */
    toolAmortizationHandler = (e, Number) => {
        const toolAmortizationCost = e.target.value;

        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        Content.ToolAmortizationCost = checkForNull(toolAmortizationCost) * 1;
        Content.ToolCost = checkForNull(Content.ToolMaintenanceCost) + checkForNull(Content.ToolAmortizationCost);

        this.props.change(supplierColumn, Content)
    }



    discountHandler = (e, Number) => {
        const discount = e.target.value;

        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        Content.Discount = checkForNull(discount) * 1;
        Content.DiscountCost = (checkForNull(Content.TotalCost) * checkForNull(Content.Discount)) / 100;
        Content.NetPurchaseOrderPrice = checkForNull(Content.TotalCost) - checkForNull(Content.DiscountCost);

        this.props.change(supplierColumn, Content)
    }

    landedFactorHandler = (e, Number) => {
        const LandedFactorPercentage = e.target.value;

        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        Content.LandedFactorPercentage = checkForNull(LandedFactorPercentage) * 1;
        Content.LandedFactorCost = checkForNull(Content.NetPurchaseOrderPrice) * checkForNull(Content.LandedFactorPercentage);

        this.props.change(supplierColumn, Content)
    }



    CEDRemarksHandler = (e, Number) => {
        const { costingData } = this.props;

        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        Content.CEDRemarks = e.target.value;
        this.props.change(supplierColumn, Content)
    }

    packagingRemarksHandler = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }
        Content.PackagingRemarks = e.target.value;
        this.props.change(supplierColumn, Content)
    }

    remarksHandler = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }
        Content.Remarks = e.target.value;
        this.props.change(supplierColumn, Content)
    }

    /**
    * @method renderTypeOfListing
    * @description Used to show type of listing
    */
    renderTypeOfListing = (label) => {
        const { supplierDropdown1Array, supplierDropdown2Array, supplierDropdown3Array } = this.state;
        const { technologyList, plantList, Parts, Suppliers, ZBCSupplier, supplier2CostingDat, costingHead,
            modelTypes, FreightHeadsList } = this.props;
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

        if (label === 'freightHeads') {
            FreightHeadsList && FreightHeadsList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }



    activeZBCSupplierHandler = (e, supplier) => {
        this.setState({
            activeZBCSupplier: e.target.value
        })
    }

    /**
    * @method supplierCosting
    * @description Used for VBC costing
    */
    supplierCosting = (supplierId) => {
        const { plant, partNo } = this.state;
        const data = {
            supplierId: supplierId,
            plantId: plant.value,
            partId: partNo
        }
        this.props.supplierCosting(data)
    }

    /**
    * @method ZBCSupplierCosting
    * @description Used for zbc costing
    */
    ZBCSupplierCosting = (supplierId) => {
        const { plant, partNo } = this.state;
        if (partNo != '') {
            const data = {
                supplierId: supplierId,
                plantId: plant.value,
                partId: partNo
            }
            this.props.supplierCosting(data)
        } else {
            toastr.warning(MESSAGES.SELECT_PART_FOR_ZBC_COSTING)
        }
    }

    modelTypeHandlerZBC = (e) => {
        this.setState({
            modelTypeZBC: e.target.value
        })
    }

    rejectionHandlerZBC = (e) => {
        this.setState({
            rejectionTypeZBC: e.target.value
        })
    }

    /**
    * @method otherOperationCostToggle
    * @description Used for add other Operation Cost heads
    */
    otherOperationCostToggle = (supplierIdForOtherOps, supplierColumn) => {
        this.setState({
            isShowOtherOpsModal: true,
            supplierIdForOtherOps: supplierIdForOtherOps,
            supplierColumn: supplierColumn,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel other operation modal
     */
    onCancel = () => {
        this.setState({
            isShowOtherOpsModal: false,
        });
    }


    /**
     * @method CEDotherOperationToggle
     * @description Used for add CED other Operation Cost heads
     */
    CEDotherOperationToggle = (supplierIdForCEDOtherOps, supplierColumn) => {
        this.setState({
            isShowCEDotherOpsModal: true,
            supplierIdForCEDOtherOps: supplierIdForCEDOtherOps,
            supplierColumn: supplierColumn,
        })
    }

    /**
     * @method onCancelCEDotherOps
     * @description  used to cancel CED other Operation model
     */
    onCancelCEDotherOps = () => {
        this.setState({
            isShowCEDotherOpsModal: false,
        });
    }



    /**
     * @method interestHandler
     * @description  used for WIPinventory, RMinventory and Paymentterms 
     * @params supplierId: to get detail of WIP, RM and Payment percent for perticular supplier.
     * @params supplierColumn: to fill the detail in selected column.
     */
    interestHandler = (supplierId, supplierColumn) => {
        if (supplierId) {
            const { interestRateList } = this.props;
            const interestData = interestRateList.find((item) => {
                return item.SupplierId == supplierId
            })
            this.props.setInventoryRowData(supplierColumn, interestData)
        }
    }

    AdditionalFreightCostHandler = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        if (e.target.value != null && e.target.value != '') {
            Content.NetAdditionalFreightCost = e.target.value;
        } else {
            Content.NetAdditionalFreightCost = 0;
        }

        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);

        Content.DiscountCost = (checkForNull(Content.TotalCost) * checkForNull(Content.Discount)) / 100;
        Content.NetPurchaseOrderPrice = checkForNull(Content.TotalCost) - checkForNull(Content.DiscountCost);

        this.props.change(supplierColumn, Content)
    }

    /**
     * @method AddFreightToggle
     * @description Used for toggle freight
     */
    AddFreightToggle = (Number) => {
        const { supplier, supplier2, supplier3 } = this.state;
        let supplierId = '';
        let supplierColumn = '';

        if (Number == 1) {
            supplierId = supplier.value;
        } else if (Number == 2) {
            supplierId = supplier2.value;
        } else if (Number == 3) {
            supplierId = supplier3.value;
        }

        if (supplierId != undefined) {
            this.setState({
                isShowFreightModal: true,
                supplierColumn: Number,
                supplierId: supplierId,
            })
        } else {
            toastr.warning(MESSAGES.SELECT_SUPPLIER_BEFORE_ADD_VALUE)
            return false;
        }
    }

    /**
     * @method onCancelCEDotherOps
     * @description  used to cancel CED other Operation model
     */
    onCancelFreight = (additionalTotal = 0) => {
        this.setState({
            isShowFreightModal: false,
        }, () => this.setAdditionalFreight(additionalTotal));
    }

    setAdditionalFreight = (Total) => {
        const { supplierColumn } = this.state;
        const { costingData } = this.props;
        let Column = '';
        let Content = '';

        if (supplierColumn == 1) {
            Column = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (supplierColumn == 2) {
            Column = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (supplierColumn == 3) {
            Column = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        Content.NetAdditionalFreightCost = checkForNull(Total);
        Content.TotalCost = checkForNull(Content.TotalConversionCost) + checkForNull(Content.TotalOtherCosts) + checkForNull(Content.ToolMaintenanceCost)
            + checkForNull(Content.NetBoughtOutParCost) + checkForNull(Content.NetRawMaterialCost) + checkForNull(Content.CEDtotalCost) + checkForNull(Content.NetAdditionalFreightCost);
        Content.DiscountCost = (checkForNull(Content.TotalCost) * checkForNull(Content.Discount)) / 100;
        Content.NetPurchaseOrderPrice = checkForNull(Content.TotalCost) - checkForNull(Content.DiscountCost);
        this.props.change(Column, Content)

    }

    shareOfBusinessHandler = (e, Number) => {
        const { costingData } = this.props;
        let supplierColumn = '';
        let Content = '';

        if (Number == 1) {
            supplierColumn = 'supplier1Data';
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierColumn = 'supplier2Data';
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierColumn = 'supplier3Data';
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }
        Content.ShareOfBusiness = checkForNull(e.target.value);
        this.props.change(supplierColumn, Content)
    }

    /**
    * @method isSupplierAdded
    * @description Used to check supplier added in column or not
    */
    isSupplierAdded = (Number) => {
        const { supplier, supplier2, supplier3 } = this.state;
        let supplierId = '';
        if (Number == 1) {
            return supplier && supplier.value ? true : false;
        } else if (Number == 2) {
            return supplier2 && supplier2.value ? true : false;
        } else if (Number == 3) {
            return supplier3 && supplier3.value ? true : false;
        }
    }

    sendApproval = (Number) => {
        const { supplier, supplier2, supplier3 } = this.state;
        const { costingData } = this.props;

        let Content = '';
        let supplierId = '';

        if (Number == 1) {
            supplierId = supplier.value;
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
        } else if (Number == 2) {
            supplierId = supplier2.value;
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
        } else if (Number == 3) {
            supplierId = supplier3.value;
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
        }

        this.setState({
            isOpenSendForApproval: true,
            sendForApprovalSupplierId: supplierId,
            sendForApprovalCostingId: Content.CostingId,
        })
    }

    onCancelApproval = () => {
        this.setState({
            isOpenSendForApproval: false,
        })
    }

    saveCosting = (Number) => {
        const { costingData } = this.props;

        let Content = '';
        let CostingId = '';

        if (Number == 1) {
            Content = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail : {};
            CostingId = costingData && costingData.supplierOne ? costingData.supplierOne.CostingDetail.CostingId : '';
        } else if (Number == 2) {
            Content = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail : {};
            CostingId = costingData && costingData.supplierTwo ? costingData.supplierTwo.CostingDetail.CostingId : '';
        } else if (Number == 3) {
            Content = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail : {};
            CostingId = costingData && costingData.supplierThree ? costingData.supplierThree.CostingDetail.CostingId : '';
        }

        let formData = {
            CostingId: CostingId,
            ECONumber: Content.ECONumber,
            RevsionNumber: Content.RevsionNumber,
            NetBoughtOutParCost: Content.NetBoughtOutParCost,
            NetRawMaterialCost: Content.NetRawMaterialCost,
            NetProcessCost: Content.NetProcessCost,
            NetOtherOperationCost: Content.NetOtherOperationCost,
            SurfaceTreatmentCost: Content.SurfaceTreatmentCost,
            TotalConversionCost: Content.TotalConversionCost,
            ModelTypeId: Content.ModelTypeId,
            OverheadPercentage: Content.OverheadPercentage,
            RejectionTypeCostingHeadId: Content.RejectionTypeCostingHeadId,
            RejectionPercentage: Content.RejectionPercentage,
            RejectionCost: Content.RejectionCost,
            RMInventotyDays: Content.RMInventotyDays,
            RMInventotyCost: Content.RMInventotyCost,
            ICCPercentage: Content.ICCPercentage,
            RMICCPercentage: Content.RMICCPercentage,
            RMCostingHeadsId: Content.RMCostingHeadsId,
            WIPInventotyDays: Content.WIPInventotyDays,
            WIPInventotyCost: Content.WIPInventotyCost,
            WIPICCPercentage: Content.WIPICCPercentage,
            WIPCostingHeadsId: Content.WIPCostingHeadsId,
            PaymentTermsDays: Content.PaymentTermsDays,
            PaymentTermsCost: Content.PaymentTermsCost,
            PaymentTermsICCPercentage: Content.PaymentTermsICCPercentage,
            PaymentTermsCostingHeadsId: Content.PaymentTermsCostingHeadsId,
            ProfitPercentage: Content.ProfitPercentage,
            ProfitTypeCostingHeadsId: Content.ProfitTypeCostingHeadsId,
            FreightId: Content.FreightId,
            NetFreightCost: Content.NetFreightCost,
            AdditionalFreightId: Content.AdditionalFreightId,
            NetAdditionalFreightCost: Content.NetAdditionalFreightCost,
            CEDOperationId: Content.CEDOperationId,
            CEDOperationName: Content.CEDOperationName,
            CEDOperationRate: Content.CEDOperationRate,
            NetSurfaceArea: Content.NetSurfaceArea,
            NetSurfaceCost: Content.NetSurfaceAreaCost,
            TransportationOperationRate: Content.TransportationOperationRate,
            TransportationOperationFinishWeight: Content.TransportationOperationFinishWeight,
            TransportationOperationCost: Content.TransportationOperationCost,
            OverheadProfitPercentage: Content.OverheadProfitPercentage,
            OverheadProfitTypeCostingHeadsId: Content.OverheadProfitTypeCostingHeadsId,
            OverheadProfitCost: Content.OverheadProfitCost,
            CEDRemarks: Content.CEDRemarks,
            PackagingCost: Content.PackagingCost,
            PackagingRemarks: Content.PackagingRemarks,
            OtherAnyCostAndCharges: Content.OtherAnyCostAndCharges,
            TotalOtherCosts: Content.TotalOtherCosts,
            ToolCost: Content.ToolCost,
            ToolMaintenanceCost: Content.ToolMaintenanceCost,
            ToolAmortizationCost: Content.ToolAmortizationCost,
            Discount: Content.Discount,
            OtherBaseCost: Content.OtherBaseCost,
            Remarks: Content.Remarks,
            LandedFactorPercentage: Content.LandedFactorPercentage,
            LandedFactorCost: Content.LandedFactorCost,
            CostingStatusId: Content.CostingStatusId,
            CostingStatusName: Content.CostingStatusName,
            NetPurchaseOrderPrice: Content.NetPurchaseOrderPrice,
            ShareOfBusiness: Content.ShareOfBusiness,
            Quantity: Content.Quantity,
            NetGrossWeight: Content.NetGrossWeight,
        }

        this.props.saveCosting(formData, (res) => {
            toastr.success(MESSAGES.COSTING_SAVED_SUCCESSFULLY)
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
        const { handleSubmit, ZBCSupplier, costingData } = this.props;
        const { supplier, supplier2, supplier3, isShowOtherOpsModal, supplierIdForOtherOps, supplierColumn, isShowCEDotherOpsModal,
            isShowFreightModal, supplierIdForCEDOtherOps, isOpenSendForApproval, sendForApprovalSupplierId,
            sendForApprovalCostingId, SupplierOneCostingStatus, SupplierTwoCostingStatus, SupplierThreeCostingStatus
        } = this.state;

        let supplier1Data = 'supplier1Data';
        let supplier2Data = 'supplier2Data';
        let supplier3Data = 'supplier3Data';

        return (
            <div>
                {/* {this.props.loading && <Loader />} */}
                <form
                    noValidate
                    className="form costSummary-form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row><Col md="3"><h5>{`Item Detail`}</h5></Col></Row>
                    <Row>
                        {/* -------------start left section------------------- */}
                        {/* <Col md="12"> */}
                        <Col md="3">
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
                        <Col md="3">
                            <Field
                                id="PlantId"
                                name="PlantId"
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                label="Plant"
                                component={searchableSelect}
                                //validate={[required, maxLength50]}
                                options={this.renderTypeOfListing('plant')}
                                required={true}
                                handleChangeDescription={this.plantHandler}
                                valueDescription={this.state.plant}
                            />
                        </Col>
                        <Col md="3">
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
                        <Col md="3">
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
                        {/* </Col> */}
                    </Row>
                    {/* -----------------end left section-------------------- */}
                    {/* <hr /> */}
                    <Row><Col md="3"><h5>{`Existing Supplier Details`}</h5></Col></Row>
                    <Row>
                        {/* -----------------start right section-------------------- */}
                        {/* <Col md="12"> */}

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
                                required={true}
                                handleChangeDescription={this.supplierHandler}
                                valueDescription={this.state.supplier}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
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
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`PO Price`}
                                name={"POPrice"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                value={0}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`SOB`}
                                name={"ShareOfBusiness1"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                required={true}
                                className=""
                                disabled={false}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            {this.state.hideButtonAdd1 &&
                                <button type="button" onClick={() => this.addSupplier(1)} className={'btn btn-secondary add-btn'}>Add</button>
                            }
                        </Col>
                        {/* <hr /> */}
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
                                required={true}
                                handleChangeDescription={this.supplier2Handler}
                                valueDescription={this.state.supplier2}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
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
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`PO Price`}
                                name={"POPrice2"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                value={0}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`SOB`}
                                name={"ShareOfBusiness2"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                required={true}
                                className=""
                                disabled={false}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            {this.state.hideButtonAdd2 &&
                                <button type="button" onClick={() => this.addSupplier(2)} className={'btn btn-secondary add-btn'}>Add</button>
                            }
                        </Col>
                        {/* <hr /> */}
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
                                required={true}
                                handleChangeDescription={this.supplier3Handler}
                                valueDescription={this.state.supplier3}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
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
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`PO Price`}
                                name={"POPrice3"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                value={0}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            <Field
                                label={`SOB`}
                                name={"ShareOfBusiness3"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                required={true}
                                className=""
                                disabled={false}
                            />
                        </Col>
                        <Col md="2" className={'existing-supplier'}>
                            {this.state.hideButtonAdd3 &&
                                <button type="button" onClick={() => this.addSupplier(3)} className={'btn btn-secondary add-btn'}>Add</button>
                            }
                        </Col>
                        {/* </Col> */}
                        {/* -----------------end right section-------------------- */}
                    </Row>
                    {/* <hr /> */}
                    <Row>
                        <Col md="12" className={'dark-divider'}>ZBC V/s VBC</Col>
                        <Col md="3">
                            {/* <div>ZBC</div> */}
                            {/* {ZBCSupplier && <a href="javascript:void(0)" >{`${ZBCSupplier.SupplierName}`}</a>} */}
                            {ZBCSupplier && <a href="javascript:void(0)" onClick={() => this.ZBCSupplierCosting(ZBCSupplier.SupplierId)} >{`${ZBCSupplier.SupplierName}`}</a>}
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
                                        onChange={(e) => this.activeSupplierHandler(e, 'activeSupplier1', 'supplierOne')}
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
                                    onChange={(e) => this.activeSupplierHandler(e, 'activeSupplier2', 'supplierTwo')}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            }
                        </Col>
                        <Col md="3">
                            {!this.state.addSupplier3 && this.state.supplierThreeName == '' && <div>Supplier3</div>}
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
                                    onChange={(e) => this.activeSupplierHandler(e, 'activeSupplier3', 'supplierThree')}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                            }</Col>
                    </Row>

                    {/* ---------------Material Cost start------------------ */}
                    <Row className={'divider'} >
                        <Col>A) Material Cost</Col>
                    </Row>
                    <Row>
                        <Col md="12" className={'dark-divider'}>
                            Net RM Cost
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input
                                type="text"
                                disabled
                                className={'form-control'}
                                value={this.state.netRMCostZBC}
                                title="NET NRM Cost" />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier1Data}.NetRawMaterialCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="NET NRM Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.NetRawMaterialCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="NET NRM Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.NetRawMaterialCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="NET NRM Cost"
                            />
                        </Col>

                        <Col md="12" className={'dark-divider'}>
                            ECO No.
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input
                                type="text"
                                className={'form-control'}
                                value={this.state.ecoNoZBC}
                                title="Enter ECO No" />

                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier1Data}.ECONumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.ecoNumberHandler(e, 1)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter ECO No"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.ECONumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.ecoNumberHandler(e, 2)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter ECO No"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.ECONumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.ecoNumberHandler(e, 3)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter ECO No"
                            />
                        </Col>

                        <Col md="12" className={'dark-divider'}>
                            Rev No.
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input
                                type="text"
                                className={'form-control'}
                                value={this.state.revNoZBC}
                                title="Enter Rev No" />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier1Data}.RevsionNumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.RevsionNumber(e, 1)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter Rev No"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.RevsionNumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.RevsionNumber(e, 2)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter Rev No"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.RevsionNumber`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                onChange={(e) => this.RevsionNumber(e, 3)}
                                disabled={false}
                                className="withoutBorder"
                                title="Enter Rev No"
                            />
                        </Col>
                    </Row>
                    {/* ------------------Material Cost end----------------- */}

                    {/* ------------------BOP/Job cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>B) BOP/Job Cost</Col>
                    </Row>
                    <Row>
                        <Col md="12" className={'dark-divider'}>
                            Total BOP/Job Cost
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input type="text" disabled value={this.state.totalBOPCostZBC} className={'form-control'} title="Total BOP/Job Cost" />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier1Data}.NetBoughtOutParCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total BOP/Job Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.NetBoughtOutParCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total BOP/Job Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.NetBoughtOutParCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total BOP/Job Cost"
                            />
                        </Col>
                    </Row>
                    {/* ----------------BOP/Job cost end------------------- */}


                    {/* ------------------Conversion Cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>C) Conversion Cost</Col>
                    </Row>
                    <Row>
                        <Col md="12" className={'dark-divider'}>
                            Process Cost
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input type="text" disabled value={this.state.processCostZBC} className={'form-control'} title="Process Cost" />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier1Data}.NetProcessCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Process Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.NetProcessCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Process Cost"
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.NetProcessCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Process Cost"
                            />
                        </Col>

                        <Col md="12" className={'dark-divider'}>
                            Other Operation Cost
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input type="text" disabled value={this.state.otherOpsCostZBC} className={'form-control zbc-inputt'} title="Other Operation Cost" />
                            {/* <button type="button" className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier1Data}.NetOtherOperationCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                //className="withoutBorder custom-ops-field"
                                className="withoutBorder"
                                title="Other Operation Cost"
                            />
                            {/* <button type="button" onClick={() => this.otherOperationCostToggle(supplier.value, "supplierOne")} className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier2Data}.NetOtherOperationCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                //className="withoutBorder custom-ops-field"
                                className="withoutBorder"
                                title="Other Operation Cost"
                            />
                            {/* <button type="button" onClick={() => this.otherOperationCostToggle(supplier2.value, "supplierTwo")} className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier3Data}.NetOtherOperationCost`}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                //className="withoutBorder custom-ops-field"
                                className="withoutBorder"
                                title="Other Operation Cost"
                            />
                            {/* <button type="button" onClick={() => this.otherOperationCostToggle(supplier3.value, "supplierThree")} className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>

                        <Col md="12" className={'dark-divider'}>
                            Surface Treatment
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input type="text" value={this.state.surfaceTreatmentZBC} className={'form-control zbc-inputt'} title="Surface Treatment" />
                            {/* <button type="button" className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier1Data}.NetSurfaceCost`}
                                type="text"
                                placeholder={''}
                                validate={[number]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder custom-ops-field"
                                title="Surface Treatment"
                            />
                            {/* <button type="button" className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier2Data}.NetSurfaceCost`}
                                type="text"
                                placeholder={''}
                                validate={[number]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder custom-ops-field"
                                title="Surface Treatment"
                            />
                            {/* <button type="button" className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>
                        <Col md="3" className="custom-opss">
                            <Field
                                label={``}
                                name={`${supplier3Data}.NetSurfaceCost`}
                                type="text"
                                placeholder={''}
                                validate={[number]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder custom-ops-field"
                                title="Surface Treatment"
                            />
                            {/* <button type="button" className={'btn btn-primary custom-btn'}>Show</button> */}
                        </Col>

                        <Col md="12" className={'dark-divider'}>
                            Total Conversion Cost
                        </Col>
                        <Col md="3">
                            <label></label>
                            <input type="text" disabled value={this.state.totalConvCostZBC} className={'form-control zbc-inputt'} title="Total Conversion Cost" />
                        </Col>
                        <Col md="3">
                            {/* <input type="text" disabled value={this.state.totalConvCostSupplier1} className={'mt20 supplier-input'} title="Total Conversion Cost" /> */}
                            <Field
                                label={``}
                                name={`${supplier1Data}.TotalConversionCost`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total Conversion Cost"
                            />
                        </Col>
                        <Col md="3">
                            {/* <input type="text" disabled value={this.state.totalConvCostSupplier2} className={'mt20 supplier-input'} title="Total Conversion Cost" /> */}
                            <Field
                                label={``}
                                name={`${supplier2Data}.TotalConversionCost`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total Conversion Cost"
                            />
                        </Col>
                        <Col md="3">
                            {/* <input type="text" disabled value={this.state.totalConvCostSupplier3} className={'mt20 supplier-input'} title="Total Conversion Cost" /> */}
                            <Field
                                label={``}
                                name={`${supplier3Data}.TotalConversionCost`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                value={0}
                                //required={true}
                                disabled={true}
                                className="withoutBorder"
                                title="Total Conversion Cost"
                            />
                        </Col>

                    </Row>
                    {/* ----------------Conversion Cost end------------------- */}

                    {/* ------------------Other Cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>D) Other Cost</Col>
                    </Row>
                    <Row>
                        <Col md="12" className={'dark-divider'}>
                            {''}
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
                        <Col md="3">
                            <div className={'base-cost'}>Base</div>
                            <div className={'base-cost'}>Cost</div>
                        </Col>

                        {/* ----------------ModelType-Overhead/Profit------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            ModelType-Overhead/Profit
                        </Col>
                        <Col md="3">
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
                                name={`${supplier1Data}.ModelTypeId`}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={(e) => this.modelTypeHandlerSupplier(e, 1)}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier2Data}.ModelTypeId`}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={(e) => this.modelTypeHandlerSupplier(e, 2)}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                label={``}
                                name={`${supplier3Data}.ModelTypeId`}
                                type="text"
                                placeholder={'Select Model Type'}
                                //validate={[required]}
                                // required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('modelType')}
                                onChange={(e) => this.modelTypeHandlerSupplier(e, 3)}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        {/* ----------------ModelType-Overhead/Profit------------------- */}

                        {/* ----------------Overhead Percent start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            {'Overhead % on'}
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.overheadPercentZBC} className={'form-control overhead-percent-zbc'} title="OverHead Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.overheadCostZBC} className={'form-control overhead-percent-zbc'} title="OverHead Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadPercentSupplier1} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.OverheadPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="OverHead Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadCostSupplier1} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.OverheadCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="OverHead Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadPercentSupplier2} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.OverheadPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="OverHead Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadCostSupplier2} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.OverheadCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="OverHead Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadPercentSupplier3} className={'mt20 overhead-percent-supplier'} title="OverHead Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.OverheadPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="OverHead Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.overheadCostSupplier3} className={'mt20 overhead-percent-supplier'} title="OverHead Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.OverheadCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    disabled={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    title="(sum of costing head * overhead percent) * 100"
                                />
                            </div>
                        </Col>
                        {/* ----------------Overhead Percent ended------------------- */}

                        {/* ----------------Rejection (% on Matl + Conv.) start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Rejection (% on Matl + Conv.)
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
                                {/* <label></label>
                                <input type="text" disabled value={this.state.rejectionCostZBC} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" /> */}
                                <Field
                                    label={``}
                                    name={"RejectionZBCCost"}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionCostZBC}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={`${supplier1Data}.RejectionTypeCostingHeadId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={(e) => this.rejectionHandlerSupplier(e, 1)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={`${supplier1Data}.RejectionPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    onChange={(e) => this.rejectionPercentHandlerSupplier(e, 1)}
                                    value={this.state.rejectionBasePercentSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                //disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.rejectionCostSupplier1} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.RejectionCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionCostSupplier1}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="((sum of heads) * Rejection %) / 100"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={`${supplier2Data}.RejectionTypeCostingHeadId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={(e) => this.rejectionHandlerSupplier(e, 2)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={`${supplier2Data}.RejectionPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    onChange={(e) => this.rejectionPercentHandlerSupplier(e, 2)}
                                    value={this.state.rejectionBasePercentSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                //disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.rejectionCostSupplier2} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.RejectionCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rejectionCostSupplier2}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="((sum of heads) * Rejection %) / 100"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Rejection Type`}
                                    name={`${supplier3Data}.RejectionTypeCostingHeadId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    //required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('Rejection')}
                                    onChange={(e) => this.rejectionHandlerSupplier(e, 3)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <Field
                                    label={`Rejection(%)`}
                                    name={`${supplier3Data}.RejectionPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    onChange={(e) => this.rejectionPercentHandlerSupplier(e, 3)}
                                    value={this.state.rejectionBasePercentSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                //disabled={true}
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.rejectionCostSupplier3} className={'mt20 overhead-percent-supplier'} title="((Conversion Cost (CC) + RM Cost(RM)) * RM Inventory (RMinvent)) / 100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.RejectionCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="((sum of heads) * Rejection %) / 100"
                                />
                            </div>
                        </Col>
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}

                        {/* ----------------RM inventorycost (% on No of days) start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            RM inventorycost (% on No of days)
                        </Col>
                        <Col md="3">
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
                                    label={`RM ICC(%)`}
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
                                {/* <button type="button" >Ref ICC</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.rmInventoryCostZBC} className={'form-control overhead-percent-supplier'} title="(((WIP Inventorycost / 100) * TotalBOP) + NetRM + Tcc) * WIP Inventory Days) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`RM ICC(%)`}
                                    name={`${supplier1Data}.RMICCPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier1}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                {/* <button type="button" >Refresh ICC</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={`${supplier1Data}.RMInventotyCost`}
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
                                    label={`RM ICC(%)`}
                                    name={`${supplier2Data}.RMICCPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier2}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                {/* <button type="button" >Refresh ICC</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={`${supplier2Data}.RMInventotyCost`}
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
                                    label={`RM ICC(%)`}
                                    name={`${supplier3Data}.RMICCPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCBaseSupplier3}
                                    required={true}
                                    className="withoutBorder rm-inventory"
                                    disabled={true}
                                />
                                {/* <button type="button" onClick={() => this.interestHandler(supplier3.value, 'supplierThree')} >Refresh ICC</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={`${supplier3Data}.RMInventotyCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.rmInventoryICCCostSupplier3}
                                    required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title={'(Sum of Heads) * ICC(%) / 100'}
                                />
                            </div>
                        </Col>
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}


                        {/* ----------------WIP inventory cost start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            WIP inventory cost (% on No of days)
                        </Col>
                        <Col md="3">
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
                                    label={`WIP ICC(%)`}
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
                                <label></label>
                                <input type="text" disabled value={this.state.wipInventoryCostZBC} className={'form-control overhead-percent-supplier'} title="(((WIP Inventorycost / 100) * TotalBOP) + NetRM + Tcc) * WIP Inventory Days) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`WIP ICC(%)`}
                                    name={`${supplier1Data}.WIPICCPercentage`}
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
                                    name={`${supplier1Data}.WIPInventotyCost`}
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
                                    label={`WIP ICC(%)`}
                                    name={`${supplier2Data}.WIPICCPercentage`}
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
                                    name={`${supplier2Data}.WIPInventotyCost`}
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
                                    label={`WIP ICC(%)`}
                                    name={`${supplier3Data}.WIPICCPercentage`}
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
                                    name={`${supplier3Data}.WIPInventotyCost`}
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
                        {/* ----------------WIP inventory cost end------------------- */}

                        {/* ----------------Payment terms Credit start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Payment terms Credit (No of days)
                        </Col>
                        <Col md="3">
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
                                    label={`Payment ICC(%)`}
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
                                <label></label>
                                <input type="text" disabled value={this.state.paymentCostZBC} className={'form-control overhead-percent-supplier'} title="((((WIP Inventory Cost) / 100) * (((((RM Inventory Cost) + (WIP Inventory Cost) + (Rejection Cost) + (Overhead Cost) + (Other Cost If Any) + (Packaging Cost) + (Freight Cost) +(Profit Cost))) + (Total BOP) + (Net Casting Cost ) + (Total Conversion Cost ))) * (Payment terms Credit )) / 365)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Payment ICC(%)`}
                                    name={`${supplier1Data}.PaymentTermsICCPercentage`}
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
                                    name={`${supplier1Data}.PaymentTermsCost`}
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
                                    label={`Payment ICC(%)`}
                                    name={`${supplier2Data}.PaymentTermsICCPercentage`}
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
                                    name={`${supplier2Data}.PaymentTermsCost`}
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
                                    label={`Payment ICC(%)`}
                                    name={`${supplier3Data}.PaymentTermsICCPercentage`}
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
                                    name={`${supplier3Data}.PaymentTermsCost`}
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
                        {/* ----------------Payment terms Credit end------------------- */}

                        {/* ----------------Profit start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            {'Profit (% on'}
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.profitBaseZBC} className={'form-control overhead-percent-zbc'} title="Profit Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.profitCostZBC} className={'form-control overhead-percent-zbc'} title="Profit Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Profit Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.ProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitCostSupplier1} className={'mt20 overhead-percent-supplier'} title="Profit Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.ProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Profit Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.ProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitCostSupplier2} className={'mt20 overhead-percent-supplier'} title="Profit Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.ProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitCostSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Profit Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.ProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.profitCostSupplier3} className={'mt20 overhead-percent-supplier'} title="Profit Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.ProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.profitCostSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Profit Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------------Profit ended------------------- */}


                        {/* ----------------Freight start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Freight
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={"freight-zbc"}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('freightHeads')}
                                    onChange={(e) => this.freightHeadsHandler(e, 1)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                <label></label>
                                <input type="text" value={this.state.freightBaseZBC} className={'form-control overhead-percent-supplier'} title="Enter Freight Amount" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.freightCostZBC} className={'form-control overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.FreightId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('freightHeads')}
                                    onChange={(e) => this.freightHeadsHandler(e, 1)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                {/* <input type="text" value={this.state.freightBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.InputFreight`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    onChange={(e) => this.freightAmountHandler(e, 1)}
                                    value={this.state.freightBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.freightCostSupplier1} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.NetFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.freightCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.FreightId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('freightHeads')}
                                    onChange={(e) => this.freightHeadsHandler(e, 2)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                {/* <input type="text" value={this.state.freightBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.InputFreight`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    onChange={(e) => this.freightAmountHandler(e, 2)}
                                    value={this.state.freightBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.freightCostSupplier2} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.NetFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.freightCostSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.FreightId`}
                                    type="text"
                                    placeholder={'---Select---'}
                                    //validate={[required]}
                                    // required={true}
                                    className=" withoutBorder custom-select"
                                    options={this.renderTypeOfListing('freightHeads')}
                                    onChange={(e) => this.freightHeadsHandler(e, 3)}
                                    optionValue={'Value'}
                                    optionLabel={'Text'}
                                    component={renderSelectField}
                                />
                                {/* <input type="text" value={this.state.freightBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.InputFreight`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={this.state.freightBaseSupplier3}
                                    onChange={(e) => this.freightAmountHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.freightCostSupplier3} className={'mt20 overhead-percent-supplier'} title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.NetFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    //value={this.state.freightCostSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="If Freight is perKG or perCubic than (Base Freight input * Freight) Otherwise (Freight / Base Freight input)"
                                />
                            </div>
                        </Col>
                        {/* ----------------Rejection (% on Matl + Conv.) end------------------- */}

                        {/* ----------------Additional Freight start------------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Additional Freight
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" value={this.state.additionalFreightBaseZBC} className={'form-control overhead-percent-supplier'} title="Enter Freight Amount" />
                                <button type="button" >Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.additionalFreightBaseSupplier1} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.NetAdditionalFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.AdditionalFreightCostHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                                <button type="button" onClick={() => this.AddFreightToggle(1)} >Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.additionalFreightBaseSupplier2} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.NetAdditionalFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.AdditionalFreightCostHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                                <button type="button" onClick={() => this.AddFreightToggle(2)} > Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.additionalFreightBaseSupplier3} className={'mt20 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.NetAdditionalFreightCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.AdditionalFreightCostHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />
                                <button type="button" onClick={() => this.AddFreightToggle(3)} >Add Freight</button>
                            </div>
                            <div className={'base-cost'}>
                                {''}
                            </div>
                        </Col>
                        {/* ----------------Additional Freight end------------------- */}
                    </Row>
                    {/* ------------------Other Cost end---------------- */}


                    {/* ------------------CED cost start---------------- */}
                    <Row className={'divider'} >
                        <Col>E) CED / Plating Other Operation costs</Col>
                    </Row>
                    <Row>
                        {/* --------------CED Cost ----------------- */}
                        <Col md="12" className={'dark-divider'}>
                            CED Cost
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseZBC} className={'form-control overhead-percent-supplier'} title="" />

                                <button type="button" title="Select CED Other Operation">CED Add</button>

                                <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseZBC} className={'form-control overhead-percent-supplier'} title="" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetZBC} className={'form-control overhead-percent-supplier'} title="" />

                                {/* <button type="button" title="Toggle Disabled">+</button> */}

                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostZBC} className={'form-control overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Operation`}
                                    name={`${supplier1Data}.CEDOperationName`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostOperationBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />

                                <button
                                    type="button"
                                    onClick={() => this.CEDotherOperationToggle(supplier.value, 'supplierOne')}
                                    title="Select CED Other Operation">CED Add</button>

                                {/* <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="" /> */}
                                <Field
                                    label={`Rate`}
                                    name={`${supplier1Data}.CEDOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostRateBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Net Surface Area`}
                                    name={`${supplier1Data}.NetSurfaceArea`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostNetSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />

                                {/* <button type="button" title="Toggle Disabled">+</button> */}

                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier1Data}.NetSurfaceAreaCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostCostSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Sum(Qty*Net Surface area)*(Operation Rate)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Operation`}
                                    name={`${supplier2Data}.CEDOperationName`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostOperationBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />

                                <button
                                    type="button"
                                    onClick={() => this.CEDotherOperationToggle(supplier2.value, 'supplierTwo')}
                                    title="Select CED Other Operation">CED Add</button>

                                {/* <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="" /> */}
                                <Field
                                    label={`Rate`}
                                    name={`${supplier2Data}.CEDOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostRateBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Net Surface Area`}
                                    name={`${supplier2Data}.NetSurfaceArea`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostNetSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />

                                {/* <button type="button" title="Toggle Disabled">+</button> */}

                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier2Data}.NetSurfaceAreaCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostCostSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Sum(Qty*Net Surface area)*(Operation Rate)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>Operation</label>
                                <input type="text" value={this.state.cedCostOperationBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Operation`}
                                    name={`${supplier3Data}.CEDOperationName`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostOperationBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter Freight Amount"
                                />

                                <button
                                    type="button"
                                    onClick={() => this.CEDotherOperationToggle(supplier3.value, 'supplierThree')}
                                    title="Select CED Other Operation">CED Add</button>

                                {/* <label>Rate</label>
                                <input type="text" value={this.state.cedCostRateBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="" /> */}
                                <Field
                                    label={`Rate`}
                                    name={`${supplier3Data}.CEDOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostRateBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Net Surface Area</label>
                                <input type="text" disabled value={this.state.cedCostNetSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Freight Amount" /> */}
                                <Field
                                    label={`Net Surface Area`}
                                    name={`${supplier3Data}.NetSurfaceArea`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostNetSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title=""
                                />

                                {/* <button type="button" title="Toggle Disabled">+</button> */}

                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedCostCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Sum(Qty*Net Surface area)*(Operation Rate)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier3Data}.NetSurfaceAreaCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedCostCostSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Sum(Qty*Net Surface area)*(Operation Rate)"
                                />
                            </div>
                        </Col>
                        {/* ------------------CED Cost end---------------- */}

                        {/* ------------------Transportation Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Transportation Cost
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseZBC} className={'form-control overhead-percent-supplier'} title="Transportation Rate" />

                                <label>Net FinishWt</label>
                                <input type="text" value={this.state.TransCostFinishWtBaseZBC} className={'form-control overhead-percent-supplier'} title="Net Finish Wt/Component" />
                                {/* <button type="button" title="Toggle Disable">+</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostZBC} className={'form-control overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" /> */}
                                <Field
                                    label={`Trans. Rate`}
                                    name={`${supplier1Data}.TransportationOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderText}
                                    value={this.state.TransCostRateBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder  overhead-percent-supplier"
                                    disabled={true}
                                    title="Transportation Rate"
                                />

                                <Field
                                    label={`Net FinishWt`}
                                    name={`${supplier1Data}.TransportationOperationFinishWeight`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderNumberInputField}
                                    value={this.state.TransCostFinishWtBaseSupplier1}
                                    onChange={(e) => this.transportationCostFinishWtHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Net Finish Wt/Component"
                                />
                                {/* <button type="button" title="Toggle Disable">+</button> */}
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.TransCostCostSupplier1} className={'mt10 overhead-percent-supplier'} title=" Sum(Qty*Finish Wt/Comp)*(Transportation Rate)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier1Data}.TransportationOperationCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.TransCostCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Sum(Qty*Finish Wt/Comp)*(Transportation Rate)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>Trans. Rate</label>
                                <input type="text" disabled value={this.state.TransCostRateBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Transportation Rate" /> */}
                                <Field
                                    label={`Trans. Rate`}
                                    name={`${supplier2Data}.TransportationOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.TransCostRateBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Transportation Rate"
                                />

                                <Field
                                    label={`Net FinishWt`}
                                    name={`${supplier2Data}.TransportationOperationFinishWeight`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderNumberInputField}
                                    value={this.state.TransCostFinishWtBaseSupplier2}
                                    onChange={(e) => this.transportationCostFinishWtHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    //disabled={true}
                                    title="Net Finish Wt/Component"
                                />
                                {/* <button type="button" title="Toggle Disable">+</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={`${supplier2Data}.TransportationOperationCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.TransCostCostSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Sum(Qty*Finish Wt/Comp)*(Transportation Rate)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <Field
                                    label={`Trans. Rate`}
                                    name={`${supplier3Data}.TransportationOperationRate`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.TransCostRateBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Transportation Rate"
                                />

                                <Field
                                    label={`Net FinishWt`}
                                    name={`${supplier3Data}.TransportationOperationFinishWeight`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderNumberInputField}
                                    value={this.state.TransCostFinishWtBaseSupplier3}
                                    onChange={(e) => this.transportationCostFinishWtHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    //disabled={true}
                                    title="Net Finish Wt/Component"
                                />
                                {/* <button type="button" title="Toggle Disable">+</button> */}
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={`Cost`}
                                    name={`${supplier3Data}.TransportationOperationCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.TransCostCostSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Sum(Qty*Finish Wt/Comp)*(Transportation Rate)"
                                />
                            </div>
                        </Col>
                        {/* ----------Transportation Cost end ----------------- */}


                        {/* ------------------CED Overhead/Profit Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            CED Overhead/Profit Cost
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseZBC} className={'form-control overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" />
                            </div>
                            <div className={'base-cost'}>
                                <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostZBC} className={'form-control overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={`OH/Profit (%)`}
                                    name={`${supplier1Data}.OverheadProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHProfitBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder  overhead-percent-supplier"
                                    disabled={true}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier1Data}.OverheadProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHCostSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={`OH/Profit (%)`}
                                    name={`${supplier2Data}.OverheadProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHProfitBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier2Data}.OverheadProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHCostSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <label>OH/Profit (%)</label>
                                <input type="text" disabled value={this.state.cedOHProfitBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={`OH/Profit (%)`}
                                    name={`${supplier3Data}.OverheadProfitPercentage`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHProfitBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <label>Cost</label>
                                <input type="text" disabled value={this.state.cedOHCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={`Cost`}
                                    name={`${supplier3Data}.OverheadProfitCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedOHCostSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
                            </div>
                        </Col>
                        {/* ----------CED Overhead/Profit Cost end ----------------- */}


                        {/* ------------------CED Remarks start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Remarks
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedCostRemarksZBC} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedCostRemarksSupplier1} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier1Data}.CEDRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.CEDRemarksHandler(e, 1)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedCostRemarksSupplier2} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier2Data}.CEDRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.CEDRemarksHandler(e, 2)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedCostRemarksSupplier3} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier3Data}.CEDRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.CEDRemarksHandler(e, 3)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        {/* ----------CED Remarks end ----------------- */}


                    </Row>
                    <Row className={'dark-divider'} >
                        <Col md="12" className={'dark-divider'}>
                            CED Total Cost
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" disabled value={this.state.cedTotalZBC} className={'form-control overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.cedTotalSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.CEDtotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedTotalSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.cedTotalSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.CEDtotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedTotalSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.cedTotalSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost) " /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.CEDtotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.cedTotalSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="(CED Cost) + (Transportation Cost) + (CED O/H - Profit Cost)"
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12" className={'dark-divider'}>
                            Packaging Cost
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" value={this.state.packagingCostZBC} className={'form-control overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>

                                <Field
                                    label={``}
                                    name={`${supplier1Data}.PackagingCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.packageCostingHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>

                                <Field
                                    label={``}
                                    name={`${supplier2Data}.PackagingCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.packageCostingHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>

                                <Field
                                    label={``}
                                    name={`${supplier3Data}.PackagingCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.packageCostingHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>

                        {/* ------------------CED Total Remarks start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Remarks
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                <textarea value={this.state.cedTotalRemarksZBC} className={'mt10 overhead-percent-supplier'} />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedTotalRemarksSupplier1} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier1Data}.PackagingRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.packagingRemarksHandler(e, 1)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedTotalRemarksSupplier2} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier2Data}.PackagingRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.packagingRemarksHandler(e, 2)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.cedTotalRemarksSupplier3} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier3Data}.PackagingRemarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.packagingRemarksHandler(e, 3)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        {/* ----------CED Total Remarks end ----------------- */}

                        {/* ------------------Other Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Other cost if Any
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" value={this.state.otherCostZBC} className={'form-control overhead-percent-supplier'} title="Enter Packaging Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.otherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.OtherAnyCostAndCharges`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.anyOtherCostHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.otherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.OtherAnyCostAndCharges`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.anyOtherCostHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.otherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Packaging Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.OtherAnyCostAndCharges`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.anyOtherCostHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={false}
                                    title="Enter Packaging Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                        {/* ------------------Other Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Total Other Costs
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" disabled value={this.state.totalOtherCostZBC} className={'form-control overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.totalOtherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.TotalOtherCosts`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalOtherCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.totalOtherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.TotalOtherCosts`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalOtherCostSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.totalOtherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.TotalOtherCosts`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalOtherCostSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Overhead% Cost + Rejection% Cost + RM Inventory Cost + WIP Inventory Cost + Payment Terms Credit cost + Profit% Cost + Freight Cost + Packaging Cost + Other Cost If Any"
                                />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                    </Row>
                    {/* ----------------CED / Plating Other Operation end------------------- */}


                    {/* ----------------Tool costs start------------------- */}
                    <Row className={'divider'}>
                        <Col>F) Tool costs</Col>
                    </Row>
                    <Row>
                        {/* ------------------Other Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Tool Cost
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" disabled value={this.state.toolCostZBC} className={'form-control overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.toolCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.ToolCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.toolCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Tool Maintenance Cost + Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.toolCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.ToolCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.toolCostSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Tool Maintenance Cost + Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.toolCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Tool Maintenance Cost + Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.ToolCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.toolCostSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Tool Maintenance Cost + Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------Other Cost end ----------------- */}

                        {/* ------------------Tool Maintenance Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Tool Maintenance Cost
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" value={this.state.toolMaintenanceZBC} className={'form-control overhead-percent-supplier'} title="Enter Tool Maintenance Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.ToolMaintenanceCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolMaintenanceHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Maintenance Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.ToolMaintenanceCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolMaintenanceHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Maintenance Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Maintenance Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.ToolMaintenanceCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolMaintenanceHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Maintenance Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------Tool Maintenance Cost end ----------------- */}

                        {/* ------------------Tool Amortization Cost start---------------- */}
                        <Col md="12" className={'dark-divider'}>
                            Tool Amortization Cost
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" value={this.state.toolMaintenanceZBC} className={'form-control overhead-percent-supplier'} title="Enter Tool Amortization Cost" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.ToolAmortizationCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolAmortizationHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.ToolAmortizationCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolAmortizationHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.toolMaintenanceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.ToolAmortizationCost`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.toolAmortizationHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder"
                                    //disabled={true}
                                    title="Enter Tool Amortization Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------Tool Amortization Cost Cost end ----------------- */}

                        {/* ------------------Total Cost start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Total Cost
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" value={this.state.totalCostZBC} className={'form-control overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.totalCostSupplier1} className={'mt10 overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.TotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalCostSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.totalCostSupplier2} className={'mt10 overhead-percent-supplier'} title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.TotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalCostSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" value={this.state.totalCostSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.TotalCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.totalCostSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Conversion Cost + Total Other Costs + Tool Maintenance Cost + Total BOP Cost+ Net RM Cost + CED Total Cost + Additional Freight"
                                />
                            </div>
                        </Col>
                        {/* ----------Total Cost end ----------------- */}

                        {/* ------------------Hundi/ Other Discount start---------------- */}
                        <Col md="1">
                            Hundi/ Other Discount
                        </Col>
                        <Col md="2">
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" value={this.state.hundiBaseZBC} className={'form-control overhead-percent-supplier'} title="Enter Hundi/Other Discount in Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.hundiCostZBC} className={'form-control overhead-percent-supplier'} title="(Total Cost * Hundi or Other Discount)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.hundiBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.Discount`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.discountHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.hundiCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.DiscountCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.hundiBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.Discount`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.discountHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.hundiCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.DiscountCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.hundiBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter CED Overhead/Profit (%)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.Discount`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.discountHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Enter CED Overhead/Profit (%)"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.hundiCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(CED Cost)*(CED O/H - Profit %)" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.DiscountCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(CED Cost)*(CED O/H - Profit %)"
                                />
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
                                <label></label>
                                <input type="text" disabled value={this.state.otherBaseZBC} className={'form-control overhead-percent-supplier'} title="Other Base" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.otherCostZBC} className={'form-control overhead-percent-supplier'} title="(Total Cost * Other Base)/100" />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Other Base" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.OtherBaseCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherBaseSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Other Base"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherCostSupplier1} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.OtherBaseCostPercent`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherCostSupplier1}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(Total Cost * Other Base)/100"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Other Base" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.OtherBaseCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherBaseSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Other Base"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherCostSupplier2} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.OtherBaseCostPercent`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherCostSupplier2}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(Total Cost * Other Base)/100"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherBaseSupplier3} className={'mt10 overhead-percent-supplier'} title="Other Base" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.OtherBaseCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherBaseSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Other Base"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.otherCostSupplier3} className={'mt10 overhead-percent-supplier'} title="(Total Cost * Other Base)/100" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.OtherBaseCostPercent`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.otherCostSupplier3}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="(Total Cost * Other Base)/100"
                                />
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
                                {/* <textarea value={this.state.totalCostRemarksSupplier1} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier1Data}.Remarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.remarksHandler(e, 1)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.totalCostRemarksSupplier2} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier2Data}.Remarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.remarksHandler(e, 2)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className={'remarks'}>
                                {/* <textarea value={this.state.totalCostRemarksSupplier3} className={'mt10 overhead-percent-supplier'} /> */}
                                <Field
                                    label={''}
                                    name={`${supplier3Data}.Remarks`}
                                    placeholder="Type your message here..."
                                    //onChange={this.handleMessageChange}
                                    value={0}
                                    className="withoutBorder"
                                    //validate={[required, maxLength5000]}
                                    onChange={(e) => this.remarksHandler(e, 3)}
                                    component={renderTextAreaField}
                                    //required={true}
                                    maxLength="5000"
                                />
                            </div>
                        </Col>
                        {/* ----------Total cost Remarks end ----------------- */}


                        {/* ------------------Net PO Price start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Net PO Price
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'full-width'}>
                                <label></label>
                                <input type="text" disabled value={this.state.netPOPriceZBC} className={'form-control overhead-percent-supplier'} title="Total Cost - Hundi Cost" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.netPOPriceSupplier1} className={'mt10 overhead-percent-supplier'} title="Total Cost - Hundi Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.NetPurchaseOrderPrice`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.netPOPriceSupplier1}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Cost - Hundi Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.netPOPriceSupplier2} className={'mt10 overhead-percent-supplier'} title="Total Cost - Hundi Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.NetPurchaseOrderPrice`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.netPOPriceSupplier2}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Cost - Hundi Cost"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'full-width'}>
                                {/* <input type="text" disabled value={this.state.netPOPriceSupplier3} className={'mt10 overhead-percent-supplier'} title="Enter Tool Amortization Cost" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.NetPurchaseOrderPrice`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={this.state.netPOPriceSupplier3}
                                    //required={true}
                                    className="withoutBorder"
                                    disabled={true}
                                    title="Total Cost - Hundi Cost"
                                />
                            </div>
                        </Col>
                        {/* ----------Net PO Price end ----------------- */}

                        {/* ------------------Landed Factor(%) start---------------- */}
                        <Col md="1" className={'dark-divider'}>
                            Landed Factor(%)
                        </Col>
                        <Col md="2" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" value={this.state.landedFactorBaseZBC} className={'form-control overhead-percent-supplier'} title="Landed Factor Percent" />
                            </div>
                            <div className={'base-cost'}>
                                <label></label>
                                <input type="text" disabled value={this.state.landedFactorCostZBC} className={'form-control overhead-percent-supplier not-allowed'} title="Landed Factor Percent" />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.landedFactorBaseSupplier1} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.LandedFactorPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.landedFactorHandler(e, 1)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Landed Factor Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                {/* <input type="text" disabled value={this.state.landedFactorCostSupplier1} className={'mt10 overhead-percent-supplier not-allowed'} title="Landed Factor Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier1Data}.LandedFactorCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Landed Factor Percent"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                {/* <input type="text" value={this.state.landedFactorBaseSupplier2} className={'mt10 overhead-percent-supplier'} title="Landed Factor Percent" /> */}
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.LandedFactorPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.landedFactorHandler(e, 2)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Landed Factor Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier2Data}.LandedFactorCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Landed Factor Percent"
                                />
                            </div>
                        </Col>
                        <Col md="3" className={'dark-divider'}>
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.LandedFactorPercentage`}
                                    type="text"
                                    placeholder={''}
                                    validate={[number]}
                                    component={renderNumberInputField}
                                    value={0}
                                    onChange={(e) => this.landedFactorHandler(e, 3)}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={false}
                                    title="Landed Factor Percent"
                                />
                            </div>
                            <div className={'base-cost'}>
                                <Field
                                    label={``}
                                    name={`${supplier3Data}.LandedFactorCost`}
                                    type="text"
                                    placeholder={''}
                                    //validate={[required]}
                                    component={renderText}
                                    value={0}
                                    //required={true}
                                    className="withoutBorder overhead-percent-supplier"
                                    disabled={true}
                                    title="Landed Factor Percent"
                                />
                            </div>
                        </Col>
                        {/* <hr /> */}
                        {/* ----------Landed Factor(%) end ----------------- */}

                    </Row>
                    <hr />
                    {/* ----------------Tool costs end------------------- */}

                    <Row>
                        <Col md="3" className={'divider'}>
                            {/* <div>ZBC</div> */}
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
                            <button type={'button'} className={'btn btn-primary'}>Send For Approval</button>
                            {/* <button className={'btn btn-warning'}>Copy Costing</button> */}
                        </Col>
                        <Col md="3" >
                            <button type={'button'} onClick={() => this.saveCosting(1)} className={'btn btn-primary mr5'}>Save</button>
                            <button
                                type={'button'}
                                disabled={SupplierOneCostingStatus ? true : false}
                                onClick={() => this.sendApproval(1)}
                                className={'btn btn-primary'}>Send For Approval</button>
                            {/* <button className={'btn btn-warning'}>Copy Costing</button> */}
                        </Col>
                        <Col md="3" >
                            <button type={'button'} onClick={() => this.saveCosting(2)} className={'btn btn-primary mr5'}>Save</button>
                            <button
                                type={'button'}
                                disabled={SupplierTwoCostingStatus ? true : false}
                                onClick={() => this.sendApproval(2)}
                                className={'btn btn-primary'}>Send For Approval</button>
                            {/* <button className={'btn btn-warning'}>Copy Costing</button> */}
                        </Col>
                        <Col md="3" >
                            <button type={'button'} onClick={() => this.saveCosting(3)} className={'btn btn-primary mr5'}>Save</button>
                            <button
                                type={'button'}
                                disabled={SupplierTwoCostingStatus ? true : false}
                                onClick={() => this.sendApproval(3)}
                                className={'btn btn-primary'}>Send For Approval</button>
                            {/* <button className={'btn btn-warning'}>Copy Costing</button> */}
                        </Col>
                    </Row>
                    <hr />

                </form>
                {isShowOtherOpsModal && <OtherOperationsModal
                    isOpen={isShowOtherOpsModal}
                    onCancel={this.onCancel}
                    supplierIdForOtherOps={supplierIdForOtherOps}
                    supplierColumn={supplierColumn}
                />}
                {isShowCEDotherOpsModal && <CEDotherOperations
                    isOpen={isShowCEDotherOpsModal}
                    onCancelCEDotherOps={this.onCancelCEDotherOps}
                    supplierIdForCEDOtherOps={supplierIdForCEDOtherOps}
                    supplierColumn={supplierColumn}
                />}
                {isShowFreightModal && <AddFreightModal
                    isOpen={isShowFreightModal}
                    onCancelFreight={this.onCancelFreight}
                    supplierColumn={supplierColumn}
                    supplierId={this.state.supplierId}
                />}
                {isOpenSendForApproval && <Approval
                    isOpen={isOpenSendForApproval}
                    onCancelApproval={this.onCancelApproval}
                    costingId={sendForApprovalCostingId}
                    supplierId={sendForApprovalSupplierId}
                />}
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const sobObject = selector(state, 'ShareOfBusiness1', 'ShareOfBusiness2', 'ShareOfBusiness3');
    const { comman, costing, interestRate } = state;
    const { interestRateList } = interestRate;
    const { plantList, technologyList, modelTypes, costingHead } = comman;

    if (costing && costing.plantComboDetail) {
        const { loading, existingSupplierDetail, costingData, FreightHeadsList, FreightData } = costing;
        const { Plants, Parts, Suppliers, ZBCSupplier } = costing.plantComboDetail;

        return {
            technologyList,
            plantList,
            Plants,
            Parts,
            Suppliers,
            ZBCSupplier,
            existingSupplierDetail,
            costingData,
            modelTypes,
            costingHead,
            interestRateList,
            FreightHeadsList,
            FreightData,
            sobObject,
            loading,
            //initialValues
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
    getInterestRateAPI,
    setInventoryRowData,
    getCostingOverHeadProByModelType,
    saveCosting,
    fetchFreightHeadsAPI,
    getCostingFreight,
    emptyCostingData,
})(reduxForm({
    form: 'CostSummary',
    enableReinitialize: true,
})(CostSummary));

