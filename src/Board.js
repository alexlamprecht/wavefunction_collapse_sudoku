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
    this.computeAllowedNumbersForAllCells(this.state.cells);
    this.computeAllowedNumbersFreqForAllCells(this.state.cells);
    this.state.hasHelp = true;
  }

  initializeboardState(dataIndex) {
    if (dataIndex !== undefined) {
      console.log("Sudoku", dataIndex, "loaded succesfully!");
      return {
        cells: sudoku.data[dataIndex].split("").map((c) => {
          return {
            isActive: parseInt(c) > 0,
            value: parseInt(c),
            isInitial: parseInt(c) > 0,
            allowedNumbers: new Set(),
            allowedNumbersFreqEqOne: new Set(),
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
          allowedNumbers: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
          allowedNumbersFreqEqOne: new Set(),
        };
      }),
    };
  }

  loadRandomSudokuFromData() {
    let randomDataIndex = Math.floor(Math.random() * sudoku.data.length);
    this.randomDataIndex = randomDataIndex;
    let cells = this.initializeboardState(randomDataIndex).cells;
    cells = this.computeAllowedNumbersForAllCells(cells);
    cells = this.computeAllowedNumbersFreqForAllCells(cells);
    this.setState({ cells: cells });
  }

  resetToInitial() {
    let cells = this.state.cells;
    cells.forEach((cell) => {
      if (!cell.isInitial) {
        cell.value = 0;
        cell.isActive = false;
      }
    });
    cells = this.computeAllowedNumbersForAllCells(cells);
    cells = this.computeAllowedNumbersFreqForAllCells(cells);
    this.setState({ cells: cells });
  }

  makeInitial() {
    let cells = this.state.cells;
    cells.forEach((cell) => {
      if (cell.isActive) {
        cell.isInitial = true;
      }
    });
    cells = this.computeAllowedNumbersForAllCells(cells);
    cells = this.computeAllowedNumbersFreqForAllCells(cells);
    this.setState({ cells: cells });
  }

  computeAllowedNumbers(cellNumber, cells) {
    if (!cells) {
      return new Set(Array.from({ length: 9 }, (_, i) => i + 1));
    }
    const column = cellNumber % 9;
    const row = Math.floor(cellNumber / 9);
    const blockColumn = Math.floor(column / 3);
    const blockRow = Math.floor(row / 3);

    const foundNumbers = new Set();

    for (let x = 0; x < 9; x++) {
      foundNumbers.add(parseInt(cells[row * 9 + x].value));
      foundNumbers.add(parseInt(cells[column + 9 * x].value));
    }

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        foundNumbers.add(
          parseInt(cells[blockRow * 9 * 3 + blockColumn * 3 + x + 9 * y].value)
        );
      }
    }

    const allowedNumbers = new Set();
    for (let index = 1; index <= 9; index++) {
      if (!foundNumbers.has(index)) allowedNumbers.add(index);
    }
    return allowedNumbers;
  }

  computeAllowedNumbersForAllCells(cells) {
    const newCells = [];
    cells.forEach((cell, index) => {
      cell.allowedNumbers = this.computeAllowedNumbers(index, cells);

      newCells.push(cell);
    });
    return newCells;
  }

  computeAllowedNumbersFreqEqOne(cellNumber, cells) {
    const foundAllowedNumbersFreqHor = new Array(10).fill(0);
    const foundAllowedNumbersFreqVert = new Array(10).fill(0);
    const foundAllowedNumbersFreqBlock = new Array(10).fill(0);
    if (cells[cellNumber].isActive) return new Set();
    const column = cellNumber % 9;
    const row = Math.floor(cellNumber / 9);
    const blockColumn = Math.floor(column / 3);
    const blockRow = Math.floor(row / 3);

    cells[cellNumber].allowedNumbers.forEach((an) => {
      for (let x = 0; x < 9; x++) {
        let cellIndex = row * 9 + x;

        if (
          !cells[cellIndex].isActive &&
          cells[cellIndex].allowedNumbers.has(an)
        )
          foundAllowedNumbersFreqHor[an]++;

        cellIndex = column + 9 * x;

        if (
          !cells[cellIndex].isActive &&
          cells[cellIndex].allowedNumbers.has(an)
        )
          foundAllowedNumbersFreqVert[an]++;
      }

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          let cellIndex = blockRow * 9 * 3 + blockColumn * 3 + x + 9 * y;

          if (
            !cells[cellIndex].isActive &&
            cells[cellIndex].allowedNumbers.has(an)
          )
            foundAllowedNumbersFreqBlock[an]++;
        }
      }
    });
    const foundAllowedNumbersFreqEqOne = new Set();
    foundAllowedNumbersFreqHor.map((e, i) => {
      if (e === 1) foundAllowedNumbersFreqEqOne.add(i);
      return null;
    });
    foundAllowedNumbersFreqVert.map((e, i) => {
      if (e === 1) foundAllowedNumbersFreqEqOne.add(i);
      return null;
    });
    foundAllowedNumbersFreqBlock.map((e, i) => {
      if (e === 1) foundAllowedNumbersFreqEqOne.add(i);
      return null;
    });

    return foundAllowedNumbersFreqEqOne;
  }

  computeAllowedNumbersFreqForAllCells(cells) {
    const newCells = [];
    for (let c = 0; c < cells.length; c++) {
      let cell = cells[c];
      cell.allowedNumbersFreqEqOne = this.computeAllowedNumbersFreqEqOne(
        c,
        cells
      );
      newCells.push(cell);
    }
    return newCells;
  }

  solve(steps = 9999) {
    let cells = this.state.cells;
    let stepCounter = 0;
    function isSolved(cells) {
      for (let i = 0; i < cells.length; i++) {
        if (!cells[i].isActive) return false;
      }
      return true;
    }

    function hasError(cells) {
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].isActive) continue;
        if (cells[i].allowedNumbers.size === 0) return true;
      }
      return false;
    }
    function getRandomItem(set) {
      let items = Array.from(set);
      return items[Math.floor(Math.random() * items.length)];
    }

    function findNextOnlyPossible(cells) {
      let possibleCells = new Set();
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].isActive) continue;
        if (
          cells[i].allowedNumbers.size === 1 ||
          cells[i].allowedNumbersFreqEqOne.size === 1
        ) {
          possibleCells.add(i);
        }
      }
      if (possibleCells.size > 0) {
        return getRandomItem(possibleCells);
      }
      return false;
    }

    function solveCell(cells, cellNumber) {
      let nextVal =
        cells[cellNumber].allowedNumbersFreqEqOne.values().next().value ||
        cells[cellNumber].allowedNumbers.values().next().value;
      // console.log(nextVal);
      cells[cellNumber].value = nextVal;
      cells[cellNumber].isActive = true;
      return cells;
    }

    while (!isSolved(cells) && stepCounter < steps) {
      const nextOnlyPossible = findNextOnlyPossible(cells);
      if (nextOnlyPossible !== false) {
        let nextCells = solveCell(cells, nextOnlyPossible);
        nextCells = this.computeAllowedNumbersForAllCells(nextCells);
        nextCells = this.computeAllowedNumbersFreqForAllCells(nextCells);
        this.setState({ cells: nextCells });
      }
      stepCounter++;
    }
    console.log(isSolved(this.state.cells));
    return isSolved(this.state.cells);
  }

  handleChange(cellNumber, activeState, value) {
    const updateCells = this.state.cells;

    updateCells[cellNumber] = {
      isActive: activeState,
      value,
    };
    this.setState({ cells: updateCells });
    this.computeAllowedNumbersForAllCells(this.state.cells);
    this.computeAllowedNumbersFreqForAllCells(this.state.cells);
  }

  toggleHelp() {
    this.setState({ hasHelp: !this.state.hasHelp });
  }

  renderCell(i) {
    return (
      <Cell
        key={`Cell-${i}`}
        number={i}
        isActive={this.state.cells[i].isActive}
        isInitial={this.state.cells[i].isInitial}
        value={this.state.cells[i].value}
        allowedNumbers={this.state.cells[i].allowedNumbers}
        allowedNumbersFreqEqOne={this.state.cells[i].allowedNumbersFreqEqOne}
        // allowedNumbersFreqEqOne
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
              this.loadRandomSudokuFromData();
            }}
          >
            random
          </button>
          <button
            className="UIButton"
            onClick={(e) => {
              this.resetToInitial();
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
          <button
            className="UIButton"
            onClick={(e) => {
              this.makeInitial();
            }}
          >
            make initial
          </button>
          <button
            className="UIButton"
            onClick={(e) => {
              this.solve(1);
            }}
          >
            solve next
          </button>
          <button
            className="UIButton"
            onClick={(e) => {
              this.solve();
            }}
          >
            solve all
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
      allowedNumbersFreqEqOne: props.allowedNumbersFreqEqOne,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClickOnNumber = this.handleClickOnNumber.bind(this);
  }
  static getDerivedStateFromProps(props, current_state) {
    return {
      isActive: props.isActive,
      value: props.value,
      allowedNumbers: props.allowedNumbers,
      allowedNumbersFreqEqOne: props.allowedNumbersFreqEqOne,
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
    if (this.state.allowedNumbers.size === 0 && !this.state.isActive) {
      return (
        <div className={`Cell`}>
          <Error></Error>
        </div>
      );
    }
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
        this.state.allowedNumbers.has(i + 1) &&
        (this.state.allowedNumbers.size === 1 ||
          this.state.allowedNumbersFreqEqOne.has(i + 1));
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

    return <div className={`Cell GridCell`}>{numbers}</div>;
  }
}

class Error extends React.Component {
  render() {
    return <div className="Error">!</div>;
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
          !this.props.isHidden && !this.props.isProtected ? "visible" : ""
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
