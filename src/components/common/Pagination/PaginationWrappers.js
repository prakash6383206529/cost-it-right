import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize, skipUpdate, resetStatePagination } from './paginationAction';

export function PaginationWrappers(props) {

    const dispatch = useDispatch();
    const { currentRowIndex, globalTakes } = useSelector((state) => state.pagination);
    const { getDataList, totalRecordCount, floatingFilterData, gridApi, module } = props;



    const getDataListByModule = (newSkip, numericPageSize, floatingFilterData, module) => {
        switch (module) {
            case 'RM':
                getDataList(null, null, null, null, null, 0, newSkip, numericPageSize, true, floatingFilterData);
                break;
            case 'BOP':
                getDataList("", 0, "", "", newSkip, numericPageSize, true, floatingFilterData);
                break;
            case 'Machine':
                getDataList('', 0, "", 0, "", '', newSkip, numericPageSize, true, floatingFilterData);
                break;
            case 'Part':
                getDataList(newSkip, numericPageSize, floatingFilterData, true);
                break;
            case 'Vendor':
                getDataList(newSkip, floatingFilterData, numericPageSize, true);
                break;
            case 'overHeadAndProfits':
                getDataList(null, null, null, null, newSkip, numericPageSize, true, floatingFilterData);
                break;
            case 'Operations':
                getDataList(null, null, null, null, newSkip, numericPageSize, true, floatingFilterData);
                break;
            case 'Volume':
                getDataList(newSkip, numericPageSize, true);
                break;
            case 'Outsourcing':
                getDataList(newSkip, numericPageSize, true);
                break;
            case 'Budget':
                getDataList(newSkip, numericPageSize, true);
                break;
            case 'Approval':
                getDataList(newSkip, numericPageSize, true, floatingFilterData, true)
                break;
            case 'IndexCommodity':
                getDataList(newSkip, numericPageSize, true)
                break;
            case 'CommodityInIndex':
                getDataList(newSkip, numericPageSize, true)
                break;
            case 'StandardizedCommodity':
                getDataList(newSkip, numericPageSize, true)
                break;
            case 'IndexData':
                getDataList(newSkip, numericPageSize, true)
                break;
            case 'RFQ':
                getDataList(newSkip, numericPageSize, true)
                break;
            case 'SOB':
                getDataList(newSkip, numericPageSize, floatingFilterData, true)
                break;
            case 'User':
                getDataList(null, null, newSkip, numericPageSize, floatingFilterData, true)
                break;
            case 'AssemblyPart':
                getDataList(newSkip, numericPageSize, floatingFilterData, true)
                break;
            default:
                break;
        }
    };

    const onPageSizeChanged = (newPageSize) => {

        const totalPages = Math.ceil(totalRecordCount / newPageSize);
        const newPageNo = currentRowIndex / newPageSize;
        const calculatedPageNo = newPageNo > Math.ceil(newPageNo) ? Math.ceil(newPageNo) + 1 : Math.ceil(newPageNo);
        const numericPageSize = Number(newPageSize);
        if (calculatedPageNo > totalPages) {
            const skip = 0
            dispatch(skipUpdate(skip));
            dispatch(updatePageNumber(1));
            dispatch(resetStatePagination())
            dispatch(setCurrentRowIndex(numericPageSize));
            dispatch(updateGlobalTake(Number(newPageSize)));
            dispatch(updatePageSize({
                pageSize10: numericPageSize === 10,
                pageSize50: numericPageSize === 50,
                pageSize100: numericPageSize === 100,
            }));
            getDataListByModule(skip, numericPageSize, floatingFilterData, module);

            // switch (module) {
            //     case 'RM':
            //         getDataList(null, null, null, null, null, 0, skip, numericPageSize, true, floatingFilterData);
            //         break;
            //     case 'BOP':
            //         getDataList("", 0, "", "", skip, numericPageSize, true, floatingFilterData);
            //         break;
            //     case 'Machine':
            //         getDataList('', 0, "", 0, "", '', skip, numericPageSize, true, floatingFilterData);
            //         break;
            //     case 'Part':

            //         getDataList(skip, numericPageSize, floatingFilterData, true);
            //         break;
            //     case 'Vendor':
            //         getDataList(skip, floatingFilterData, numericPageSize, true);
            //         break;
            //     case 'overHeadAndProfits':
            //         getDataList(null, null, null, null, skip, numericPageSize, true, floatingFilterData);
            //         break;
            //     case 'Operations':
            //         getDataList(null, null, null, null, skip, numericPageSize, true, floatingFilterData);
            //         break;
            //     case 'Volume':
            //         getDataList(skip, numericPageSize, true);
            //         break;
            //     case 'Outsourcing':
            //         getDataList(skip, numericPageSize, true);
            //         break;
            //     case 'Budget':
            //         getDataList(skip, numericPageSize, true);
            //         break;



            //     default:
            //         break;
            // }
        } else {
            // const newSkip = Math.max(0, Math.floor(currentRowIndex / numericPageSize) - 1) * numericPageSize;
            const newSkip = (calculatedPageNo - 1) * numericPageSize; // Adjusted the calculation here
            dispatch(skipUpdate(newSkip));
            const pageSizeValues = {
                pageSize10: numericPageSize === 10,
                pageSize50: numericPageSize === 50,
                pageSize100: numericPageSize === 100,
            };
            dispatch(updateGlobalTake(numericPageSize));
            dispatch(updatePageNumber(calculatedPageNo));
            dispatch(updatePageSize(pageSizeValues));
            getDataListByModule(newSkip, numericPageSize, floatingFilterData, module);

        }
        if (props?.isApproval) {
            // Apply approval logic
            gridApi.paginationSetPageSize(numericPageSize);
            props?.isPageNoChange('master');
        } else {
            // Default logic
            gridApi.paginationSetPageSize(numericPageSize);
        }

        // gridApi.paginationSetPageSize(numericPageSize);
    };

    return (
        <div className="paging-container d-inline-block float-right">
            <select
                className="form-control paging-dropdown"
                value={globalTakes}
                onChange={(e) => onPageSizeChanged(e.target.value)}
                id="page-size"
            >
                <option value={props.pageSize1 || 10}>10</option>
                <option value={props.pageSize2 || 50}>50</option>
                <option value={props.pageSize3 || 100}>100</option>
            </select>
        </div>
    );
}
