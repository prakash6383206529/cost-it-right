import { getConfigurationKey } from "../../helper";

export function Steps(t, config) {
    const introMessage = config && config.isEditFlag === true ? t("saveUpdateButton.Update_Button") : t("saveUpdateButton.Save_Button");

    const userManagementArray = [
        ...(config && config.isEditFlag === true) ? [
            {
                element: "#Change_Password",
                intro: t("userManagement.AddUser_ChangePassword"),
            }] : [],
        {
            element: "#FirstName_container",
            intro: t("userManagement.AddUser_FirstName"),
        },
        {
            element: "#LastName_container",
            intro: t("userManagement.AddUser_LastName"),
        },
        {
            element: "#Mobile_container",
            intro: t("userManagement.AddUser_Mobile"),
        },

        ...(config && config.RFQUser === true ? [
            ...(config && config.isEditFlag === false) ? [{
                element: ".input-container #Vendor_container",
                intro: t("userManagement.AddUser_Vendor"),
            }] : [],
            {
                element: ".input-container #Reporter_container",
                intro: t("userManagement.AddUser_PointOfContact"),
            },
            {
                element: "#primaryContact_container",
                intro: t("userManagement.AddUser_primaryContact"),
            },
        ] : []),
        ...(config && config.RFQUser === false ? [
            {
                element: "#PhoneNumber_container",
                intro: t("userManagement.AddUser_PhoneNumber"),
            },
            {
                element: "#Extension_container",
                intro: t("userManagement.AddUser_Extension"),
            },
        ] : []),
        ...(config && config.isEditFlag === false) ? [
            {
                element: "#EmailAddress_container",
                intro: t("userManagement.AddUser_Email"),
            },
            {
                element: "#UserName_container",
                intro: t("userManagement.AddUser_UserName"),
            }] : [],
        ...config && config?.isShowPwdField === true ? [
            {
                element: "#AddUser_Password",
                intro: t("userManagement.AddUser_Password"),
            },
            {
                element: "#AddUser_PasswordConfirm",
                intro: t("userManagement.AddUser_ConfirmPassword"),
            }] : [],
        {
            element: "#AddressLine1_container",
            intro: t("userManagement.AddUser_Address1"),
        },
        {
            element: "#AddressLine2_container",
            intro: t("userManagement.AddUser_Address2"),
        },
        {
            element: ".input-container #CityId_container",
            intro: t("userManagement.AddUser_City"),
        },
        {
            element: "#ZipCode_container",
            intro: t("userManagement.AddUser_ZipCode"),
        },
        ...(config && config.RFQUser === false ? [{

            element: ".input-container #RoleId_container",
            intro: t("userManagement.AddUser_Role"),
        },
        {
            element: ".input-container #DepartmentId_container",
            intro: t("userManagement.AddUser_Company"),
        },
        {
            element: ".input-container #plant_container",
            intro: t("userManagement.AddUser_plant"),
        },
        {
            element: "#AddUser_Checkbox",
            intro: t("userManagement.AddUser_Checkbox"),
        },
        {
            element: "#AddUser_Permissions_Costing",
            intro: t("userManagement.AddUser_Permissions_Costing"),
        },
        ...(config && config.costingField ? [{
            element: ".input-container #TechnologyId_container",
            intro: t("userManagement.AddUser_Technology"),
        },
        {
            element: '.input-container #CostingApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: ".input-container #LevelId_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddCosting",
            intro: t("userManagement.AddUser_AddApprovalType") + " Costing approval type",
        }
        ] : []),
        {
            element: "#AddUser_Permissions_Simulation",
            intro: t("userManagement.AddUser_Permissions_Simulation"),
        },
        ...(config && config.simulationField ? [{
            element: ".input-container #Head_container",
            intro: t("userManagement.AddUser_Head"),
        },
        {
            element: '.input-container #SimulationApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: ".input-container #simualtionLevel_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddSimulation",
            intro: t("userManagement.AddUser_AddApprovalType") + " Simulation approval type",
        }
        ] : []),
        {
            element: "#AddUser_Permissions_Master",
            intro: t("userManagement.AddUser_Permissions_Master"),
        },
        {
            element: "#AddUser_Permissions_onBoarding",
            intro: t("userManagement.AddUser_Permissions_onBoarding"),
        },
        ...(config && config.masterField ? [{
            element: ".input-container #Master_container",
            intro: t("userManagement.AddUser_Master"),
        },
        {
            element: '.input-container #MasterApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: ".input-container #masterLevel_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddMaster",
            intro: t("userManagement.AddUser_AddApprovalType") + " Master approval type",
        }
        ] : []),
        ...(config && config.onBoardingField ? [{
            element: ".input-container #OnboardingApprovalType_container",
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: '.input-container #onboardingLevel_container',
            intro: t("userManagement.AddUser_Level"),
        },

        {
            element: "#addUser_OnBoarding",
            intro: t("userManagement.AddUser_AddApprovalType") + " Onboarding approval type",
        }
        ] : []),
        ] : []),
        {
            element: "#AddUser_Cancel",
            intro: t("userManagement.AddUser_Cancel"),
        },
        {
            element: "#AddUser_Save",
            intro: introMessage,
        },


    ];
    const userDetails = [
        {
            element: "#edit_userDetails",
            intro: t("userManagement.user_EditDetails"),
        },
        {
            element: "#changePassword",
            intro: t("userManagement.user_changePassword"),
        },
        ...(config && config.RFQUser === false ? [{

            element: "#costing_level",
            intro: t("userManagement.user_ViewCostingLevels"),
        },
        {
            element: "#simulation_level",
            intro: t("userManagement.user_ViewSimulationLevels"),
        },
        {
            element: "#master_level",
            intro: t("userManagement.user_ViewMasterLevels"),
        },

        {
            element: "#onboarding_level",
            intro: t("userManagement.user_ViewOnBoardingLevels"),
        }
        ] : [])
    ]
    const addCompany = [
        {
            element: "#Department_DepartmentName",
            intro: t("addCompany.AddCompany_Name"),
        },
        {
            element: "#Department_DepartmentCode",
            intro: t("addCompany.AddCompany_Code"),
        },
        {
            element: "#Department_plant_container",
            intro: t("addCompany.AddCompany_PlantCode"),
        },
        {
            element: "#AddDepartment_Cancel",
            intro: t("addCompany.AddCompany_Cancel"),
        },


        {
            element: "#AddDepartment_Save",
            intro: introMessage,
        }
    ];
    const addRole = [
        {
            element: "#AddRole_Name",
            intro: t("addRole.AddRole_Name"),

        },
        {
            element: "#Dashboard",
            intro: t("addRole.dashboard"),
        },
        {
            element: "#Masters",
            intro: t("addRole.masters"),
        },
        {
            element: "#AdditionalMasters",
            intro: t("addRole.additionalMasters"),
        },
        {
            element: "#Costing",
            intro: t("addRole.costing"),
        },
        {
            element: "#Simulation",
            intro: t("addRole.simulation"),
        },
        {
            element: "#Reports",
            intro: t("addRole.reports"),
        },
        {
            element: "#Users",
            intro: t("addRole.users"),
        },
        {
            element: "#RFQ",
            intro: t("addRole.RFQ"),
        },
        {
            element: "#NFR",
            intro: t("addRole.NFR"),

        },
        {
            element: "#Audit",
            intro: t("addRole.audit"),
        },

        {
            element: "#AddRole_Cancel",
            intro: t("addRole.AddRole_Cancel"),
        },
        {
            element: "#AddRole_Save",
            intro: introMessage,
        }
    ];
    const AddlevelMapping = [
        ...(config && config.isEditFlag === false) ? [
            {
                element: "#AddApproval_CostingLevel",
                intro: t("approvalForm.AddApproval_CostingLevel"),
            },
            {
                element: "#AddApproval_SimulationLevel",
                intro: t("approvalForm.AddApproval_SimulationLevel"),
            },
            {
                element: "#AddApproval_MasterLevel",
                intro: t("approvalForm.AddApproval_MasterLevel"),
            },
            {
                element: "#AddApproval_OnBoardingLevel",
                intro: t("approvalForm.AddApproval_OnBoardingLevel"),
            },
            {
                element: "#Level_ApprovalType_container",
                intro: t("approvalForm.AddApproval_ApprovalType_Required"),
            },
            {
                element: "#Level_TechnologyId_container",
                intro: t("approvalForm.AddApproval_TechnologyHeads"),
            }] : [],
        {
            element: "#Level_LevelId_container",
            intro: t("approvalForm.AddApproval_HighestApprovalLevel"),
        },
        {
            element: "#AddApproval_Cancel",
            intro: t("approvalForm.AddApproval_Cancel"),
        },
        {
            element: "#AddApproval_Save",
            intro: introMessage,
        },
    ];
    const HightestLevel_Approval = [
        {
            element: "#levelTechnologyListing_costing",
            intro: t("highestApprovalLevel.costing"),
        },
        {
            element: "#levelTechnologyListing_simulation",
            intro: t("highestApprovalLevel.simulation"),
        },
        {
            element: "#levelTechnologyListing_master",
            intro: t("highestApprovalLevel.master"),
        },
        ...(getConfigurationKey().IsShowOnboarding ? [
            {
                element: "#levelTechnologyListing_onboarding",
                intro: t("highestApprovalLevel.onBoarding"),
            }] : []),
        {
            element: "#levelTechnologyListing_add",
            intro: t("highestApprovalLevel.add"),
        },
        {
            element: "#filter-text-box",
            intro: t("highestApprovalLevel.searchingBox"),
        },
        {
            element: ".ag-text-field-input",
            intro: t("highestApprovalLevel.floatingFilterInput"),
        },
        {
            element: ".ag-floating-filter-button",
            intro: t("highestApprovalLevel.floatingFilterButton"),
        },
        {
            element: ".HighestApproval_Refresh",
            intro: t("highestApprovalLevel.refresh"),
        },

        {
            element: ".HighestApproval_Edit",
            intro: t("highestApprovalLevel.edit"),
        },



    ];



    return {
        USER_MANAGEMENT: userManagementArray,
        USER_DETAILS: userDetails,
        ADD_COMPANY: addCompany,
        ADD_ROLE: addRole,
        ADD_LEVEL_MAPPING: AddlevelMapping,
        HIGHTEST_LEVEL_APPROVAL: HightestLevel_Approval
    };
}
