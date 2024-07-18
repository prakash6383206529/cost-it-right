// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { getViewBOPDetails } from '../../masters/actions/BoughtOutParts';

const BOPCompareTable = (props) => {

    const dispatch = useDispatch()
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);



    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])

    const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        const idArr = props.selectedRows.map(item => item.BoughtOutPartId)

        dispatch(getViewBOPDetails(idArr, res => { setIsLoader(false) }))
    }, [])
    useEffect(() => {
        if (viewBOPDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionOneHeader = ["BOP No.", "BOP Name", "Category", "UOM", /* "Specification", */ 'Plant (Code)', "vendor (Code)", 'Effective Date', 'Basic Rate']
            let sectionTwoHeader = ['Minimum Order Quantity', 'BOP Net Cost']
            let sectionThreeHeader = ['Remark']
            let mainHeader = []
            viewBOPDetails.map((item, index) => {
                //section one data start
                const effectiveDate = <input className='form-control defualt-input-value' disabled={true} value={DayTime(item.EffectiveDate).format('DD/MM/YYYY')} />
                const formattedDataOne = [
                    item.BoughtOutPartNumber,
                    item.BoughtOutPartName,
                    item.BoughtOutPartCategory,
                    item.UOM,
                    /*  item.BoughtOutPartSpecificationName, */
                    item.Plants,
                    item.Vendor,
                    effectiveDate,
                    item.BasicRate
                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    item.NumberOfPieces,
                    item.NetLandedCost
                ]
                sectionTwo.push(formattedDataTwo)

                //section Three
                sectionThree.push([item.Remark])

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item.Vendor,
                    onChange: () => checkBoxHandle(item,index),
                    checked: checkBoxCheck[index],
                    // isCheckBox: item.IsShowCheckBoxForApproval
                    isCheckBox: true

                }
                mainHeader.push(mainHeaderObj)
            })
            const sectionOneDataObj = {
                header: sectionOneHeader,
                data: sectionOne,
                isHighlightedRow: true,
            }
            const sectionTwoDataObj = {
                header: sectionTwoHeader,
                data: sectionTwo,
                isHighlightedRow: true,
            }
            const sectionThreeDataObj = {
                header: sectionThreeHeader,
                data: sectionThree,
                isHighlightedRow: false,
            }
            setSectionData([sectionOneDataObj, sectionTwoDataObj, sectionThreeDataObj])
            setMainHeadingData(mainHeader)
        }
    }, [viewBOPDetails])

    const checkBoxHandle = (item, index) => {
        setCheckBoxCheck(prevState => {
            const newState = { ...prevState, [index]: !prevState[index] }
            
            return newState
        })

        setSelectedItems(prevItems => {
            let newItems
            if (prevItems.some(i => i.BoughtOutPartId === item.BoughtOutPartId)) {
                newItems = prevItems.filter(i => i.BoughtOutPartId !== item.RawMaterialId)
            } else {
                newItems = [...prevItems, item]
            }
            return newItems
        })

        setSelectedIndices(prevIndices => {
            let newIndices
            if (prevIndices.includes(index)) {
                newIndices = prevIndices.filter(i => i !== index)
            } else {
                newIndices = [...prevIndices, index]
            }
            return newIndices
        })
    }
    

    useEffect(() => {
        props.checkCostingSelected(selectedItems, selectedIndices)
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props.checkCostingSelected(item,index)
    // }
    return (
        <div>
            <Table headerData={mainHeadingData} sectionData={sectionData}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
        </div>
    );
};
export default BOPCompareTable;
