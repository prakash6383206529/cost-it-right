import Switch from "react-switch";
import React from 'react';

export function renderActionCommon(actions, parentIndex, thisRef, moduleName) {

    let actionHeads = []

    const { actionData, actionSelectList } = thisRef.state;
    let actionNames = actionData && actionData.find(el => el.ModuleName === moduleName)
    if (actionNames !== undefined) {
        actionSelectList && actionSelectList.map((item, index) => {
            if (item.Value === 0) return false;
            if (actionNames.ActionItems && actionNames.ActionItems.includes(item.Text)) {
                actionHeads.push(item.Value)           //COLLECTING ACTION ID OF ALL ACTIONS IN HEADER 
            }
        })
    }

    return actionHeads && actionHeads.map((el, i) => {
        let value = false    // BOOLEAN VALUE TO MANAGE WEATHER TO RETURN A SWITCH BUTTON OR A EMPTY DIV

        return actions && actions.map((item, index) => {        // ACTIONS ARRAY IS ALL ACTION ID OF THE ACTUAL PERMISION THAT IS GIVEN

            if (item.ActionId !== el && index !== actions.length - 1) { return false }    // RETURN FALSE IF ACTION ID IS NOT EQUAL TO ELEMENT IN THE ACTIONHEAD ARRAY & INDEX IS NOT THE LAST INDEX
            else if (item.ActionId === el) {
                value = true          // MAKING VALUE TRUE IF A SWITCH BUTTON WILL BE RETURNED (OF GIVEN PERMISSION)
            }
            if (item.ActionId !== el && index === actions.length - 1 && value === false) {   // RETURN EMPTY DIV IF ACTION ID IS NOT EQUAL TO ELEMENT IN THE ACTIONHED ARRAY & INDEX IS THE LAST INDEX
                return <td></td>
            }
            if (item.ActionId !== el && index === actions.length - 1 && value === true) { return false }

            return (
                <td className="text-center">
                    {
                        <label htmlFor="normal-switch" className="normal-switch">
                            <Switch
                                onChange={() => thisRef.actionCheckHandler(parentIndex, index, actions)}
                                checked={item.IsChecked}
                                value={item.ActionId}
                                id="normal-switch"
                                onColor="#4DC771"
                                onHandleColor="#ffffff"
                                offColor="#959CB6"
                                checkedIcon={false}
                                uncheckedIcon={false}
                                height={18}
                                width={40}
                            />
                        </label>
                    }
                </td>
            )
        })

    })
}