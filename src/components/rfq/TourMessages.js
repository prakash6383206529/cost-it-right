
export function Steps(t, config) {
    const SubmissionDate = (config && config.isEditFlag === false) ? t("RFQForm.SubmissionDate") : t("RFQForm.Edit_Rfq_SubmissionDate");

    return {
        VIEW_RFQ: [
            // {
            //     element: "#ViewRfq_checkBox",
            //     intro: t("rfqView.ViewRfq"),
            // },
            // ...config && config?.compare ? [

            {
                element: "#ViewRfq_compare",
                intro: t("rfqView.ViewRfq_compare"),
            },

            // ] : [],
            {
                element: ".ViewRfq_reset",
                intro: t("rfqView.ViewRfq_reset"),
            },


            {
                element: "#ViewRfq_back",
                intro: t("rfqView.ViewRfq_back"),
                position: "left",
            },
            ...config && config?.action ? [
                {
                    element: "#ViewRfq_remarkHistory",
                    intro: t("rfqView.ViewRfq_remarkHistory"),
                }
            ] : [],

            ...config && config?.action ? [
                {
                    element: "#ViewRfq_view",
                    intro: t("rfqView.ViewRfq_view"),
                }
            ] : [],

        ],
        RFQ_FORM: [
            ...(config && config.isEditFlag === false) ? [
                {
                    element: ".input-container #technology_container",
                    intro: t("RFQForm.Technology"),
                },
                {
                    element: ".input-container #nfrId_container",
                    intro: t("RFQForm.RFQNo"),
                },
                {
                    element: ".input-container #plant_container",
                    intro: t("RFQForm.PlantCode"),
                }] : [],
            {
                element: "#submissionDate_container",
                intro: SubmissionDate,
            },
            ...(config && config.isEditFlag === false) ? [

                {
                    element: ".input-container #partNumber_container",
                    intro: t("RFQForm.PartNo"),
                },
                {
                    element: "#addRFQDate_container",
                    intro: t("RFQForm.SOPDate"),
                },
                {
                    element: ".input-container #RMName_container",
                    intro: t("RFQForm.RMName"),
                },
                {
                    element: ".input-container #RMGrade_container",
                    intro: t("RFQForm.RMGrade"),
                },
                {
                    element: ".input-container #RMSpecification_container",
                    intro: t("RFQForm.RMSpecification"),
                },
                {
                    element: "#add_part",
                    intro: t("RFQForm.AddPart"),
                },
                {
                    element: " #reset_part",
                    intro: t("RFQForm.Reset"),
                },
                {
                    element: ".input-container #vendor_container",
                    intro: t("RFQForm.VendorCode"),
                },
                {
                    element: ".input-container #contactPerson_container",
                    intro: t("RFQForm.PointofContact"),
                },
                {
                    element: "#add_vendor",
                    intro: t("RFQForm.AddVendor"),
                },

                {
                    element: "#reset_vendor",
                    intro: t("RFQForm.ResetVendor"),
                },

                {
                    element: "#checkbox_container",
                    intro: t("RFQForm.VisibilityCheckbox"),
                },

                {
                    element: " #remark_container",
                    intro: t("RFQForm.Notes"),
                },
                {
                    element: " #addRFQ_uploadFile",
                    intro: t("RFQForm.UploadAttachment"),
                }] : [],
            {
                element: "#addRFQ_cancel",
                intro: t("RFQForm.cancel"),
            },

            {
                element: " #addRFQ_save",
                intro: t("RFQForm.save"),
            },


            {
                element: "#addRFQ_send",
                intro: t("RFQForm.send"),
            },
        ],



    };

}
