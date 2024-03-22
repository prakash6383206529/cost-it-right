import React from 'react';
import { showBopLabel } from '../../../helper';

export function Steps(t, params, config) {
    const introWithBOPDynamicValue = (intro) => intro.replace(/bop|BOP/gi, showBopLabel());
    let CostingEditMode = false
    let CostingViewMode = false
    let PartExists = false
    let viewButton = true
    let editButton = true
    let viewBomButton = true
    let isPartLocked = false
    let showCostingSummaryExcel = false
    let isSuperAdmin = false
    const technology = Number(config?.technology?.value) === 13 ? true : false;
    const disableCostingSummaryDetailedPdf = !config?.viewCostingData || config.viewCostingData.length === 0;
    if (config) {
        PartExists = config.PartExists !== undefined ? config.PartExists : false;
        viewButton = config.viewButton !== undefined ? config.viewButton : true;
        editButton = config.editButton !== undefined ? config.editButton : true;
        viewBomButton = config.viewBomButton !== undefined ? config.viewBomButton : true;
        isPartLocked = config.isPartLocked !== undefined ? config.isPartLocked : false;
        showCostingSummaryExcel = config.showCostingSummaryExcel !== undefined ? config.showCostingSummaryExcel : false;
        isSuperAdmin = config.isSuperAdmin !== undefined ? config.isSuperAdmin : false;
        CostingViewMode = config.CostingViewMode !== undefined ? config.CostingViewMode : false;
        CostingEditMode = config.CostingEditMode !== undefined ? config.CostingEditMode : false;


    }

    return {

        COSTING_INITIAL: [
            {
                element: `.${params} .input-container #Technology_container`,
                intro: t("costingInitial.Technology"),
            },
            {
                element: `.${params} .input-container #PartType_container`,
                intro: t("costingInitial.PartType"),
            },
            {
                element: `.${params} .input-container #Part_container`,
                intro: t("costingInitial.Part"),
            },
            {
                element: `.${params} #costing-cancel`,
                intro: t("costingInitial.clear"),
                position: "left"
            },
        ],
        COSTING_STEP_TWO: [
            {
                element: "#ZBC_Costing_Add_Plant",
                intro: t("costingStepTwo.zbc"),
                position: "left"
            },
            {
                element: "#NCC_Costing_Add_Vendor",
                intro: t("costingStepTwo.ncc"),
                position: "left"
            },
            {
                element: "#VBC_Costing_Add_Vendor",
                intro: t("costingStepTwo.vbc"),
                position: "left"
            },
            {
                element: "#CBC_Costing_Add_Customer",
                intro: t("costingStepTwo.cbc"),
                position: "left"
            },
            {
                element: "#WAC_Costing_Add_Plant",
                intro: t("costingStepTwo.wac"),
                position: "left"
            },
        ],
        VENDOR_COSTING_GRID: [
            {
                element: `.costing-table-${params} .edit-sob-btn`,
                intro: t("vendorCreateCosting.editSob"),
            },
            {
                element: `.costing-table-${params} .Costing-version-0`,
                intro: t("vendorCreateCosting.version"),
            },
            {
                element: `.costing-table-${params} .Add-file`,
                intro: t("vendorCreateCosting.createCosting"),
            },
            {
                element: `.costing-table-${params} .View`,
                intro: t("vendorCreateCosting.viewCosting"),
            },
            {
                element: `.costing-table-${params} .Edit`,
                intro: t("vendorCreateCosting.editCosting"),
            },
            {
                element: `.costing-table-${params} .Copy`,
                intro: t("vendorCreateCosting.copyCosting"),
            },
            {
                element: `.costing-table-${params} .Delete`,
                intro: t("vendorCreateCosting.deleteCosting"),
            },
            {
                element: `.costing-table-${params} .CancelIcon`,
                intro: t("vendorCreateCosting.discard"),
            },
        ],
        COSTING_TABS: [
            {
                element: "#costing_effective_date",
                intro: t("costingTabs.effectiveDate"),
            },
            {
                element: '#RMC_tabs',
                intro: t("costingTabs.RMC_tabs")
            },
            {
                element: '#Surface_Treatment_tabs',
                intro: t("costingTabs.Surface_Treatment_tabs")
            },
            {
                element: '#Overheads_Profits_tabs',
                intro: t("costingTabs.Overheads_Profits_tabs")
            },
            {
                element: '#Packaging_Freight_tabs',
                intro: t("costingTabs.Packaging_Freight_tabs")
            },
            {
                element: '#Tool_tabs',
                intro: t("costingTabs.Tool_tabs")
            },
            {
                element: '#Discount_Other_tabs',
                intro: t("costingTabs.Discount_Other_tabs")
            },
            ...(config && config.assembly ? [
                ...(config && config.bopHandling ? [
                    {
                        element: "#Add_BOP_Handling_Charge",
                        intro: t("RMCtabs.AddBOPHandlingCharge"),
                    },
                ] : []),
                {
                    element: "#assembly_addOperation",
                    intro: t("RMCtabs.AssemblyAddOperation"),
                    position: 'left'
                },

            ] : []),
        ],
        TAB_RMC: [
            ...(isPartLocked ? [
                {
                    element: '#lock_icon',
                    intro: t("RMCtabs.PartLocked"),

                },
            ] : []),
            ...(!PartExists || !isPartLocked ? [
                ...(CostingViewMode === false && CostingEditMode === false) ? [

                    {
                        element: '#Costing_addRM',
                        intro: t("RMCtabs.AddRM"),
                        position: "left"
                    },

                    {
                        element: '#Costing_addBOP',
                        intro: t("RMCtabs.AddBOP"),
                        position: "left"
                    },


                    {
                        element: '#Costing_addProcess',
                        intro: t("RMCtabs.AddProcess"),
                        position: "left"
                    },

                    {
                        element: '#Costing_addOperation',
                        intro: t("RMCtabs.AddOperation"),
                        position: "left"
                    },


                    {
                        element: '#Costing_addOtherOperation',
                        intro: t("RMCtabs.AddOtherOperation"),
                        position: "left"
                    },
                ] : []
            ] : []),



        ],
        TAB_PARTCOST: [
            ...(config && config.bopHandling ? [
                {
                    element: "#Add_BOP_Handling_Charge",
                    intro: introWithBOPDynamicValue(t("RMCtabs.AddBOPHandlingCharge")),
                },
            ] : []),
            {
                element: "#Add_Assembly_Process",
                intro: t("RMCtabs.AddProcess"),
            },
            {
                element: "#Costing_addOperation",
                intro: t("RMCtabs.AddOperation"),
            },
            {
                element: ".Edit",
                intro: t("RMCtabs.EditAssemblyCosting"),
            },

        ],
        TAB_ST: [
            {
                element: '#costing_surface_treatment_btn',
                intro: t("Hints.surfaceTreamentButton")
            }

        ],
        TAB_OVERHEAD_PROFIT: [
            {
                element: '#Overhead_profit_checkbox1',
                intro: t("OverheadProfitTab.checkBox1")
            },
            {
                element: '#Overhead_profit_checkbox2',
                intro: t("OverheadProfitTab.checkBox2")
            },
            {
                element: '#Overhead_profit_checkbox3',
                intro: t("OverheadProfitTab.checkBox3")
            },
            {
                element: '#Overhead_profit_checkbox4',
                intro: t("OverheadProfitTab.checkBox4")
            },
            {
                element: '.input-container #ModelType_container',
                intro: t("OverheadProfitTab.modelType")
            },
            {
                element: '.input-container #Applicability_container',
                intro: t("OverheadProfitTab.RejectionApplicability")
            },
            {
                element: '.input-container #RejectionPercentage',
                intro: t("OverheadProfitTab.RejectionPercentage")
            },
            {
                element: '#popUpTriggerRejection',
                intro: t("OverheadProfitTab.rejectionRemark")
            },
            {
                element: '#Inventory_Carrying_Cost_switch',
                intro: t("OverheadProfitTab.iccCost")
            },
            {
                element: '#Payment_Terms_switch',
                intro: t("OverheadProfitTab.paymentTermCost")
            },
            {
                element: '#overhead-refresh',
                intro: t("OverheadProfitTab.refreshButton")
            },
            {
                element: '#net_overhead_profit_input',
                intro: t("OverheadProfitTab.overheadCost")
            },
            {
                element: '#overhead_profit_save',
                intro: t("OverheadProfitTab.saveOverheadCost"),
                position: "left"
            },

        ],
        TAB_PACKAGE_FREIGHT: [
            {
                element: '#Costing_addPackaging',
                intro: t("PackagingFreightTab.AddPackaging"),
                position: "left"
            },
            {
                element: '#Costing_addFreight',
                intro: t("PackagingFreightTab.AddFreight"),
                position: "left"
            },
        ],
        TAB_TOOL: [
            {
                element: '#tooltab-switch',
                intro: t("ToolTab.switch")
            },
            {
                element: '.input-container #toolCostType_container',
                intro: t("ToolTab.toolMaintainanceApplicability")
            },
            {
                element: '#maintanencePercentage',
                intro: t("ToolTab.maintanencePercentage")
            },
            {
                element: '#ToolCost',
                intro: t("ToolTab.ToolCost")
            },
            {
                element: '#Life',
                intro: t("ToolTab.ToolCost")
            },
        ],
        TAB_DISCOUNT_OTHERS: [
            // {
            //     element: '#discountDescriptionRemark',
            //     intro: t("DiscountTab.discountRemark")
            // },
            {
                element: '.input-container #DiscountCostApplicability_container',
                intro: t("DiscountTab.discountApplicability")
            },
            {
                element: '#HundiOrDiscountPercentage',
                intro: t("DiscountTab.discountTypePercentage")
            },
            {
                element: '#HundiOrDiscountValue',
                intro: t("DiscountTab.discountTypeFixed")
            },
            {
                element: '#tabDiscount_otherCost',
                intro: t("DiscountTab.otherCost")
            },
            {
                element: '#tabDiscount_condition',
                intro: t("DiscountTab.conditionCost")
            },
            {
                element: '#total_refresh',
                intro: t("DiscountTab.refreshData")
            },
            {
                element: '#change_currency_input',
                intro: t("DiscountTab.changeCurrency")
            },
            {
                element: '#Remarks',
                intro: t("DiscountTab.remark")
            },
            {
                element: '#tabDiscount_attachments',
                intro: t("DiscountTab.attachment")
            },
            {
                element: '#discountTab_save',
                intro: t("DiscountTab.saveData")
            },
            {
                element: '#discountTab_next',
                intro: t("DiscountTab.nextData"),
                position: "left"
            },
        ],
        COSTING_ST_DRAWER: [
            {
                element: '#Costing_addST',
                intro: t("addSTCost.addSt"),
            },
            {
                element: '.input-container #UOM_container',
                intro: t("addSTCost.addSt"),
            },
            {
                element: '.input-container #Rate_container',
                intro: t("addSTCost.addSt"),
            },
            {
                element: '.input-container #Quantity_container',
                intro: t("addSTCost.addSt"),
            },
            {
                element: '.input-container #operation-cost',
                intro: t("addSTCost.addSt"),
            },
        ],
        RAW_MATERIAL_COST: [
            {
                element: '.RM_calculator0',
                intro: t("RawMaterialCost.calculator"),
            },
            {
                element: '.Raw_material_grossWeight0',
                intro: t("RawMaterialCost.grossWeigtht"),
            },
            {
                element: '.Raw_material_finishWeight0',
                intro: t("RawMaterialCost.finishWeight"),
            },
            {
                element: '#RM_delete0',
                intro: t("RawMaterialCost.delete"),
            },
            {
                element: '#RM_popUpTrigger0',
                intro: t("RawMaterialCost.remark"),
            },
        ],
        BOP_COST: [

            {
                element: '#bopCost_edit0',
                intro: t("RawMaterialCost.edit"),
            },
            {
                element: '#bopCost_delete0',
                intro: t("RawMaterialCost.delete"),
            },
            {
                element: '#bop_handling_charge',
                intro: introWithBOPDynamicValue(t("RawMaterialCost.bopHanlding")),
            },
        ],
        PROCESS_COST: [

            {
                element: '#process_Calculator0',
                intro: t("processCost.calculator"),
            },
            {
                element: '#process_delete0',
                intro: t("processCost.delete"),
            },
            {
                element: '#process_popUpTriggers0',
                intro: t("processCost.remark"),
            },
        ],
        OPERATION_COST: [

            {
                element: '#operationCost_edit0',
                intro: t("operationCost.edit"),
            },
            {
                element: '#operationCost_delete0',
                intro: t("operationCost.delete"),
            },
            {
                element: '.operation.Comment-box',
                intro: t("operationCost.remark"),
            },
        ],
        COSTING_SUMMARY: [
            ...(disableCostingSummaryDetailedPdf ? [

                {
                    element: "#costingSummary", // Assuming filter button has this class
                    intro: t("costingSummary.costingNotDone"),
                },
            ] : []),
            ...(!(disableCostingSummaryDetailedPdf) ? [
                ...(isSuperAdmin ? [
                    {
                        element: "#costingSummary_excel",
                        intro: t("costingSummary.downloadExcel"),
                    },

                    {
                        element: "#costingSummary_Detailed_pdf",
                        intro: t("costingSummary.costingDetailedPdf"),
                    },

                    {
                        element: "#costingSummary_pdf",
                        intro: t("costingSummary.costingDownloadPdf"),
                    },
                ] : []),


                ...(!(isSuperAdmin) ? [

                    {
                        element: "#costingSummary_sendforapproval", // Assuming filter button has this class
                        intro: t("costingSummary.sendForApproval"),
                    },
                ] : []),

                {
                    element: "#costingSummary_addtocomparison",
                    intro: t("costingSummary.addToComparison"),
                },

                ...(viewBomButton ? [
                    {
                        element: "#costingSummary_viewbom",
                        intro: t("costingSummary.viewBOM"),
                    },
                ] : []),
                ...(editButton ? [
                    {
                        element: "#costingSummary_edit",
                        intro: t("costingSummary.edit"),
                    },
                ] : []),

                ...(viewButton ? [
                    {
                        element: "#costingSummary_view",
                        intro: t("costingSummary.view"),
                    },
                ] : []),

                {
                    element: "#costingSummary_add",
                    intro: t("costingSummary.add"),
                },


                {
                    element: "#costingSummary_discard",
                    intro: t("costingSummary.discard"),
                },
                {
                    element: "#costing_change_version",
                    intro: t("costingSummary.changeVersion"),
                },
                ...(config?.totalCost !== 0 ? [
                    {
                        element: "#costing_view_pie_chart",
                        intro: t("costingSummary.viewPieChart"),
                    },
                ] : []),
                ...technology ? [
                    {
                        element: "#view_multiple_technology",
                        intro: t("costingSummary.viewMultipleTechnology"),
                    },
                ] : [],
                ...!technology ? [
                    {
                        element: "#view_RawMaterial",
                        intro: t("costingSummary.viewRMCost"),
                    },
                    {
                        element: "#view_BOP",
                        intro: t("costingSummary.viewBOPCost"),
                    },

                    {
                        element: "#view_conversion_cost", // Assuming reset button has this class
                        intro: t("costingSummary.viewConversionCost"),
                    },
                ] : [],
                {
                    element: "#view_surface_treatment_cost",
                    intro: t("costingSummary.viewSurfaceTreatmentCost"),
                },
                {
                    element: "#view_overhead_profit",
                    intro: t("costingSummary.viewOverheadProfitCost"),
                },

                {
                    element: "#view_packaging_freight",
                    intro: t("costingSummary.viewPackagingFreightCost"),
                },
                {
                    element: "#view_toolCost",
                    intro: t("costingSummary.viewToolCost"),
                },
                {
                    element: "#view_otherToolCost",
                    intro: t("costingSummary.viewOtherCost"),
                },

            ] : []),








        ],
        COSTING_COMPARISON: [

            {
                element: '.input-container #vendor_container',
                intro: t("CostingComparison.vendor_code"),
            },
            {
                element: '.input-container #destinationPlant_container',
                intro: t("CostingComparison.plant_code"),
            },
            {
                element: '#Costing_AddToComparison_submit',
                intro: t("CostingComparison.add"),
            },
            {
                element: '#costing_AddToComparison_cancel',
                intro: t("CostingComparison.cancel"),
            },
        ],
        COSTING_APPROVAL: [

            {
                element: "#filter-text-box",
                intro: t("costingApproval.searchInput"),
            },
            {
                element: ".ag-text-field-input",
                intro: t("costingApproval.floating_FilterInput"),
            },

            {
                element: ".ag-floating-filter-button",
                intro: t("costingApproval.floating_FilterButton"),
            },
            {
                element: ".ag-input-field-input",
                intro: t("costingApproval.checkBoxButton"),
            },
            {
                element: "#Costing_Approval_No_0",
                intro: t("costingApproval.approval_Summary"),
            },

            {
                element: "#Costing_Approval_Costing_Id_0",
                intro: t("costingApproval.costing_Detailed"),
            },

            {
                element: '#Costing_Approval_Filter',
                intro: t("costingApproval.filterButton")
            },

            {
                element: '#Costing_Approval_Reset',
                intro: t("costingApproval.refreshButton")
            },
            {
                element: '#Costing_Approval_Send',
                intro: t("costingApproval.sendForApproval")
            },
            {
                element: '#singleDropDown_container',
                intro: t("costingApproval.status")
            }

        ],
        SENDFORAPPROVAL: [
            {
                element: ".input-container #ApprovalType_container",
                intro: t("SendForApproval.approvalType"),
            },
            {
                element: ".input-container #reason_container",
                intro: t("SendForApproval.reason"),
            },

            {
                element: ".input-container #DecimalOption_container",
                intro: t("SendForApproval.decimal-option"),
            },
            // {
            //     element: "#remark_container",
            //     intro: t("SendForApproval.remark"),
            // },
            // {
            //     element: "#cancel_simulation",
            //     intro: t("SendForApproval.attachments"),
            // },
            // {
            //     element: "#cancel_SendForApproval",
            //     intro: t("SendForApproval.cancel"),
            // },
            // {
            //     element: "#submit_SendForApproval",
            //     intro: t("SendForApproval.submit"),
            // }
        ],
        PART_HINT: [{ element: '.part-name .Close', hint: t("Hints.partHint") }],
        OVERHEAD_HINT: [{ element: '#overhead_profit_arrow .Close', hint: t("Hints.overheadHint") }],
        ST_HINT: [{ element: '#costing_surface_treatment_btn', hint: t("Hints.surfaceTreamentButton") }]
    }
}
