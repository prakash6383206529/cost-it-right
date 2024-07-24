export const partType = [
    { label: 'Component/Assembly', value: 1 },
    { label: 'RawMaterial', value: 2 },
    { label: 'BOP', value: 5 },
]
export const RFQ = [
    { label: 'RFQ 1', value: 1 },
    { label: 'RFQ 2', value: 2 },
    { label: 'RFQ 3', value: 3 },
    { label: 'RFQ 4', value: 4 },
    { label: 'RFQ 5', value: 5 },
]
export const technology = [
    { label: 'Sheet Metal', value: 1 },
    { label: 'Plastic', value: 2 },
    { label: 'Rubber', value: 3 },
    { label: 'Machining', value: 4 },
    { label: 'Forging', value: 5 },
]
export const partNo = [
    { label: 'PT00232', value: 1 },
    { label: 'PT00234', value: 2 },
    { label: 'PT00235', value: 3 },
    { label: 'PT00236', value: 4 },
    { label: 'PT00237', value: 5 },
]
export const Vendor = [
    { label: 'Vendor0232', value: 1 },
    { label: 'Vendor0234', value: 2 },
    { label: 'Vendor0235', value: 3 },
    { label: 'Vendor0236', value: 4 },
    { label: 'Vendor0237', value: 5 },
]
export const Plant = [
    { label: 'Plant0232', value: 1 },
]

export const APIResponseData = [
    {
        "PartNo": "PN001",
        "PartType": "Component",
        "Technology": "Tech1",
        "VendorWithCode": "Vendor1_V001",
        "PlantWithCode": "Plant1_P001",
        "RMName": "RawMaterial1",
        "RMGrade": "GradeA",
        "RMSpecification": "Spec1",
        "RMCode": "RM001",
        "BOPName": "BOP1",
        "BopNumber": "B001",
        "Category": "CatA"
    },
    {
        "PartNo": "PN002",
        "PartType": "RawMaterial",
        "Technology": "Tech2",
        "VendorWithCode": "Vendor2_V002",
        "PlantWithCode": "Plant2_P002",
        "RMName": "RawMaterial2",
        "RMGrade": "GradeB",
        "RMSpecification": "Spec2",
        "RMCode": "RM002",
        "BOPName": "BOP2",
        "BopNumber": "B002",
        "Category": "CatB"
    },
    {
        "PartNo": "PN003",
        "PartType": "Component",
        "Technology": "Tech3",
        "VendorWithCode": "Vendor3_V003",
        "PlantWithCode": "Plant3_P003",
        "RMName": "RawMaterial3",
        "RMGrade": "GradeC",
        "RMSpecification": "Spec3",
        "RMCode": "RM003",
        "BOPName": "BOP3",
        "BopNumber": "B003",
        "Category": "CatC"
    },
    {
        "PartNo": "PN004",
        "PartType": "BoughtOutPart",
        "Technology": "Tech4",
        "VendorWithCode": "Vendor4_V004",
        "PlantWithCode": "Plant4_P004",
        "RMName": "RawMaterial4",
        "RMGrade": "GradeD",
        "RMSpecification": "Spec4",
        "RMCode": "RM004",
        "BOPName": "BOP4",
        "BopNumber": "B004",
        "Category": "CatD"
    },
    {
        "PartNo": "PN005",
        "PartType": "RawMaterial",
        "Technology": "Tech5",
        "VendorWithCode": "Vendor5_V005",
        "PlantWithCode": "Plant5_P005",
        "RMName": "RawMaterial5",
        "RMGrade": "GradeE",
        "RMSpecification": "Spec5",
        "RMCode": "RM005",
        "BOPName": "BOP5",
        "BopNumber": "B005",
        "Category": "CatE"
    }
]
export const response = {
    "QuotationAuctionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "Status": "Live",
    "StatusId": 38,
    "TotalAuctionExtensionDuration": "02:00",
    "QuoationAuctionVendorBidPriceDetail": [
        {
            "VendorName": "Vendor (code)",
            "QuotationAuctionVendorId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "Rank": 1,
            "IsDisplayRankToVendor": true,
            "Status": "Pending",
            "StatusId": 2,
            "PriceColourZone": "Green",
            "QuoationAuctionVendorBidPriceHistory": [
                {
                    "QuotationAuctionVendorBidPriceDetailsId": 101,
                    "QuotationAuctionVendorBidPriceCounterOfferId": 201,
                    "IsAcceptedCounterOfferPrice": true,
                    "Status": "Sent",
                    "StatusId": 3,
                    "Price": 1000.50,
                    "Remark": 0
                },
                {
                    "QuotationAuctionVendorBidPriceDetailsId": 102,
                    "QuotationAuctionVendorBidPriceCounterOfferId": null,
                    "IsAcceptedCounterOfferPrice": false,
                    "Status": "Sent",
                    "StatusId": 4,
                    "Price": 1050.00,
                    "Remark": 1
                }
            ]
        },
        {
            "VendorName": "Vendor B",
            "QuotationAuctionVendorId": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "Rank": 2,
            "IsDisplayRankToVendor": false,
            "Status": "Sent",
            "StatusId": 1,
            "PriceColourZone": "Yellow",
            "QuoationAuctionVendorBidPriceHistory": [
                {
                    "QuotationAuctionVendorBidPriceDetailsId": 103,
                    "QuotationAuctionVendorBidPriceCounterOfferId": 203,
                    "IsAcceptedCounterOfferPrice": false,
                    "Status": "Sent",
                    "StatusId": 2,
                    "Price": 980.75,
                    "Remark": 2
                }
            ]
        }
    ]
}