import React, { Component } from 'react';
import { LabelComponent } from './LabelComponent';
//import {Input, TextArea, GenericInput} from 'react-text-input'; 

export default class InputBox extends Component {
    render() {
        const { children, mandatory, isDisabled = false,
            label, value, onChangeText, placeholder, 
            secureTextEntry = false, isSubmitted = false,
            keyboardType = 'default', maxLength = 150, 
            onSubmitEditing, onEndEditing, selection, iconName, IconSize } = this.props;
        let customWords = '';
        
        if (keyboardType === 'default') {
            customWords = 'sentences';
        } else if (keyboardType === 'email-address' || keyboardType === 'url') {
            customWords = 'none';
        }
        var TextArea = require('react-text-input').TextArea; // ES5

        return (
            <div>
                <LabelComponent label={label} mandatory={mandatory} />
                <div>
                   { {/* <Input type="search"
                        defaultValue="Christmas gifts"
                        placeholder={<span><i className="fa fa-search"/> Search</span>}
                        fitLineLength={true}
                    /> */} }
                </div>
            </div>
        );
    }
}

