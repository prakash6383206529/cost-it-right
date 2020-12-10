import React, { Fragment } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import AddToComparisonDrawer from './AddToComparisonDrawer'
import { getSingleCostingDetails, setCostingViewData } from '../actions/Costing';
import { useEffect, useState } from 'react';

const arr = [
    {
        zbc: "ZBC v/s VBC",
        costingName: "",
        poPrice: "PO Price",
        status: "Status",
        rm: "RM name-Grade",
        gWeight: "Gross Weight",
        fWeight: "Finish Weight",
        netRM: "Net RM Cost",
        netBOP: "Net BOP Cost",
        pCost: "Process Cost",
        oCost: "Operation Cost",
        sTreatment: "Surface Treatment",
        tCost: "Transportation Cost",
        nConvCost: "Net Conversion Cost",
        modelType: "Model Type For Overhead/Profit",
        aValue: "",
        overheadOn: "Overhead On",
        profitOn: "Profit On",
        rejectionOn: "Rejection On",
        iccOn: "ICC On",
        paymentTerms: "Payment Terms",
        nOverheadProfit: "Net Overhead Profits",
        packagingCost: "Packaging Cost",
        freight: "Freight",
        nPackagingAndFreight: "Net Packaging and Freight",
        toolMaintenanceCost: "Tool Maintenance Cost",
        toolPrice: "Tool Price",
        amortizationQty: "Amortization Quantity",
        totalToolCost: "Total Tool Cost",
        totalCost: "Total Cost",
        otherDiscount: "Hundi/Other Discount",
        otherDiscountValue: "",
        anyOtherCost: "Any Other Cost",
        remark: "Remark",
        nPOPriceWithCurrency: "Net PO Price(INR)",
        currency: "Currency",
        nPOPrice: "Net PO Price",
        attachment: "Attachment",
        approvalButton: ""

    },
    {
        zbc: "ZBC",
        poPrice: "250000.00",
        costingName: "Costing 1",
        status: "Draft",
        rm: "Raw1-B1",
        gWeight: "77",
        fWeight: "70",
        netRM: "4029.00",
        netBOP: "3.05",
        pCost: "40.00",
        oCost: "25.00",

        sTreatment: "18.00",
        tCost: "2.00",
        nConvCost: "85.00",
        modelType: "All",
        aValue: {
            applicability: "Applicability",
            value: "Value"
        },
        overheadOn: {
            overheadTitle: "RM+CC+BOP",
            overheadValue: "150.00"
        },
        profitOn: {
            profitTitle: "RM+CC+BOP",
            profitValue: "150.00"
        },
        rejectionOn: {
            rejectionTitle: "RM+CC+BOP",
            rejectionValue: "150.00"
        },
        iccOn: {
            iccTitle: "RM Inventory",
            iccValue: "250.00"
        },
        paymentTerms: {
            paymentTitle: "Net Cost",
            paymentValue: "250.00"
        },
        nOverheadProfit: "950.00",
        packagingCost: "40.00",
        freight: "75.00",
        nPackagingAndFreight: "115.00",
        toolMaintenanceCost: "600.00",
        toolPrice: "5000.00",
        amortizationQty: "10",
        totalToolCost: "1100.00",
        totalCost: "6282.25",
        otherDiscount: {
            discount: "Discount %",
            value: "Value"
        },
        otherDiscountValue: {
            discountPercentValue: "5%",
            discountValue: "314.11"
        },
        anyOtherCost: "500.00",
        remark: "Test Remark",
        nPOPriceWithCurrency: "7096.36",
        currency: {
            currencyTitle: "INR/EUR",
            currencyValue: "85"
        },
        nPOPrice: "7096.36",
        attachment: "View Attachment",
        approvalButton: "Button"
    }
]

