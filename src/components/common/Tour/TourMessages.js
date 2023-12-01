import React from 'react';

export function Steps(t) {
    return {
        NAVBAR: [
            {
                element: ".language-dropdown",
                intro: "testing mesage",
            },
            {
                element: ".dashboard",
                intro: t('navbar.dashboard'),
            },
            {
                element: ".masters",
                intro: t('navbar.masters'),
            },
            {
                element: ".costing",
                intro: t("navbar.costing"),
            },
            {
                element: ".rfq",
                intro: t("navbar.rfq"),
            },
        ],
        DASHBOARD_SIMULATION_TAB: [
            {
                element: "#dashboard_simulation_Pending_For_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Pending_For_Approval"),
            },
            {
                element: "#dashboard_simulation_Awaiting_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Awaiting_Approval"),
            },
            {
                element: "#dashboard_simulation_Rejected",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Rejected"),
            },
            {
                element: "#dashboard_simulation_Approved",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Approved"),
            },
        ],


        SEND_FOR_APPROVAL_DRAWER: [
            {
                element: '#reason0',
                intro: t("sendForApprovalDrawer.reason0"),
            },
            {
                element: '#approver',
                intro: t("sendForApprovalDrawer.approver"),
            },
            {
                element: '#drawer-remark',
                intro: t("sendForApprovalDrawer.drawer-remark"),
            },
            {
                element: '#send-confirm-btn',
                intro: t("sendForApprovalDrawer.send-confirm-btn"),
            },
        ],
        CREATE_COSTING: [
            {
                element: '#RMC-tab',
                intro: t('createCosting.RMC-tab'),
            },
            {
                element: '#ST-tab',
                intro: t('createCosting.ST-tab'),
            },
            {
                element: '#OP-tab',
                intro: t('createCosting.OP-tab'),
            },
            {
                element: '#PF-tab',
                intro: t('createCosting.PF-tab'),
            },
            {
                element: '#TC-tab',
                intro: t('createCosting.TC-tab'),
            },
            {
                element: '#DOC-tab',
                intro: t('createCosting.DOC-tab'),
            },

        ],
        CREATE_COSTING_LOGISTICS: [
            {
                element: '.date-section',
                intro: 'Please select costing effetive date and start creating costing.',
                position: 'right',
                tooltipClass: 'ml-2'
            },
            {
                element: '#PF-tab',
                intro: 'Please select costing effetive date and start creating costing.',
            },
            {
                element: '#logistics-freight-btn',
                intro: 'Please select costing effetive date and start creating costing.',
            },

        ],
        COSTING_SUMMARY: [
            {
                element: '.excel-btn',
                intro: t('costingSummary.excel-btn'),
            },
            {
                element: '.simple-pdf',
                intro: t('costingSummary.simple-pdf'),
            },
            {
                element: '.detailed-pdf',
                intro: t('costingSummary.detailed-pdf'),
            },
            {
                element: '.comparison-btn',
                intro: t('costingSummary.comparison-btn'),
            },
            {
                element: '#edit-btn',
                intro: t('costingSummary.edit-btn'),
            },
            {
                element: '#add-btn',
                intro: t('costingSummary.add-btn'),
            },
            {
                element: '#header-view',
                intro: t('costingSummary.header-view'),
            },
            {
                element: '#rm-view',
                intro: t('costingSummary.rm-view'),
            },
            {
                element: '#bop-view',
                intro: t('costingSummary.bop-view'),
            },
            {
                element: '#converion-view',
                intro: t('costingSummary.converion-view'),
            },
            {
                element: '#st-view',
                intro: t('costingSummary.st-view'),
            },
            {
                element: '#op-view',
                intro: t('costingSummary.op-view'),
            },
            {
                element: '#pf-view',
                intro: t('costingSummary.pf-view'),
            },
            {
                element: '#tool-view',
                intro: t('costingSummary.tool-view'),
            },
            {
                element: '#other-cost-view',
                intro: t('costingSummary.other-cost-view'),
            },
            {
                element: '#back-to-rfq',
                intro: t('costingSummary.back-to-rfq'),
            },
        ],
        COSTING_SUMMARY_WITHOUT_COSTING: [
            {
                element: '#back-to-rfq',
                intro: t('costingSummaryWithoutCosting.back-to-rfq'),
            }
        ],
        ADD_RM_STEPS: [
            {
                element: '#RMName0',
                intro: t('addRMGrid.RMName0'),
            },
            {
                element: '#net-landed-cost0',
                intro: t('addRMGrid.net-landed-cost0'),
            },
            {
                element: '#RMRate0',
                intro: t('addRMGrid.RMRate0'),
            },
            {
                element: '#ScrapRate0',
                intro: t('addRMGrid.ScrapRate0'),
            },
            {
                element: '#RMUOM0',
                intro: t('addRMGrid.RMUOM0'),
            },
            {
                element: '#GrossWeight0',
                intro: t('addRMGrid.GrossWeight0'),
            },
            {
                element: '#FinishWeight0',
                intro: t('addRMGrid.FinishWeight0'),
            },
            {
                element: '#popUpTrigger0',
                intro: t('addRMGrid.popUpTrigger0'),
            },
            {
                element: '.master-batch-checkbox',
                intro: t('addRMGrid.master-batch-checkbox'),
            },
            {
                element: '#rmDelete0',
                intro: t('addRMGrid.rmDelete0'),
            },

        ],
        ADD_BOP_STEPS: [
            {
                element: '#bop-number0',
                intro: t("addBOPGrid.bop-number0"),
            },
            {
                element: '#bop-name0',
                intro: t("addBOPGrid.bop-name0"),
            },
            {
                element: '#net-bop-cost0',
                intro: t("addBOPGrid.net-bop-cost0"),
            },
            {
                element: '#bop-uom0',
                intro: t("addBOPGrid.bop-uom0"),
            },
            {
                element: '#bop-cost0',
                intro: t("addBOPGrid.bop-cost0"),
            },
            {
                element: '#bop-quantity0',
                intro: t("addBOPGrid.bop-quantity0"),
            },
            {
                element: '#bop-delete0',
                intro: t("addBOPGrid.bop-delete0"),
            },
            {
                element: '#add-bop-btn',
                intro: t("addBOPGrid.add-bop-btn"),
            },
            {
                element: '.bop-handling-charges',
                intro: t("addBOPGrid.bop-handling-charges"),
            },


        ],
        ADD_PROCESS_STEPS: [
            {
                element: '#process-name0',
                intro: t("addProcessGrid.process-name0"),
            },
            {
                element: '#machine-tonnage0',
                intro: t("addProcessGrid.machine-tonnage0"),
            },
            {
                element: '#process-net-cost0',
                intro: t("addProcessGrid.process-net-cost0"),
            },
            {
                element: '#machine-rate0',
                intro: t("addProcessGrid.machine-rate0"),
            },
            {
                element: '#process-uom0',
                intro: t("addProcessGrid.process-uom0"),
            },
            {
                element: '#process-quantity0',
                intro: t("addProcessGrid.process-quantity0"),
            },
            {
                element: '.process-remark',
                intro: t("addProcessGrid.process-remark"),
            },
            {
                element: '.add-process',
                intro: t("addProcessGrid.add-process"),
            },
            {
                element: '#process-delete0',
                intro: t("addProcessGrid.process-delete0"),
            },
        ],
        ADD_OPERATION_STEPS: [
            {
                element: '#operation-name0',
                intro: t("addOperationGrid.operation-name0"),
            },
            {
                element: '#operation-code0',
                intro: t("addOperationGrid.operation-code0"),
            },
            {
                element: '#operation-net0',
                intro: t("addOperationGrid.operation-net0"),
            },
            {
                element: '#operation-rate0',
                intro: t("addOperationGrid.operation-rate0"),
            },
            {
                element: '#operation-uom0',
                intro: t("addOperationGrid.operation-uom0"),
            },
            {
                element: '#operation-quantity0',
                intro: t("addOperationGrid.operation-quantity0"),
            },
            {
                element: '.operation-remark',
                intro: t("addOperationGrid.operation-remark"),
            },
            {
                element: '#operation-delete0',
                intro: t("addOperationGrid.operation-delete0"),
            },
            {
                element: '.add-operation',
                intro: t("addOperationGrid.add-operation"),
            },
            {
                element: '.add-other-operation',
                intro: t("addOperationGrid.add-other-operation"),
            },
        ],
        ADD_SURFACE_STEPS: [
            {
                element: '#surface-name0',
                intro: t("addSurfaceGrid.surface-name0"),
            },
            {
                element: '#surface-treatment-net0',
                intro: t("addSurfaceGrid.surface-treatment-net0"),
            },
            {
                element: '#surface-uom0',
                intro: t("addSurfaceGrid.surface-uom0"),
            },
            {
                element: '#surface-rate0',
                intro: t("addSurfaceGrid.surface-rate0"),
            },
            {
                element: '#surface-quantity0',
                intro: t("addSurfaceGrid.surface-quantity0"),
            },
            {
                element: '#surface-delete0',
                intro: t("addSurfaceGrid.surface-delete0"),
            },
            {
                element: '.add-surface',
                intro: t("addSurfaceGrid.add-surface"),
            },
            {
                element: '#extra-cost-surface',
                // intro: <>If you need to provide any extra cost, select the cost type from here. There are three different cases:
                //     <div>1. If you choose "Fixed," you can directly enter the net cost. The "Rate" and "Quantity" fields will be disabled.</div>
                //     <div>2. If you choose "Percentage," you can enter a percentage, and the cost will be calculated automatically.</div>
                //     <div>3. If you choose "Rate," you need to enter the rate and quantity, and the net cost will be calculated based on them.</div>
                // </>,
                intro: t("addSurfaceGrid.extra-cost-surface"),
                tooltipClass: 'extra-cost-tooltip',
            },
        ],
        OP_CHECKBOXES_STEPS: [
            {
                element: '.first-checkbox',
                intro: t("overheadAndProfit.first-checkbox"),
            },
            {
                element: '.second-checkbox',
                intro: t("overheadAndProfit.second-checkbox"),
            },

        ],
        OVERHEAD_PROFIT: [
            {
                element: '#ModelType',
                intro: t("overheadAndProfit.ModelType"),
            },
            {
                element: '#Rejection-applicability',
                intro: t("overheadAndProfit.Rejection-applicability"),
            },
            {
                element: '.icc-switch',
                intro: t("overheadAndProfit.icc-switch"),
            },
            {
                element: '.payment-switch',
                intro: t("overheadAndProfit.payment-switch"),
            },
            {
                element: '#net-overhead-profit',
                intro: t("overheadAndProfit.net-overhead-profit"),
            },
            {
                element: '#overhead-refresh',
                intro: t("overheadAndProfit.overhead-refresh"),
            },
        ],
        PACKAGE_FREIGHT_STEPS: [
            {
                element: '#logistics-freight-btn',
                intro: t("packagingAndFrieght.logistics-freight-btn"),
            },
            {
                element: '#freight-btn',
                intro: t("packagingAndFrieght.freight-btn"),
            },
        ],
        PACKAGING_COST_DRAWER: [
            {
                element: '#packagingDescription',
                intro: t("packagingDrawer.packagingDescription"),
            },
            {
                element: '#applicability',
                intro: t("packagingDrawer.applicability"),
            },
            {
                element: '#packagingPercentage',
                intro: t("packagingDrawer.packagingPercentage"),
            },
            {
                element: '#packagingCost',
                intro: t("packagingDrawer.packagingCost"),
            },
            {
                element: '#packagingCostSave',
                intro: t("packagingDrawer.packagingCostSave"),
            },
        ],
        FRIEGHT_COST_DRAWER: [
            {
                element: '.frieghtFixed',
                intro: t("freightCostDrawer.frieghtFixed"),
            },
            {
                element: '.frieghtPercentage',
                intro: t("freightCostDrawer.frieghtPercentage"),
            },
            {
                element: '#freightApplicability',
                intro: t("freightCostDrawer.freightApplicability"),
            },
            {
                element: '#freightRate',
                intro: t("freightCostDrawer.freightRate"),
            },
            {
                element: '#freightCost',
                intro: t("freightCostDrawer.freightCost"),
            },
            {
                element: '#freightSave',
                intro: t("freightCostDrawer.freightSave"),
            },
        ],
        TOOL_STEPS: [
            {
                element: '.applicability-toggle',
                intro: t("toolCost.applicability-toggle"),
            },
            {
                element: '#tool-applicability',
                intro: t("toolCost.tool-applicability"),
            },
            {
                element: '#tool-percentage',
                intro: t("toolCost.tool-percentage"),
            },
            {
                element: '#tool-cost',
                intro: t("toolCost.tool-cost"),
            },
            {
                element: '#tool-life',
                intro: t("toolCost.tool-life"),
            },
        ],
        DISCOUNT_STEPS: [
            {
                element: '#DiscountCostApplicability',
                intro: t("discountAndOtherCost.DiscountCostApplicability"),
            },
            {
                element: '#HundiOrDiscountPercentage',
                intro: t("discountAndOtherCost.HundiOrDiscountPercentage"),
            },
            {
                element: '#HundiOrDiscountValue',
                intro: t("discountAndOtherCost.HundiOrDiscountValue"),
            },
            {
                element: '#tabDiscount_otherCost',
                intro: t("discountAndOtherCost.tabDiscount_otherCost"),
            },
            {
                element: '#tabDiscount_npvCost',
                intro: t("discountAndOtherCost.tabDiscount_npvCost"),
            },
            {
                element: '.YOY-acc',
                intro: t("discountAndOtherCost.YOY-acc"),
            },
            {
                element: '#NetPOPriceINR',
                intro: t("discountAndOtherCost.NetPOPriceINR"),
            },
            {
                element: '.currency-checkbox',
                intro: t("discountAndOtherCost.currency-checkbox"),
            },
            {
                element: '#Remarks',
                intro: t("discountAndOtherCost.Remarks"),
            },
            {
                element: '.attachment-acc',
                intro: t("discountAndOtherCost.attachment-acc"),
            },
            {
                element: '#save-button',
                intro: t("discountAndOtherCost.save-button"),
            },
            {
                element: '#next-button',
                intro: t("discountAndOtherCost.next-button"),
            },
        ],
        OTHER_COST_DRAWER: [
            {
                element: '#otherCostDescription',
                intro: t("otherCostDrawer.otherCostDescription"),
            },
            {
                element: '#otherCostApplicability',
                intro: t("otherCostDrawer.otherCostApplicability"),
            },
            {
                element: '#percentageOtherCost',
                intro: t("otherCostDrawer.percentageOtherCost"),
            },
            {
                element: '#drawer-other-cost',
                intro: t("otherCostDrawer.drawer-other-cost"),
            },
            {
                element: '#addDataTable',
                intro: t("otherCostDrawer.addDataTable"),
            },
            {
                element: '#resetDataTable',
                intro: t("otherCostDrawer.addDataTable"),
            },
            {
                element: '#saveOtherCost',
                intro: t("otherCostDrawer.saveOtherCost"),
            },
        ],
        YOY_COST_DRAWER: [
            {
                element: '#yoyCostInput1',
                intro: t("yoyCostDrawer.yoyCostInput1"),
            },
            {
                element: '#yoyCostInput2',
                intro: t("yoyCostDrawer.yoyCostInput2"),
            },
            {
                element: '#yoyCostInput3',
                intro: t("yoyCostDrawer.yoyCostInput3"),
            },
            {
                element: '#yoyCostInput4',
                intro: t("yoyCostDrawer.yoyCostInput4"),
            },
            {
                element: '#yoyCostInput5',
                intro: t("yoyCostDrawer.yoyCostInput5"),
            },
            {
                element: '#yoySaveCost',
                intro: t("yoyCostDrawer.yoySaveCost"),
            }

        ],
        NPV_COST_DRAWER: [
            {
                element: '#TypeOfNpv',
                intro: t("npvCostDrawer.TypeOfNpv"),
            },
            {
                element: '#TotalInvestment',
                intro: t("npvCostDrawer.TotalInvestment"),
            },
            {
                element: '#NPVQuantity',
                intro: t("npvCostDrawer.NPVQuantity"),
            },
            {
                element: '#NPVTotal',
                intro: t("npvCostDrawer.NPVTotal"),
            },
            {
                element: '#NPVAdd',
                intro: t("npvCostDrawer.NPVAdd"),
            },
            {
                element: '#saveNPVData',
                intro: t("npvCostDrawer.saveNPVData"),
            }

        ],
        COSTING_SUMMARY_FIRST_STEP: [
            {
                element: '#costingSummaryTechnology',
                intro: t("costingSummaryFirst.costingSummaryTechnology"),
            },
            {
                element: '#costingSummaryPart',
                intro: t("costingSummaryFirst.costingSummaryPart"),
            },
            {
                element: '#costingSummaryReset',
                intro: t("costingSummaryFirst.costingSummaryReset"),
            }
        ]
    }
}
export const Hints = (t) => {
    return {
        RFQ_LISTING: [
            {
                element: "#view-btn0",
                hint: t("hints.view-btn0"),
            },
        ],
        CREATE_COSTING_RMC: [
            {
                element: ".Close",
                hint: t("hints.Close"),
            },
        ],
        COSTING_SAVE_BUTTON: [
            {
                element: '#rmc-save-btn',
                hint: t("hints.rmc-save-btn"),
                hintPosition: 'left-top',
            }
        ],
        COSTING_SEND_BUTTON_LOGISTICS: [
            {
                element: '#logistics-next-btn',
                hint: t("hints.logistics-next-btn"),
                hintPosition: 'left-top',
            }
        ],
        COSTING_SEND_BUTTON: [
            {
                element: '#next-btn',
                hint: t("hints.next-btn"),
                hintPosition: 'left-top',
            }
        ],
        SURFACE_TREATMENT: [
            {
                element: ".surface-treatment-btn",
                hint: t("hints.surface-treatment-btn"),
                hintPosition: 'left-top'
            }
        ],
        OVERHEAD_PROFIT: [
            {
                element: ".overhead-icon",
                hint: t("hints.overhead-icon"),
                hintPosition: 'left-top'
            }
        ],
    }
}