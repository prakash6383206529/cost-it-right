
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
                },
                {
                    element: "#GroupName_container",
                    intro: t("nfr.groupName"),
                },
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
                {
                    element: "#nfr_AddCosting",
                    intro: t("nfr.addCosting"),
                },
                {
                    element: "#nfr_ViewCosting",
                    intro: t("nfr.viewCosting"),
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
                },

            ] : [],

        ],
        ADD_NFR: [
            {
                element: " #NFRVersion_container",
                intro: t("addNfr.nfr_version"),
            },

            {
                element: "#ProductCode_container",
                intro: t("addNfr.product_code"),
            },

            {
                element: ".input-container #Plant_container",
                intro: t("addNfr.plant"),

            },
            {
                element: "#HeaderMaterial_container",
                intro: t("addNfr.header_material"),
            },
            {
                element: ".input-container #PartType_container",
                intro: t("addNfr.parttype"),
            },
            {
                element: ".input-container #UOM_container",
                intro: t("addNfr.uom"),
            },
            {
                element: "#Quantity_container",
                intro: t("addNfr.quantity"),
            },
            {
                element: "#AddNFR_AddData",
                intro: t("addNfr.add"),
            },
            {
                element: "#AddNFR_ResetData",
                intro: t("addNfr.reset"),
            },
            {
                element: "#AddNFR_CancelData",
                intro: t("addNfr.cancel"),
            },

            {
                element: "#AddNFR_SubmitData",
                intro: t("addNfr.submit"),
            },
        ]
    };

}
