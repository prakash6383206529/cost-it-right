export function Steps(t, config) {

    return {
        ADD_MACHINE_RATE: [
            {
                element: "#AddMachineRate_zeroBased",
                intro: t("addMachineRate.AddMachineRate_zeroBased"),
            },
            {
                element: "#AddMachineRate_vendorBased",
                intro: t("addMachineRate.AddMachineRate_vendorBased"),
            },
            {
                element: "#AddMachineRate_customerBased",
                intro: t("addMachineRate.AddMachineRate_customerBased"),
            },
            {
                element: "#AddMachineRate_technology_container",
                intro: t("addMachineRate.AddMachineRate_technology_container"),
            },
            ...(config && config.vendorField ? [{
                element: "#AddMachineRate_vendorName",
                intro: t("addMachineRate.AddMachineRate_Vendor_container"),
            },] : []),

            {
                element: "#AddMachineRate_Plant_container",
                intro: t("addMachineRate.AddMachineRate_Plant_container"),
            },

            ...(config && config.customerField ? [{

                element: "#AddMachineRate_clientName_container",
                intro: t("addMachineRate.AddMachineRate_customerNamer_container"),
            },] : []),

            {
                element: "#AddMachineRate_MachineNumber",
                intro: t("addMachineRate.AddMachineRate_MachineNumber_container"),
            },

            {
                element: "#AddMachineRate_Specification",
                intro: t("addMachineRate.AddMachineRate_Specification"),
            },
            {
                element: "#AddMachineRate_MachineName",
                intro: t("addMachineRate.AddMachineRate_MachineName"),
            },
            {
                element: "#AddMachineRate_MachineType_container",
                intro: t("addMachineRate.AddMachineRate_MachineType_container"),
            },
            {
                element: "#AddMachineRate_TonnageCapacity",
                intro: t("addMachineRate.AddMachineRate_TonnageCapacity"),
            },
            {
                element: "#AddMachineRate_EffectiveDate",
                intro: t("addMachineRate.AddMachineRate_EffectiveDate"),
            },
            {
                element: "#addMoreMachine_Details",
                intro: t("addMachineRate.AddMoreMachine_Details"),
            },
            {
                element: "#AddMachineRate_ProcessName_container",
                intro: t("addMachineRate.AddMachineRate_ProcessName_container"),
            },
            {
                element: "#Add_Machine_Process",
                intro: t("addMachineRate.AddMachineRate_ProcessName_container"),
            },

            {
                element: "#AddMachineRate_UOM_container",
                intro: t("addMachineRate.AddMachineRate_UOM_container"),
            },
            {
                element: "#AddMachineRate_MachineRate",
                intro: t("addMachineRate.AddMachineRate_MachineRate"),
            },
            {
                element: "#AddMachineRate_addmore",
                intro: t("addMachineRate.AddMachineRate_addmore"),
            },
            {
                element: "#AddMachineRate_reset",
                intro: t("addMachineRate.AddMachineRate_reset"),
            },

            {
                element: " #groupName_container",
                intro: t("addMachineProcessGroup.groupName"),
            },
            {
                element: ".input-container #process_container",
                intro: t("addMachineRate.process_container"),
            },
            {
                element: "#AddMoreDetails_Toggle",
                intro: t("addMachineRate.AddMoreDetails_Toggle"),
            },
            {
                element: "#AddMoreDetails_ProcessGroup_Add",
                intro: t("addMachineRate.AddMoreDetails_ProcessGroup_Add")
            },
            {
                element: "#addGroupProcess_Reset",
                intro: t("addMachineRate.AddProcessGroup_reset")
            },

            {
                element: "#AddMachineRate_Remark",
                intro: t("addMachineRate.AddMachineRate_Remark"),
            },
            {
                element: "#AddMachineRate_UploadFiles",
                intro: t("addMachineRate.AddMachineRate_UploadFiles"),
            },
            {
                element: "#AddMachineRate_Cancel",
                intro: t("addMachineRate.AddMachineRate_Cancel"),
            },
            {
                element: "#AddMachineRate_SendForApproval",
                intro: t("addMachineRate.AddMachineRate_SendForApproval"),
            }
        ],
        ADD_MACHINERATE_MORE_PROCESS: [
            {
                element: "#AddMachineRate_ProcessName_container",
                intro: t("addMachineRateMoreProcess.AddMachineRate_ProcessName_container"),
            },
            {
                element: "#Add_Machine_Process",
                intro: t("addMachineRateMoreProcess.Add_Machine_Process"),
            },
            {
                element: "#AddMachineRate_UOM_container",
                intro: t("addMachineRateMoreProcess.AddMachineRate_UOM_container"),
            },
            {
                element: "#AddMachineRate_MachineRate",
                intro: t("addMachineRateMoreProcess.AddMachineRate_MachineRate"),
            },
            {
                element: "#AddMachineRate_addmore",
                intro: t("addMachineRateMoreProcess.AddMachineRate_addmore"),
            },
            {
                element: "#groupName",
                intro: t("addMachineRateMoreProcess.groupName"),
            },
            {
                element: ".process-group-container #process_container",
                intro: t("addMachineRateMoreProcess.process_container"),
            },
            {
                element: "#AddMoreDetails_Toggle",
                intro: t("addMachineRateMoreProcess.AddMoreDetails_Toggle"),
            },
            {
                element: "#AddMoreDetails_ProcessGroup_Add",
                intro: t("addMachineRateMoreProcess.AddMoreDetails_ProcessGroup_Add"),
            },
            {
                element: "#AddMachineRate_Remark",
                intro: t("addMachineRateMoreProcess.AddMachineRate_Remark"),
            },
            {
                element: "#AddMachineRate_UploadFiles",
                intro: t("addMachineRateMoreProcess.AddMachineRate_UploadFiles"),
            },
            {
                element: "#AddMachineRate_Cancel",
                intro: t("addMachineRateMoreProcess.AddMachineRate_Cancel"),
            },
            {
                element: "#AddMachineRate_SendForApproval",
                intro: t("addMachineRateMoreProcess.AddMachineRate_SendForApproval"),
                position: 'left'
            },
        ],
        ADD_MACHINE_MORE_RATE_DETAILS: [
            {
                element: "#AddMoreDetails_Plant_container",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Plant_container"),
            },
            {
                element: "#AddMoreDetails_MachineName",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineName"),
            },
            {
                element: "#AddMoreDetails_Specification",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Specification"),
            },
            {
                element: "#AddMoreDetails_Description",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Description"),
            },
            {
                element: "#AddMoreDetails_MachineType_container",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineType_container"),
            },
            {
                element: "#AddMoreDetails_Manufacture",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Manufacture"),
            },
            {
                element: "#AddMoreDetails_yearofManfacturing",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_yearofManfacturing"),
            },
            {
                element: "#AddMoreDetails_TonnageCapacity",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_TonnageCapacity"),
            },
            {
                element: "#AddMoreDetails_MachineCost",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineCost"),
            },
            {
                element: "#AddMoreDetails_AccessoriesCost",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_AccessoriesCost"),
            },
            {
                element: "#AddMoreDetails_InstallationCharges",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_InstallationCharges"),
            },
            {
                element: "#AddMoreDetails_EffectiveDate",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_EffectiveDate"),
            },
        ],
        ADD_MACHINE_LOAN_AND_INTEREST: [
            {
                element: "#AddMoreDetails_LoanPercentage",
                intro: t("addLoanInterest.AddMoreDetails_LoanPercentage"),
            },
            {
                element: "#AddMoreDetails_RateOfInterestPercentage",
                intro: t("addLoanInterest.AddMoreDetails_RateOfInterestPercentage"),
            },
        ],
        ADD_MACHINE_WORKING_HOURS: [
            {
                element: "#AddMoreDetails_WorkingShift_container",
                intro: t("addWorkingHours.AddMoreDetails_WorkingShift_container"),
            },
            {
                element: "#AddMoreDetails_WorkingHoursPerShift",
                intro: t("addWorkingHours.AddMoreDetails_WorkingHoursPerShift"),
            },
            {
                element: "#AddMoreDetails_NumberOfWorkingDaysPerYear",
                intro: t("addWorkingHours.AddMoreDetails_NumberOfWorkingDaysPerYear"),
            },
            {
                element: "#AddMoreDetails_EfficiencyPercentage",
                intro: t("addWorkingHours.AddMoreDetails_EfficiencyPercentage"),
            },
        ],
        ADD_MACHINE_DEPRECIATION: [
            {
                element: "#AddMoreDetails_DepreciationTypeId_container",
                intro: t("addDepreciation.AddMoreDetails_DepreciationTypeId_container"),
            },
            {
                element: "#AddMoreDetails_DepreciationRatePercentage",
                intro: t("addDepreciation.AddMoreDetails_DepreciationRatePercentage"),
            },
            {
                element: "#AddMoreDetails_CastOfScrap",
                intro: t("addDepreciation.AddMoreDetails_CastOfScrap"),
            },
            {
                element: "#AddDetails_DateOfPurchase",
                intro: t("addDepreciation.AddDetails_DateOfPurchase"),
            },
        ],
        ADD_VARIABLE_COST: [
            {
                element: "#AnnualMaintanceAmount",
                intro: t("addVariableCost.AnnualMaintanceAmount"),
            },
            {
                element: "#AnnualConsumableAmount",
                intro: t("addVariableCost.AnnualConsumableAmount"),
            },
            {
                element: "#AnnualInsuranceAmount",
                intro: t("addVariableCost.AnnualInsuranceAmount"),
            },
            {
                element: "#AddMoreDetails_BuildingCostPerSquareFeet",
                intro: t("addVariableCost.AddMoreDetails_BuildingCostPerSquareFeet"),
            },
            {
                element: "#AddMoreDetails_MachineFloorAreaPerSquareFeet",
                intro: t("addVariableCost.AddMoreDetails_MachineFloorAreaPerSquareFeet"),
            },
            {
                element: "#AddMoreDetails_OtherYearlyCost",
                intro: t("addVariableCost.AddMoreDetails_OtherYearlyCost"),
            },
        ],
        ADD_MACHINE_POWER: [
            {
                element: "#AddMoreDetails_UtilizationFactorPercentage",
                intro: t("addMachinePower.AddMoreDetails_UtilizationFactorPercentage"),
            },
            {
                element: "#AddMoreDetails_PowerRatingPerKW",
                intro: t("addMachinePower.AddMoreDetails_PowerRatingPerKW"),
            },
        ],
        ADD_MACHINE_LABOUR: [
            {
                element: "#AddMoreDetails_LabourTypeIds_container",
                intro: t("addMachineLabour.AddMoreDetails_LabourTypeIds_container"),
            },
            {
                element: "#AddMoreDetails_NumberOfLabour",
                intro: t("addMachineLabour.AddMoreDetails_NumberOfLabour"),
            },
            {
                element: "#AddMoreDetails_Labour_Add",
                intro: t("addMachineLabour.AddMoreDetails_Labour_Add"),
            },
        ],
        ADD_MACHINE_PROCESS: [
            {
                element: "#AddMoreDetails_ProcessName_container",
                intro: t("addMachineProcess.AddMoreDetails_ProcessName_container"),
            },
            {
                element: "#AddMoreDetails_Process",
                intro: t("addMachineProcess.AddMoreDetails_Process"),
            },
            {
                element: "#AddMoreDetails_UOM_container",
                intro: t("addMachineProcess.AddMoreDetails_UOM_container"),
            },
            {
                element: "#AddMoreDetails_MachineRate",
                intro: t("addMachineProcess.AddMoreDetails_MachineRate"),
            },
            {
                element: "#AddMoreDetails_Process_Add",
                intro: t("addMachineProcess.AddMoreDetails_Process_Add"),
            },
        ],
        ADD_MACHINE_PROCESS_GROUP: [
            {
                element: "#groupName_container",
                intro: t("addMachineProcessGroup.groupName"),
            },
            {
                element: "#process_container .input-container",
                intro: t("addMachineProcessGroup.process_container"),
            },
            {
                element: "#AddMoreDetails_Toggle",
                intro: t("addMachineProcessGroup.AddMoreDetails_Toggle"),
            },
            {
                element: "#AddMoreDetails_ProcessGroup_Add",
                intro: t("addMachineProcessGroup.AddMoreDetails_ProcessGroup_Add")
            },
            {
                element: "#AddMoreDetails_Remark",
                intro: t("addMachineProcessGroup.AddMoreDetails_Remark"),
            },
            {
                element: "#AddMoreDetails_UploadFiles",
                intro: t("addMachineProcessGroup.AddMoreDetails_UploadFiles"),
            },
            {
                element: "#AddMoreDetails_Cancel",
                intro: t("addMachineProcessGroup.AddMoreDetails_Cancel"),
            },
            {
                element: "#AddMoreDetails_SendForApproval",
                intro: t("addMachineProcessGroup.AddMoreDetails_SendForApproval"),
                position: 'left'
            },

        ],
        ADD_MANAGE_PROCESS: [
            {
                element: "#AddProcessDrawer_ProcessName",
                intro: t("addManageProcess.AddProcessDrawer_ProcessName"),
            },
            {
                element: "#AddProcessDrawer_ProcessCode",
                intro: t("addManageProcess.AddProcessDrawer_ProcessCode"),
            },

            {
                element: "#AddProcessDrawer_Cancel",
                intro: t("addManageProcess.AddProcessDrawer_Cancel"),
            },
            {
                element: "#AddProcessDrawer_Save",
                intro: t("addManageProcess.AddProcessDrawer_Save"),
            },

        ]
    }
}