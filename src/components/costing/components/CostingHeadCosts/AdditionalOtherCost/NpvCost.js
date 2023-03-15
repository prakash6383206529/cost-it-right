import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import AddNpvCost from './AddNpvCost'


function NpvCost(props) {
    const [tableData, setTableData] = useState([])
    const [isOpenandClose, setisOpenandClose] = useState(false)

    const openAndCloseAddNpvDrawer = (type) => {
        if (type === 'Open') {
            setisOpenandClose(true)
        } else {
            setisOpenandClose(false)
        }
    }
    return (
        <Fragment>
            <Row className="mx-0">
                {
                    props.showNpvSection &&
                    <Col md="6">
                        <div className="left-border mt-3">
                            {'NPV Cost:'}
                        </div>
                    </Col>
                }
                {
                    props.showAddButton &&
                    <button
                        type="button"
                        className={"user-btn"}
                        onClick={() => openAndCloseAddNpvDrawer('Open')}
                        title="Add"
                    // disabled={isDisable}
                    >
                        <div className={"plus mr-0"}></div>
                    </button>
                }

                <Col md="6">
                    <Table className="table mb-0 forging-cal-table" size="sm">
                        <thead>
                            <tr>
                                <th>{`Type of NPV`}</th>
                                {<th>{`%`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th>{`Total`}</th>}

                            </tr>
                        </thead>
                        <tbody>
                            {tableData &&
                                tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item.NpvType} </td>
                                                {<td>{item.NpvPercentage}</td>}
                                                {<td>{checkForDecimalAndNull(item?.Quantity)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.Cost)}</td>}
                                            </tr>
                                        </Fragment>
                                    )
                                })}
                            {tableData && tableData.length === 0 && (
                                <tr>
                                    <td colspan="15">
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </Table>

                </Col>
            </Row>
            {isOpenandClose && <AddNpvCost
                isOpen={isOpenandClose}
                closeDrawer={openAndCloseAddNpvDrawer}
                anchor={'right'}
            />}
        </Fragment>
    )
}
export default React.memo(NpvCost)