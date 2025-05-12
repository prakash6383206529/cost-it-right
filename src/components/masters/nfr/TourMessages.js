
export function Steps(t, config) {
    let showNfrListing = true
    let showNfrPartListing = false
    let editNfr = false
    const introMessage = config && config.isRowEdited === false ? t("nfr.reset_Estimation") : t("nfr.cancel_Estimation");

    if (config) {
        showNfrListing = config?.activeTab === '1' ? true : false
        showNfrPartListing = config?.showNfrPartListing ? true : false
        editNfr = config?.editNfr === true ? true : false
    }
    return {

        NFR_lISTING: [
            ...!editNfr ? [
                {
                    element: "#filter-text-box",
                    intro: t("nfr.search"),
                    hidePrev: true
                },
                {
                    element: " .ag-text-field-input",
                    intro: t("nfr.floatingFilterInput"),
                },

                {
                    element: ".ag-floating-filter-button",
                    intro: t("nfr.floatingFilterButton"),
                },

                {
                    element: "#resetNFR_listing",
                    intro: t("nfr.refresh"),
                    position: "left"
                },
            ] : [],
            ...showNfrListing && !showNfrPartListing ? [

                {
                    element: "#nfr_add",
                    intro: t("nfr.add_Nfr"),
                },
                {
                    element: "#fetchNFR_btn",
                    intro: t("nfr.fetch"),
                },
                {
                    element: "#viewNfr_list",
                    intro: t("nfr.viewNPart"),
                },
                {
                    element: "#deleteNfr_list",
                    intro: t("nfr.DeleteNfr"),
                },
            ] : [],
            ...!showNfrListing ? [
                {
                    element: "#view_nfrSummary",
                    intro: t("nfr.nfrSummary"),
                },
            ] : [],
            ...showNfrPartListing && !editNfr ? [
                {
                    element: "#backNFR_listing",
                    intro: t("nfr.back"),
                },
                {
                    element: "#viewNfrPart_list",
                    intro: t("nfr.view"),
                },

                {
                    element: "#addNfrPart_list",
                    intro: t("nfr.add"),
                },
                {
                    element: "#pushedNfrToSap",
                    intro: t("nfr.pushedNfrToSap"),
                },
                {
                    element: "#viewNfrRM_list",
                    intro: t("nfr.viewRm"),
                },
                {
                    element: "#viewOutSourcing_list",
                    intro: t("nfr.viewOutSourcing"),
                },

                {
                    element: "#editNfr_list",
                    intro: t("nfr.edit"),
                },
                {
                    element: "#associatePartWithTechnology",
                    intro: t("nfr.associatePartWithTechnology"),
                }

            ] : [],
            ...editNfr ? [
                {
                    element: "#back_addNfrPart",
                    intro: t("nfr.back_nfrpart"),
                    position: "left"
                },
                ...(config && config?.rowData.length !== 0) || (config && !config?.isViewEstimation) ? [


                    ...(config && !config?.isViewEstimation) ? [
                        {
                            element: ".input-container #VendorName_container",
                            intro: t("nfr.vendor"),
                        },
                        ...config && config?.isRowEdited ? [

                            {
                                element: "#addNfr_update",
                                intro: t("nfr.update_Estimation"),
                            }] : [],
                        {
                            element: "#addNfr_add",
                            intro: t("nfr.add_Estimation"),
                        },
                        {
                            element: "#addNfr_reset",
                            intro: introMessage,
                        },
                    ] : [],
                ] : [],
                ...(config && config?.rowData.length !== 0) ? [
                    {
                        element: "#CostingVersion_container",
                        intro: t("nfr.costingVersion"),
                    },
                    {
                        element: "#nfr_ViewCosting",
                        intro: t("nfr.viewCosting"),
                    },

                    ...(config && !config?.isViewEstimation) ? [
                        {
                            element: "#nfr_AddCosting",
                            intro: t("nfr.addCosting"),
                        },
                        {
                            element: "#nfr_EditCosting",
                            intro: t("nfr.editCosting"),
                        },
                        {
                            element: "#nfr_CopyCosting",
                            intro: t("nfr.copyCosting"),
                        },
                        {
                            element: "#nfr_DeleteCosting",
                            intro: t("nfr.deleteCosting"),
                        },
                        {
                            element: "#nfr_DiscardCosting",
                            intro: t("nfr.discardCosting"),
                        },
                        {
                            element: "#nfr_RowEdit",
                            intro: t("nfr.nfr_RowEdit"),
                        }] : [],

                ] : [],
            ] : [],


        ],
        ADD_NFR: [
            {
                element: " #AddNFR_Customer_RFQ_No",
                intro: t("addNfr.customer_rfq_no"),
            },

            {
                element: "#AddNFR_Customer_Name",
                intro: t("addNfr.customer_name"),
            },

            {
                element: ".input-container #AddNFR_Customer_Part_No",
                intro: t("addNfr.customer_part_no"),

            },
            {
                element: ".input-container #AddNFR_Part_Name",
                intro: t("addNfr.part_name"),
            },
            {
                element: ".input-container #AddNFR_Part_Description",
                intro: t("addNfr.part_description"),
            },
            {
                element: ".input-container #AddNFR_UOM",
                intro: t("addNfr.uom"),
            },
            {
                element: "#AddNFR_Product_Code",
                intro: t("addNfr.product_code"),
            },
            {
                element: "#AddNFR_Segment",
                intro: t("addNfr.segment"),
            },
            {
                element: ".input-container #AddNFR_Plant",
                intro: t("addNfr.plant"),
            },
            {
                element: "#AddNFR_ZBC_Date",
                intro: t("addNfr.zbc_date"),
            },
            {
                element: "#AddNFR_CBC_Date",
                intro: t("addNfr.cbc_date"),
            },
            {
                element: "#AddNFR_SOP_Date",
                intro: t("addNfr.sop_date"),
            },
            {
                element: "#AddNFR_AddForecast",
                intro: t("addNfr.add_forecast"),
            },
            {
                element: "#AddNFR_uploadFile",
                intro: t("addNfr.addRFQ_uploadFile"),
            },
            {
                element: "#AddNFR_CancelData",
                intro: t("addNfr.cancel"),
            },
            {
                element: "#SaveNFR_SubmitData",
                intro: t("addNfr.add"),
            },

            {
                element: "#AddNFR_SubmitData",
                intro: t("addNfr.submit"),
            },
        ]
    };

}
