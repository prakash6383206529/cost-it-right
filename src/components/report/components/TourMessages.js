
export function Steps(t, config) {

    let showMasterListing = true
    if (config) {
        showMasterListing = config?.selectedMasterForSimulation?.value !== "" && (config?.selectedMasterForSimulation ? true : false)
    }
    return {
        COST_REPORT_FORM: [
            ...(!(config?.dateHide) ? [
                {
                    element: "#fromDate",
                    intro: t("costRatio.FromDate"),
                },
                {
                    element: "#toDate",
                    intro: t("costRatio.ToDate"),
                },
                ...config?.customerPoamSummary === true ? [
                    {
                        element: ".input-container #productCategory_container",
                        intro: t("costRatio.productCategory_container"),
                    },
                ] : [],
            ] : []),

            ...(!(config?.plantWiseGotGiven) ? [
                {
                    element: ".input-container #Technology_container",
                    intro: t("costRatio.Technology"),
                },

                {
                    element: ".input-container #PartType_container",
                    intro: t("costRatio.PartType"),
                },
                {
                    element: ".input-container #Part_container",
                    intro: t("costRatio.PartNo"),
                }] : []),
            ...config?.customerPoamSummary === false && (!(config?.dateHide) && config?.customerPoamSummary === false) ? [
                {
                    element: ".input-container #Revision_container",
                    intro: t("costRatio.RevisionNumber"),
                }] : [],
            ...config?.showVendor === true ? [
                {
                    element: ".input-container #vendor_container",
                    intro: t("costRatio.Vendor"),
                }] : [],
            {
                element: ".input-container #Plant_container",
                intro: t("costRatio.PlantCode"),
            },
            ...config?.customerPoamSummary === true || config?.showCustomer === true || config?.gotGiven ? [
                {
                    element: ".input-container #Customer_container",
                    intro: t("costRatio.Customer"),
                }] : [],
            ...(!(config?.hideAddtable) ? [
                {
                    element: "#add-btn",
                    intro: t("costRatio.AddButton"),
                },
                {
                    element: "#reset-btn",
                    intro: t("costRatio.ResetButton"),
                },
                {
                    element: ".ag-text-field-input",
                    intro: t("costRatio.floatingFilterInput"),
                },
                {
                    element: ".ag-floating-filter-button",
                    intro: t("costRatio.floatingFilterButton"),
                },

                {
                    element: ".reset-btn1",
                    intro: t("costRatio.ResetButton"),
                }] : []),
            ...config?.effectiveDate ? [
                {
                    element: "#EffectiveDate",
                    intro: t("costRatio.EffectiveDate_Container"),
                }] : [],
        ],
        SUPPLIER: [
            {
                element: "#fromDate_container",
                intro: t("costRatio.FromDate"),
            },
            {
                element: "#toDate_container",
                intro: t("costRatio.ToDate"),
            },
            {
                element: "#plant_container",
                intro: t("costRatio.Plant"),
            },
            {
                element: "#add-btn",
                intro: t("costRatio.AddButton"),
            },
            {
                element: "#reset-btn",
                intro: t("costRatio.ResetButton"),
            }
        ],
        MASTERBENCHMARK: [

            {
                element: "#Masters_container",
                intro: t("masterBenchmark.master"),
            },
            ...(showMasterListing ? [

                {
                    element: "#filter-text-box",
                    intro: t("masterBenchmark.globalSearch"),
                },
                {
                    element: ".ag-text-field-input",
                    intro: t("masterBenchmark.floatingFilterInput"),
                },
                {
                    element: ".ag-floating-filter-button",
                    intro: t("masterBenchmark.floatingFilterButton"),
                },

                {
                    element: ".Tour_List_Filter",
                    intro: t("masterBenchmark.filterData"),
                },
                {
                    element: ".Tour_List_Reset",
                    intro: t("masterBenchmark.ResetButton"),
                },

            ] : []),
        ],
        SUPPLIER_CONTRIBUTION: [
            {
                element: "#fromDate",
                intro: t("supplierContribution.FromDate"),
            },
            {
                element: "#toDate",
                intro: t("supplierContribution.ToDate"),
            },
            {
                element: ".input-container #plant_container",
                intro: t("supplierContribution.PlantCode"),
            },
            {
                element: "#runReport",
                intro: t("supplierContribution.runReport"),
            },

            {
                element: "#resetReport",
                intro: t("supplierContribution.reset"),
            },



        ],
        COSTMOVEMENT: [

            {
                element: "#fromDate",
                intro: t("costMovement.FromDate"),
            },
            {
                element: "#toDate",
                intro: t("costMovement.ToDate"),
            },
            {
                element: ".input-container #Masters_container",
                intro: t("costMovement.master"),
            },
            {
                element: ".input-container #costingHeadType_container",
                intro: t("costMovement.costingHeadType"),
            },

            {
                element: ".input-container #vendor_container",
                intro: t("costMovement.Vendor"),
            },
            {
                element: ".input-container #plant_container",
                intro: t("costMovement.PlantCode"),
            },




        ],
        GOTGIVENSUMMARY: [
            {
                element: ".input-container #Technology_container",
                intro: t("gotGivenReport.technology"),
            },
            {
                element: ".input-container #Part_container",
                intro: t("gotGivenReport.PartNo"),
            },
            {
                element: ".input-container #Customer_container",
                intro: t("gotGivenReport.customer"),
            },
            {
                element: ".input-container #vendor_container",
                intro: t("gotGivenReport.Vendor"),
            },

            {
                element: ".input-container #product_container",
                intro: t("gotGivenReport.product"),
            },
            {
                element: ".input-container #Plant_container",
                intro: t("gotGivenReport.plant"),
            },
            {
                element: "#Reset_Button",
                intro: t("gotGivenReport.reset"),
            },
        ],
        ASSYREPORT: [
            {
                element: ".input-container #model_container",
                intro: t("assyReport.modelNo"),
            },
            {
                element: ".input-container #Part_container",
                intro: t("assyReport.partNo"),
            },
            {
                element: "#view_reports",
                intro: t("assyReport.viewReport"),
            },

        ]


    };

}
