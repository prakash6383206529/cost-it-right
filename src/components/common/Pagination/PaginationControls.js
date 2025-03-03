import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../layout/Button';
import { decrementPage, incrementPage, skipUpdate, updateCurrentRowIndex } from './paginationAction';

const PaginationControls = ({ totalRecordCount, getDataList, floatingFilterData, module }) => {
    
    const { pageNo, pageSize, currentRowIndex } = useSelector((state) => state.pagination);
    const dispatch = useDispatch();
    let pageSizeValue;
    if (pageSize?.pageSize50) {
        pageSizeValue = 50;
    } else if (pageSize?.pageSize100) {
        pageSizeValue = 100;
    } else {
        pageSizeValue = 10;
    }

    const handlePagination = (action) => {
        const newSkip = action === 'next' ? (pageNo * pageSizeValue) : ((pageNo - 2) * pageSizeValue);
        dispatch(skipUpdate(newSkip));
        const newPageNo = action === 'next' ? pageNo + 1 : pageNo - 1;
        dispatch(updateCurrentRowIndex(action === 'next' ? currentRowIndex + pageSizeValue : currentRowIndex - pageSizeValue));
        switch (module) {
            case 'RM':
                getDataList(null, null, null, null, null, 0, newSkip, pageSizeValue, true, floatingFilterData);
                break;
            case 'BOP':
                getDataList("", 0, "", "", newSkip, pageSizeValue, true, floatingFilterData);
                break;
            case 'Machine':
                getDataList('', 0, "", 0, "", '', newSkip, pageSizeValue, true, floatingFilterData);
                break;
            case 'Part':
                getDataList(newSkip, pageSizeValue, floatingFilterData, true);
                break;
            case 'Vendor':
                getDataList(newSkip, floatingFilterData, pageSizeValue, true);
                break;
            case 'overHeadAndProfits':
                getDataList(null, null, null, null, newSkip, pageSizeValue, true, floatingFilterData);
                break;
            case 'Operations':
                getDataList(null, null, null, null, newSkip, pageSizeValue, true, floatingFilterData);
                break;
            case 'Volume':
                getDataList(newSkip, pageSizeValue, true);
                break;
            case 'Outsourced':
                getDataList(newSkip, pageSizeValue, true)
                break;
            case 'Budget':
                getDataList(newSkip, pageSizeValue, true)
                break;
            case 'Approval':
                getDataList(newSkip, pageSizeValue, true, floatingFilterData, true)
                break;
            case 'SupplierManangement':
                getDataList(newSkip, pageSizeValue, true, floatingFilterData, true)
                break;
            case 'IndexData':
                getDataList(newSkip, pageSizeValue, true)
                break;
            case 'CommodityInIndex':
                getDataList(newSkip, pageSizeValue, true)
                break;
            case 'RFQ':
                
                getDataList(newSkip, pageSizeValue, true)
                break;
                case 'SOB' :
                    getDataList(newSkip , pageSizeValue , true , floatingFilterData)
                    break;
    
            // audit             getDataList(skip, pageSize, true, filterDataObj);
            // case 'IndexCommodity':
            //     getDataList(newSkip, pageSizeValue, true)
            //     break;

            default:
                break;
        }

        dispatch(action === 'next' ? incrementPage(newPageNo) : decrementPage(newPageNo));
    };

    const onBtPrevious = () => {
        if (pageNo > 1) {
            handlePagination('previous');
        }
    };

    const onBtNext = () => {
        const totalPages = totalRecordCount ? Math.ceil(totalRecordCount / pageSizeValue) : 0;
        if (pageNo < totalPages) {
            handlePagination('next');
        }
        if (pageNo >= totalPages) {
            return false;
        }
    };
    // op             getTableListData(null, null, null, null, previousNo, state.globalTake, true, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    // 
    return (
        <div className="d-flex pagination-button-container">
            <p>
                <Button id="commonPagination_previous" variant="previous-btn" onClick={onBtPrevious} />
            </p>
            {pageSize?.pageSize10 && (
                <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of {totalRecordCount ? (Math.ceil(totalRecordCount / 10)) : 0}
                </p>
            )}
            {pageSize?.pageSize50 && (
                <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of {totalRecordCount ? (Math.ceil(totalRecordCount / 50)) : 0}
                </p>
            )}
            {pageSize?.pageSize100 && (
                <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of {totalRecordCount ? (Math.ceil(totalRecordCount / 100)) : 0}
                </p>
            )}
            <p>
                <Button id="commonPagination_next" variant="next-btn" onClick={onBtNext} />
            </p>
        </div>
    );
};

export default PaginationControls;

