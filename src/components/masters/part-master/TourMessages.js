export function Steps(t, config) {
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const Assembly_EffectiveDate = (config && config.isEditFlag === false) ? t("addAssemblyPart.AddAssemblyPart_EffectiveDate") : t("addAssemblyPart.AddAssemblyPart_Edit_EffectiveDate");
    const Component_EffectiveDate = (config && config.isEditFlag === false) ? t("addComponentPart.AddIndivisualPart_EffectiveDate") : t("addComponentPart.AddIndivisualPart_Edit_EffectiveDate");
    const Product_EffectiveDate = (config && config.isEditFlag === false) ? t("addProductPart.AddIndivisualPart_EffectiveDate") : t("addProductPart.AddIndivisualPart_Edit_EffectiveDate");

    return {
        ADD_ASSEMBLY_PART: [
            ...config && config.isEditFlag === false ? [{
                element: "#AddAssemblyPart_Switch",
                intro: t("addAssemblyPart.AddAssemblyPart_Switch"),

            },
            ...(config && config.partField ? [{
                element: "#AddAssemblyPart_PartNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_PartNumber"),
            },] : []),
            {
                element: "#AddAssemblyPart_BOMNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_BOMNumber"),
            },
            {
                element: "#AddAssemblyPart_AssemblyPartNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_AssemblyPartNumber"),
            },
            ] : [],
            {
                element: "#AddAssemblyPart_AssemblyPartName",
                intro: t("addAssemblyPart.AddAssemblyPart_AssemblyPartName"),
            },
            {
                element: "#AddAssemblyPart_Description",
                intro: t("addAssemblyPart.AddAssemblyPart_Description"),
            },
            {
                element: "#AddAssemblyPart_ECNNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_ECNNumber"),
            },
            {
                element: "#AddAssemblyPart_RevisionNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_RevisionNumber"),
            },
            {
                element: "#AddAssemblyPart_DrawingNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_DrawingNumber"),
            },
            {
                element: "#AddAssemblyPart_ProductGroup_container",
                intro: t("addAssemblyPart.AddAssemblyPart_ProductGroup_container"),
            },
            ...config && config.isEditFlag === false ? [
                {
                    element: "#AddAssemblyPart_TechnologyId_container",
                    intro: t("addAssemblyPart.AddAssemblyPart_TechnologyId_container"),
                }] : [],
            {
                element: "#AddAssemblyPart_EffectiveDate",
                intro: Assembly_EffectiveDate,
            },
            {
                element: "#AssemblyPart_Add_BOM",
                intro: t("addAssemblyPart.AssemblyPart_Add_BOM"),
            },
            {
                element: "#AddAssemblyPart_Remark",
                intro: t("addAssemblyPart.AddAssemblyPart_Remark"),
            },
            {
                element: "#AddAssemblyPart_UploadFiles",
                intro: t("addAssemblyPart.AddAssemblyPart_UploadFiles"),
            },
            {
                element: "#AddAssemblyPart_Cancel",
                intro: t("addAssemblyPart.AddAssemblyPart_Cancel"),
            },
            {
                element: "#AddAssemblyPart_Save",
                intro: introMessage,
                position: 'left'
            },
        ],
        ADD_COMPONENT_PART: [
            ...config && config.isEditFlag === false ? [
                {
                    element: "#AddIndivisualPart_PartNumber",
                    intro: t("addComponentPart.AddIndivisualPart_PartNumber"),
                },
                {
                    element: "#AddIndivisualPart_PartName",
                    intro: t("addComponentPart.AddIndivisualPart_PartName"),
                }] : [],
            {
                element: "#AddIndivisualPart_Description",
                intro: t("addComponentPart.AddIndivisualPart_Description"),
            },
            {
                element: "#AddIndivisualPart_ProductGroup_container",
                intro: t("addComponentPart.AddIndivisualPart_ProductGroup_container"),
            },
            {
                element: "#AddIndivisualPart_ECNNumber",
                intro: t("addComponentPart.AddIndivisualPart_ECNNumber"),
            },
            {
                element: "#AddIndivisualPart_RevisionNumber",
                intro: t("addComponentPart.AddIndivisualPart_RevisionNumber"),
            },
            {
                element: "#AddIndivisualPart_DrawingNumber",
                intro: t("addComponentPart.AddIndivisualPart_DrawingNumber"),
            },
            ...config && config.isEditFlag === false ? [
                {
                    element: "#AddIndivisualPart_TechnologyId_container",
                    intro: t("addComponentPart.AddIndivisualPart_TechnologyId_container"),
                }] : [],
            {
                element: "#AddIndivisualPart_EffectiveDate",
                intro: Component_EffectiveDate,
            },
            {
                element: "#AddIndivisualPart_Remark",
                intro: t("addComponentPart.AddIndivisualPart_Remark"),
            },
            {
                element: "#AddIndivisualPart_UploadFiles",
                intro: t("addComponentPart.AddIndivisualPart_UploadFiles"),
            },
            {
                element: "#AddIndivisualPart_Cancel",
                intro: t("addComponentPart.AddIndivisualPart_Cancel"),
            },
            {
                element: "#AddIndivisualPart_Save",
                intro: introMessage,
                position: 'left'
            },
        ],
        ADD_PRODUCT_PART: [
            ...config && config.isEditFlag === false ? [
                {
                    element: "#AddIndivisualPart_ProductName",
                    intro: t("addProductPart.AddIndivisualPart_ProductName"),
                },
                {
                    element: "#AddIndivisualPart_ProductNumber",
                    intro: t("addProductPart.AddIndivisualPart_ProductNumber"),
                },
                {
                    element: "#AddIndivisualPart_Description",
                    intro: t("addProductPart.AddIndivisualPart_Description"),
                },
            ] : [],
            {
                element: "#AddIndivisualPart_ProductGroupCode",
                intro: t("addProductPart.AddIndivisualPart_ProductGroupCode"),
            },
            ...config && config.isEditFlag === false ? [
                {
                    element: "#AddIndivisualPart_ECNNumber",
                    intro: t("addProductPart.AddIndivisualPart_ECNNumber"),
                },
                {
                    element: "#AddIndivisualPart_RevisionNumber",
                    intro: t("addProductPart.AddIndivisualPart_RevisionNumber"),
                },
                {
                    element: "#AddIndivisualPart_DrawingNumber",
                    intro: t("addProductPart.AddIndivisualPart_DrawingNumber"),
                },
            ] : [],
            {
                element: "#AddIndivisualPart_EffectiveDate",
                intro: Product_EffectiveDate,
            },

            {
                element: "#AddIndivisualProduct_isImpactCalculation",
                intro: t("addProductPart.AddIndivisualPart_IsImpactCalculation_container"),
            },

            {
                element: "#AddIndivisualPart_Remark",
                intro: t("addProductPart.AddIndivisualPart_Remark"),
            },
            {
                element: "#AddIndivisualPart_UploadFiles",
                intro: t("addProductPart.AddIndivisualPart_UploadFiles"),
            },
            {
                element: "#AddIndivisualPart_Cancel",
                intro: t("addProductPart.AddIndivisualPart_Cancel"),
            },
            {
                element: "#AddIndivisualPart_Save",
                intro: introMessage,
                position: 'left'
            },

        ],
    }
}