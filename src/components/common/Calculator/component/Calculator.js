import React from 'react';
import History from './History';
import DisplayToolbar from './DisplayToolbar';
import * as CalculatorWrapper from '../Calculator-core';
import Buttons from './Button';
import '../scss/import.scss';

class Calculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formula: [],
      history: [],
      input: '0',
      isShowHistory: false,
      afterCalculation: false
    }

    this.onDigit = this.onDigit.bind(this);
    this.onOperator = this.onOperator.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onEqual = this.onEqual.bind(this);
    this.onDecimal = this.onDecimal.bind(this);
    this.onParenthesis = this.onParenthesis.bind(this);
    this.onBackspace = this.onBackspace.bind(this);
    this.onHistory = this.onHistory.bind(this);
    this.onHistoryItemClicked = this.onHistoryItemClicked.bind(this);
    this.onClearHistory = this.onClearHistory.bind(this);
  }

  onDigit({ target }) {
    const digit = target?.innerText;
    const input = this.state.input;

    if (this.state.afterCalculation) {
      this.setState({
        input: digit,
        afterCalculation: false
      });
    } else if (input === '0') {
      this.setState({
        input: digit
      });
    } else if (CalculatorWrapper.isNotNumber(input)) {
      this.setState({
        input: digit,
        formula: this.state.formula.concat(input)
      });
    } else {
      this.setState({
        input: input.concat(digit)
      });
    }
  }

  onDecimal({ target }) {
    const decimal = target?.innerText;
    const input = this.state.input;

    if (this.state.afterCalculation) {
      this.setState({
        input: `0${decimal}`,
        afterCalculation: false
      });
    } else if (CalculatorWrapper.isNotNumber(input)) {
      this.setState({
        input: `0${decimal}`,
        formula: this.state.formula.concat(input)
      });
    } else if (!input.includes(decimal)) {
      this.setState({
        input: input.concat(decimal),
      });
    }
  }

  onOperator({ target }) {
    const operator = target?.innerText;
    const input = this.state.input;

    if (CalculatorWrapper.isOperator(input)) {
      this.setState({
        input: operator,
        afterCalculation: false
      });
    } else if (input !== '(') {
      this.setState({
        formula: this.state.formula.concat(this.state.input),
        input: operator,
        afterCalculation: false
      });
    }
  }

  onParenthesis({ target }) {
    const parenthesis = target?.innerText;
    const input = this.state.input;

    if (parenthesis === '(') {
      if ((CalculatorWrapper.isNumber(input) && input !== '0') ||
        (CalculatorWrapper.isNumber(input) && input === '0' && this.state.formula.length > 0) ||
        input === ')') {
        this.setState({
          input: parenthesis,
          formula: this.state.formula.concat([input, '*']),
          afterCalculation: false
        });
      } else if (CalculatorWrapper.isOperator(input) || input === '(') {
        this.setState({
          input: parenthesis,
          formula: this.state.formula.concat(input),
          afterCalculation: false
        });
      } else if (CalculatorWrapper.isNumber(input) && input === '0' && this.state.formula.length === 0) {
        this.setState({
          input: parenthesis,
          afterCalculation: false
        });
      }
    } else {
      const arrayOpenParenthesis = this.state.formula?.join("")?.match(/\(/g);
      const numOpenParenthesis = arrayOpenParenthesis ? arrayOpenParenthesis?.length : 0;

      const arrayCloseParenthesis = this.state.formula?.join("")?.match(/\)/g);
      const numCloseParenthesis = arrayCloseParenthesis ? arrayCloseParenthesis?.length : 0;

      if ((CalculatorWrapper.isNumber(input) || input === ')') && numOpenParenthesis > 0 && numOpenParenthesis > numCloseParenthesis) {
        this.setState({
          input: parenthesis,
          formula: this.state.formula.concat(input),
          afterCalculation: false
        });
      }
    }
  }

  onClear() {
    this.setState({
      formula: [],
      input: '0',
      afterCalculation: false
    });
  }

  onBackspace() {
    const input = this.state.input;
    const formula = this.state.formula;
    const currentInputLength = input.length;

    if (input === 'Infinity' || input === '-Infinity' || input === 'NaN') {
      this.setState({
        input: '0',
        afterCalculation: false
      });
    } else if (currentInputLength > 1) {
      this.setState({
        input: input?.slice(0, currentInputLength - 1),
        afterCalculation: false
      });
    } else if (input !== '0') {
      this.setState({
        input: '0',
        afterCalculation: false
      });
    } else if (formula.length > 0) {
      this.setState({
        input: formula?.[formula?.length - 1],
        formula: formula?.slice(0, formula?.length - 1),
        afterCalculation: false
      });
    }
  }

  onEqual() {
    const finalFormula = this.state.formula?.concat(this.state.input);
    const result = CalculatorWrapper.evaluate(finalFormula);

    if (!Number.isNaN(result)) {
      const newHistoryItem = {
        formula: finalFormula,
        result: result
      }

      this.setState({
        input: result + "",
        formula: [],
        history: [].concat(newHistoryItem, this.state.history),
        afterCalculation: true
      });
    }
  }

  onHistory() {
    this.setState({
      isShowHistory: !this.state.isShowHistory
    });
  }

  onClearHistory() {
    this.setState({
      history: [],
      isShowHistory: false
    });

  }

  onHistoryItemClicked({ target }) {
    const number = target?.getAttribute("value");
    const input = this.state.input;

    if (CalculatorWrapper.isNumber(input)) {
      this.setState({
        input: number
      });
    } else {
      this.setState({
        input: number,
        formula: this.state.formula.concat(input)
      });
    }
  }

  render() {
    return (<div>
      <div className="calculator">
        <DisplayToolbar
          formula={this.state.formula}
          input={this.state.input}
          onBackspace={this.onBackspace}
          githubURL={this.props?.githubURL}
          onHistory={this.onHistory}
          isShowHistory={this.state.isShowHistory}
          showCal={this.props?.showCal}
        />

        <Buttons
          onClear={this.onClear}
          onEqual={this.onEqual}
          onDecimal={this.onDecimal}
          onDigit={this.onDigit}
          onOperator={this.onOperator}
          onParenthesis={this.onParenthesis}
        />

        <History
          isShowHistory={this.state.isShowHistory}
          history={this.state.history}
          onHistoryItemClicked={this.onHistoryItemClicked}
          onEqual={this.onEqual}
          onClearHistory={this.onClearHistory}
        />
      </div>
    </div>
    )
  }
}

export default Calculator;