const CostingSummaryTable = props => {
    const [addComparisonToggle, setaddComparisonToggle] = useState(false)
    const viewCostingData = useSelector(state => state.costing.viewCostingDetailData)
    console.log('ViewCostingData: ', viewCostingData);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', res => {
            console.log(res.data.Data, "Response of the API")
            if (res.data.Data) {
                console.log("HIii")
                let temp = viewCostingData;
                let dataFromAPI = res.data.Data
                console.log('dataFromAPI: ', dataFromAPI);
                let obj = {};
                obj.zbc = "ZBC";
                obj.poPrice = dataFromAPI.NetPOPrice;
                obj.costingName = dataFromAPI.CostingNumber
                obj.status = dataFromAPI.CostingStatus
                obj.rm = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].RMName
                obj.gWeight = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.GrossWeight
                obj.fWeight = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.FinishWeight
                obj.netRM = dataFromAPI.NetRawMaterialsCost
                obj.netBOP = dataFromAPI.NetBoughtOutPartCost
                obj.pCost = dataFromAPI.NetProcessCost
                obj.oCost = dataFromAPI.NetOperationCost
                obj.sTreatment = dataFromAPI.NetSurfaceTreatmentCost
                obj.tCost = dataFromAPI.CostingPartDetails[0].TransportationCost
                obj.nConvCost = dataFromAPI.NetConversionCost
                obj.modelType = dataFromAPI.ModelType
                obj.aValue= {
                    applicability: "Applicability",
                    value: "Value"
                }
                obj.overheadOn = {
                    overheadTitle: dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadApplicability,
                    overheadValue: (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadCCTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadCCTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadBOPTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadBOPTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadRMTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadRMTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadFixedTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadFixedTotalCost) : 0) 
                }
                obj.profitOn = {
                    profitTitle: dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitApplicability,
                    profitValue: (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitCCTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitCCTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitBOPTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitBOPTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitRMTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitRMTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitFixedTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitFixedTotalCost) : 0)
                }
                obj.rejectionOn = {
                    rejectionTitle: dataFromAPI.CostingPartDetails[0].CostingRejectionDetail.RejectionApplicability,
                    rejectionValue: dataFromAPI.CostingPartDetails[0].CostingRejectionDetail.RejectionTotalCost
                }
                obj.iccOn = {
                    iccTitle: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability,
                    iccValue: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.ICCApplicabilityDetail.NetCost
                }
                obj.paymentTerms = {
                    paymentTitle: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability,
                    paymentValue: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.PaymentTermDetail.NetCost
                }
                obj.nOverheadProfit = dataFromAPI.NetOverheadAndProfitCost
                obj.packagingCost = dataFromAPI.CostingPartDetails[0].PackagingNetCost
                obj.freight = dataFromAPI.CostingPartDetails[0].FreightNetCost
                obj.nPackagingAndFreight = dataFromAPI.NetPackagingAndFreight
                obj.toolMaintenanceCost = dataFromAPI.NetToolCost
                obj.toolPrice = "5000.00"
                obj.amortizationQty = "10"
                obj.totalToolCost = dataFromAPI.NetToolCost
                obj.totalCost = dataFromAPI.TotalCost
                obj.otherDiscount = {
                    discount: "Discount %",
                    value: "Value"
                }
                obj.otherDiscountValue = {
                    discountPercentValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountPercentage ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountPercentage : "-",
                    discountValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountValue ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountValue : "-"
                }
                obj.anyOtherCost = dataFromAPI.CostingPartDetails[0].OtherCostDetails.TotalOtherCost ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.TotalOtherCost : "-"
                obj.remark = dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark : "-"
                obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceOtherCurrency ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceOtherCurrency : "-"
                obj.currency = {
                    currencyTitle: "INR/EUR",
                    currencyValue: "85"
                }
                obj.nPOPrice = dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceINR ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceINR : "-"
                obj.attachment = "View Attachment"
                obj.approvalButton = "Button"

                console.log('obj: ', obj);
                temp.push(obj);
                console.log('temp: ', temp);
                dispatch(setCostingViewData(temp));
            }
        }))
    }, [])

