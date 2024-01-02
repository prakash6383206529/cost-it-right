import React from 'react';

export function Steps(t, costingType) {
    return {

        COSTING_INITIAL: [
            {
                element: ".input-container #Technology_container",
                intro: t("costingInitial.Technology"),
            },
            {
                element: ".input-container #PartType_container",
                intro: t("costingInitial.PartType"),
            },
            {
                element: ".input-container #Part_container",
                intro: t("costingInitial.Part"),
            },
            {
                element: "#costing-cancel",
                intro: t("costingInitial.clear"),
                position: "left"
            },
        ],
        COSTING_STEP_TWO: [
            {
                element: "#ZBC_Costing_Add_Plant",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#NCC_Costing_Add_Vendor",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#VBC_Costing_Add_Vendor",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#CBC_Costing_Add_Customer",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#WAC_Costing_Add_Plant",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
        ],
        VENDOR_COSTING_GRID: [
            {
                element: `.costing-table-${costingType} .edit-sob-btn`,
                intro: t("vendorCreateCosting.editSob"),
            },
            {
                element: `.costing-table-${costingType} .Costing-version-0`,
                intro: t("vendorCreateCosting.version"),
            },
            {
                element: `.costing-table-${costingType} .Add-file`,
                intro: t("vendorCreateCosting.createCosting"),
            },
            {
                element: `.costing-table-${costingType} .View`,
                intro: t("vendorCreateCosting.viewCosting"),
            },
            {
                element: `.costing-table-${costingType} .Edit`,
                intro: t("vendorCreateCosting.editCosting"),
            },
            {
                element: `.costing-table-${costingType} .Copy`,
                intro: t("vendorCreateCosting.copyCosting"),
            },
            {
                element: `.costing-table-${costingType} .Delete`,
                intro: t("vendorCreateCosting.deleteCosting"),
            },
            {
                element: `.costing-table-${costingType} .CancelIcon`,
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

        ],
        TAB_RMC: [
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
            {
                element: '#discountDescriptionRemark',
                intro: t("DiscountTab.discountRemark")
            },
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
        PART_HINT: [{ element: '.part-name .Close', hint: t("Hints.partHint") }],
        OVERHEAD_HINT: [{ element: '#overhead_profit_arrow .Close', hint: t("Hints.overheadHint") }],
        ST_HINT: [{ element: '#costing_surface_treatment_btn', hint: t("Hints.surfaceTreamentButton") }]


    }
}
