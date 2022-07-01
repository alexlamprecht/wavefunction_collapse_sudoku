import React, { Component } from "react";
import "./Board.css";
import sudoku from "./sudoku_data.json";

class Board extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    let randomDataIndex = Math.floor(Math.random() * sudoku.data.length);
    this.randomDataIndex = randomDataIndex;
    this.state = this.initializeboardState(randomDataIndex);
    this.state.hasHelp = true;
  }

  initializeboardState(dataIndex) {
    if (dataIndex !== undefined) {
      return {
        cells: sudoku.data[dataIndex].split("").map((c) => {
          return {
            isActive: parseInt(c) > 0 ? true : false,
            value: parseInt(c),
            isInitial: parseInt(c) > 0 ? true : false,
            allowedNumbers: new Set(),
          };
        }),
      };
    }
    return {
      cells: Array.from({ length: 81 }, (_, i) => {
        return {
          isActive: false,
          value: 0,
          isInitial: false,
          allowedNumbers: [...Array(10).keys()],
        };
      }),
    };
  }

  resetInitialIndex() {
    let randomDataIndex = Math.floor(Math.random() * sudoku.data.length);
    this.randomDataIndex = randomDataIndex;
    this.setState(this.initializeboardState(randomDataIndex));
  }

  computeAllowedNumbers(cellNumber) {
    if (!this.state) {
      return Array.from({ length: 9 }, (_, i) => i + 1);
    }
    const column = cellNumber % 9;
    const row = Math.floor(cellNumber / 9);
    const blockColumn = Math.floor(column / 3);
    const blockRow = Math.floor(row / 3);

    const foundNumbers = new Set();

    for (let x = 0; x < 9; x++) {
      foundNumbers.add(parseInt(this.state.cells[row * 9 + x].value));
    }

    for (let x = 0; x < 9; x++) {
      foundNumbers.add(parseInt(this.state.cells[column + 9 * x].value));
    }

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        foundNumbers.add(
          parseInt(
            this.state.cells[blockRow * 9 * 3 + blockColumn * 3 + x + 9 * y]
              .value
          )
        );
      }
    }

    const allowedNumbers = new Set();
    for (let index = 1; index <= 9; index++) {
      if (!foundNumbers.has(index)) allowedNumbers.add(index);
    }
    return allowedNumbers;
  }

  handleChange(cellNumber, activeState, value) {
    const updateCells = this.state.cells;

    updateCells[cellNumber] = {
      isActive: activeState,
      value,
    };
    this.setState({ cells: updateCells });
  }

  toggleHelp() {
    this.setState({ hasHelp: !this.state.hasHelp });
  }

  renderCell(i) {
    const allowedNumbers = this.computeAllowedNumbers(i);
    return (
      <Cell
        key={`Cell-${i}`}
        number={i}
        isActive={this.state.cells[i].isActive}
        isInitial={this.state.cells[i].isInitial}
        value={this.state.cells[i].value}
        allowedNumbers={allowedNumbers}
        hasHelp={this.state.hasHelp}
        handleChange={this.handleChange}
      />
    );
  }

  render() {
    const cells = [];
    for (let i = 0; i < 81; i++) {
      cells.push(this.renderCell(i));
    }
    return (
      <div className="BoardContainer">
        <div className="Board"> {cells}</div>

        <div className="UIContainer">
          <div className="helpToggle UIButton">
            <input
              type="checkbox"
              id="switch"
              defaultChecked={this.state.hasHelp}
              onChange={() => this.toggleHelp()}
            />
            <label for="switch">Help</label>
          </div>

          <button
            className="UIButton"
            onClick={(e) => {
              this.setState(this.resetInitialIndex());
            }}
          >
            random
          </button>
          <button
            className="UIButton"
            onClick={(e) => {
              this.setState(this.initializeboardState(this.randomDataIndex));
            }}
          >
            reset
          </button>
          <button
            className="UIButton"
            onClick={(e) => {
              this.setState(this.initializeboardState());
            }}
          >
            empty
          </button>
        </div>
      </div>
    );
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: props.isActive,
      value: props.value,
      number: props.number,
      allowedNumbers: props.allowedNumbers,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClickOnNumber = this.handleClickOnNumber.bind(this);
  }
  static getDerivedStateFromProps(props, current_state) {
    return {
      isActive: props.isActive,
      value: props.value,
      allowedNumbers: props.allowedNumbers,
    };
  }

  handleChange(val) {
    if (this.props.isActive) {
      return this.props.handleChange(this.props.number, false, 0);
    }
    return this.props.handleChange(this.props.number, true, val);
  }

  handleClickOnNumber(v) {
    this.handleChange(v);
  }

  render() {
    const numbers = [];

    for (let i = 0; i < 9; i++) {
      const isActive = this.state.value === i + 1;
      const isProtected = this.state.value === i + 1 && this.props.isInitial;
      const isHidden =
        (this.state.isActive && this.state.value !== i + 1) ||
        (!this.state.isActive &&
          this.props.hasHelp &&
          !this.state.allowedNumbers.has(i + 1));
      const isHightlight =
        !isHidden &&
        this.props.hasHelp &&
        this.state.allowedNumbers.size === 1 &&
        this.state.allowedNumbers.has(i + 1);
      numbers.push(
        <Number
          key={`CellNumber-${this.props.number}-${i + 1}`}
          value={i + 1}
          isActive={isActive}
          isProtected={isProtected}
          isHightlight={isHightlight}
          isHidden={isHidden}
          handleClick={this.handleClickOnNumber}
        ></Number>
      );
    }

    return <div className={`Cell`}>{numbers}</div>;
  }
}

class Number extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    if (!this.props.isProtected) {
      this.props.handleClick(this.props.value);
    }
  }

  renderNumber() {
    return (
      <button
        className={`CellNumber ${this.props.isActive ? "active" : ""} ${
          this.props.isHightlight ? "highlight" : ""
        } ${this.props.isProtected ? "protected" : ""} ${
          !this.props.isHidden && !this.props.isActive ? "visible" : ""
        }  ${
          this.props.isActive && this.props.value % 3 === 0
            ? "active-shift-l"
            : ""
        } ${
          this.props.isActive && (this.props.value + 2) % 3 === 0
            ? "active-shift-r"
            : ""
        } ${
          this.props.isActive && this.props.value < 4 ? "active-shift-b" : ""
        } ${this.props.isActive && this.props.value > 6 ? "active-shift-t" : ""}
        ${
          this.props.isActive &&
          this.props.value < 4 &&
          (this.props.value + 2) % 3 === 0
            ? "active-shift-br"
            : ""
        }
        ${
          this.props.isActive &&
          this.props.value < 4 &&
          this.props.value % 3 === 0
            ? "active-shift-bl"
            : ""
        }
        ${
          this.props.isActive &&
          this.props.value > 6 &&
          (this.props.value + 2) % 3 === 0
            ? "active-shift-tr"
            : ""
        }
        ${
          this.props.isActive &&
          this.props.value > 6 &&
          this.props.value % 3 === 0
            ? "active-shift-tl"
            : ""
        }`}
        onClick={
          this.props.isProtected || this.props.isHidden
            ? () => {}
            : this.handleClick
        }
        value={this.props.value}
      >
        {this.props.value}
      </button>
    );
  }

  render() {
    return this.renderNumber();
  }
}

export default Board;