/**
* @method addComparisonDrawerToggle
* @description HANDLE ADD TO COMPARISON DRAWER TOGGLE
*/

const addComparisonDrawerToggle = () => {
    setaddComparisonToggle(true)
 }
/**
* @method closeAddComparisonDrawer
* @description HIDE ADD COMPARISON DRAWER
*/
 const closeAddComparisonDrawer = (e = '') => {
    setaddComparisonToggle(false)
}
    useEffect(() => {}, [viewCostingData])
    const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm();
    return (
        <Fragment>
            <Row>
                <Col md="4">
                    <div className="left-border">
                        {'Summary'}
                    </div>
                </Col>
                <Col md="4">
                    <button>{"Send For Approval"}</button>
                </Col>
                <Col md="4">
                <button
                 type="button"
                 className={'user-btn'}
                 onClick={addComparisonDrawerToggle}>
                <div className={'plus'}></div>Add To Comparison
                </button>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <table>
                        {viewCostingData.map((data, index) => {
                            return (
                                <Fragment>
                                    <tr>
                                        <th>{data.zbc}</th>
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>Test</td> : <td>{data.costingName}</td>}
                                    </tr>
                                    <tr>
                                        <td>{data.poPrice}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.status}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.rm}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.gWeight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.fWeight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.netRM}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.netBOP}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.pCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.oCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.sTreatment}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.tCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.nConvCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.modelType}</td>
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>Test</td> : <td><div>
                                            <span>{data.aValue.applicability}</span> &nbsp; <span>{data.aValue.value}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.overheadOn}</td> : <td><div>
                                            <span>{data.overheadOn.overheadTitle}</span> &nbsp; <span>{data.overheadOn.overheadValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.profitOn}</td> : <td><div>
                                            <span>{data.profitOn.profitTitle}</span> &nbsp; <span>{data.profitOn.profitValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.rejectionOn}</td> : <td><div>
                                            <span>{data.rejectionOn.rejectionTitle}</span> &nbsp; <span>{data.rejectionOn.rejectionValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.iccOn}</td> : <td><div>
                                            <span>{data.iccOn.iccTitle}</span> &nbsp; <span>{data.iccOn.iccValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.paymentTerms}</td> : <td><div>
                                            <span>{data.paymentTerms.paymentTitle}</span> &nbsp; <span>{data.paymentTerms.paymentValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        <td>{data.nOverheadProfit}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.packagingCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.freight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.nPackagingAndFreight}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.toolMaintenanceCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.toolPrice}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.amortizationQty}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.totalToolCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.totalCost}</td>
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.otherDiscount}</td> : <td><div>
                                            <span>{data.otherDiscount.discount}</span> &nbsp; <span>{data.otherDiscount.value}</span></div></td>}
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.otherDiscountValue}</td> : <td><div>
                                            <span>{data.otherDiscountValue.discountPercentValue}</span> &nbsp; <span>{data.otherDiscountValue.discountValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        <td>{data.anyOtherCost}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.remark}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.nPOPriceWithCurrency}</td>
                                    </tr>
                                    <tr>
                                        {index == 0 ? <td>{data.currency}</td> : <td><div>
                                            <span>{data.currency.currencyTitle}</span> &nbsp; <span>{data.currency.currencyValue}</span></div></td>}
                                    </tr>
                                    <tr>
                                        <td>{data.nPOPrice}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.attachment}</td>
                                    </tr>
                                    <tr>
                                        <td>{data.approvalButton}</td>
                                    </tr>
                                </Fragment>
                            )
                        })}
                    </table>
                </Col>
            </Row>
            {
         addComparisonToggle && 
         <AddToComparisonDrawer 
          isOpen = {addComparisonToggle}
          closeDrawer = {closeAddComparisonDrawer}
          isEditFlag = {false}
          anchor = {'right'}
          />
      }
        </Fragment>
    )
}

export default CostingSummaryTable;