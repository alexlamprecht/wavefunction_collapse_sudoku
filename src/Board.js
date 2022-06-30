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
    this.state.hasHelp = false;
  }

  initializeboardState(dataIndex) {
    if (dataIndex !== undefined) {
      return {
        cells: sudoku.data[dataIndex].split("").map((c) => {
          return {
            isActive: parseInt(c) > 0 ? true : false,
            value: parseInt(c),
            isInitial: parseInt(c) > 0 ? true : false,
            allowedNumbers: [],
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

    const allowedNumbers = [];
    for (let index = 1; index <= 9; index++) {
      if (!foundNumbers.has(index)) allowedNumbers.push(index);
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
      number: props.number,
      allowedNumbers: props.allowedNumbers,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  static getDerivedStateFromProps(props, current_state) {
    return {
      isActive: props.isActive,
      number: props.value,
      allowedNumbers: props.allowedNumbers,
    };
  }

  handleChange(e) {
    if (!this.props.isInitial) {
      this.props.handleChange(
        this.props.number,
        !this.state.isActive,
        e.target.value
      );
    }
  }

  renderNumber(cellNumber, i) {
    return (
      <button
        className={`${
          this.props.hasHelp && this.state.allowedNumbers.length === 1
            ? "highlight"
            : ""
        }`}
        key={`CellNumber-${cellNumber}-${i}`}
        value={i + 1}
        onClick={this.handleChange}
      >
        {i + 1}
      </button>
    );
  }

  render() {
    if (this.state.isActive) {
      return (
        <button
          className={`Cell Number ${this.state.isActive ? "active" : ""} ${
            this.props.isInitial ? "initial" : ""
          }`}
          value={0}
          onClick={this.handleChange}
        >
          {this.props.value}
        </button>
      );
    }
    if (this.props.hasHelp && this.state.allowedNumbers.length === 0) {
      return (
        <button className={`Cell Error`} value={0}>
          {"!"}
        </button>
      );
    }
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      if (
        !this.props.hasHelp ||
        this.state.allowedNumbers.find((element) => element === i + 1)
      ) {
        numbers.push(this.renderNumber(this.props.number, i));
      } else {
        numbers.push(<div className="emptyButton"></div>);
      }
    }

    return (
      <div className={`Cell ${this.state.isActive ? "active" : ""} `}>
        {numbers}
      </div>
    );
  }
}

export default Board;
