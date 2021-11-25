import React, {useEffect, useState} from 'react';
import './style.scss';
import {ILEDGridProps, LEDMatrixType} from './types';
import rngInRange from '../../utils/rngInRange';


/**
 * The component LED Table component
 *
 * @param {ILEDGridProps} props - the table's props
 * @return {JSX.Element} - the led table DOM tree
 */
function LEDGrid(props: ILEDGridProps): JSX.Element {
  const {
    dimensions = 10,
    speed = 10,
    isInteractive = false,
    renderPattern = 'random',
  } = props;

  const [/* tableMatrix */, setTableMatrix] = useState<LEDMatrixType>([[1, 1]]);
  const [colorRotationInterval, setColorRotationInterval] = useState<any>(null);

  const [
    renderPatternTimeouts,
    setRenderPatternTimeouts,
  ] = useState<any>([] as any[]);

  /* for performance reasons, do not exceed 15 */
  const safeDimensions = Math.max(1, Math.min(dimensions, 15));

  /* for performance reasons, do not exceed 50 */
  const safeSpeed = Math.max(1, Math.min(speed, 50));

  const dimensionRange = Array.from(
    {length: safeDimensions},
    (_, dim) => dim + 1,
  );

  const clearTimers = (): void => {
    clearInterval(colorRotationInterval);

    renderPatternTimeouts.forEach((timeout: any) => {
      clearTimeout(timeout);
    });
  };

  const generateRandomColor = (alpha: number = 1): string => (
    `rgb(${rngInRange(0, 255)},${
      rngInRange(0, 255)},${rngInRange(0, 255)},${alpha})`
  );

  /**
   * takes a matrix and uses RNG to assign color values
   * its cells to elements corresponding to its cells
   *
   * @param {LEDMatrixType} matrix - the matrix to generate color groups from
   */
  const generateColorGroups = (matrix: LEDMatrixType): void => {
    const timeouts = [] as any[];

    switch (renderPattern) {
    case 'waterfall':

      dimensionRange.forEach((rowIndex) => {
        const rowElement = document
          .getElementById(`row-${rowIndex}`);

        if (rowElement) {
          Array.prototype.forEach.call(rowElement.children, (child, index2) => {
            const cellTimeout = setTimeout(() => {
              child.children[0].style.backgroundColor = generateRandomColor();
              /* 51 === speed threshold + 1 */
            }, (rowIndex * 50) - (safeSpeed * 5));

            timeouts.push(cellTimeout);
          });
        }
      });
      break;

    case 'flip':
      matrix.forEach((cell, cellIndex) => {
        const cellElement = document
          .getElementById(`cell-body-${cell[0]}-${cell[1]}`);

        if (cellElement) {
          cellElement.style.backgroundColor = generateRandomColor();
        }
      });
      break;

      //
    case 'random':
    default:
      Array.from({length: safeSpeed * 10})
        .forEach((_, i) => {
          const randomCell = matrix[rngInRange(0, matrix.length - 1)];

          const cellElement = document
            .getElementById(`cell-body-${randomCell[0]}-${randomCell[1]}`);

          if (cellElement) {
            const cellTimeout = setTimeout(() => {
              cellElement.style.backgroundColor = generateRandomColor();
              /* repaint interval duration */
            }, rngInRange(100, 4500));

            timeouts.push(cellTimeout);
          }
        });
      break;
    }

    setRenderPatternTimeouts((prevState: any[]) => ([
      ...prevState,
      ...timeouts,
    ]));
  };


  /**
   * generates a matrix of values to use in rendering the table,
   * and delegates colors to cells
   *
   * @return {void}
   */
  const composeMatrix = (): void => {
    const matrix = dimensionRange
      .reduce((acc: LEDMatrixType, rowIndex) => ([
        ...acc,
        ...dimensionRange
          .map((columnIndex): number[] => ([rowIndex, columnIndex])),
      ]), [] as LEDMatrixType);

    setTableMatrix(matrix);

    clearTimers();

    generateColorGroups(matrix);

    setColorRotationInterval(setInterval(() => {
      generateColorGroups(matrix);
      /* repaint interval duration tied to safeSpeed */
    }, 5500 - (safeSpeed * 100)));
  };


  /**
   * returns the dimensions of a cell in the grid
   * @param {React.MouseEvent} event - the event fired on the cell DOM node
   * @param {number} rowIndex - the index of the cell's row
   * @param {number} columnIndex - the index of the cell's column
   * @param {string} action - the type of hover interaction the mouse
   * made with the cell
   */
  const handleMouseOverCell = (
    event: React.MouseEvent<HTMLDivElement>,
    rowIndex: number,
    columnIndex: number,
    action: 'enter' | 'leave',
  ) => {
    if (!isInteractive) return;

    /* using getElementById cos event.target randomly
    * skips some nodes
    */
    const cell = document
      .getElementById(`cell-${rowIndex}-${columnIndex}`);

    switch (action) {
    case 'enter':
      if (cell) {
        if (!cell.classList.contains('hovered')) {
          cell.classList.add('hovered');
        }
      }
      break;

    case 'leave':
      if (cell) {
        if (cell.classList.contains('hovered')) {
          setTimeout(() => {
            cell.classList.remove('hovered');
          }, 200);
        }
      }
      break;

    default:
      break;
    }
  };

  useEffect(() => {
    /* generate a new matrix when the dimensions are changed*/
    composeMatrix();
    return () => {
      /* free memory */
      clearTimers();
    };
  }, [dimensions, speed, isInteractive, renderPattern]);

  return (
    <section className="led-grid">
      <div className="led-grid__wrapper">
        {dimensionRange.map((rowIndex) => {
          /* TODO: MAY USE LATER */
          // const currentRow = tableMatrix
          //   .filter((cell: number[]) => cell[0] === rowIndex);

          return (
            <div
              key={rowIndex}
              id={`row-${rowIndex}`}
              className="led-grid__row"
              style={{height: `${100 / safeDimensions}%`}}
            >
              {dimensionRange.map((columnIndex) => {
                /* TODO: MAY USE LATER */
                // const currentColumn = tableMatrix
                //   .filter((cell: number[]) => cell[1] === columnIndex);

                /* TODO: MAY USE LATER */
                // const currentCell = tableMatrix
                //   .find((cell: number[]) => (
                //     cell[0] === rowIndex && cell[1] === columnIndex
                //   ));

                return (
                  <div
                    key={`cell-${rowIndex}-${columnIndex}`}
                    id={`cell-${rowIndex}-${columnIndex}`}
                    className="led-grid__cell"
                    style={{width: `${100 / safeDimensions}%`}}
                    onMouseEnter={(e) => {
                      handleMouseOverCell(e, rowIndex, columnIndex, 'enter');
                    }}
                    onMouseLeave={(e) => {
                      handleMouseOverCell(e, rowIndex, columnIndex, 'leave');
                    }}
                  >
                    <div
                      id={`cell-body-${rowIndex}-${columnIndex}`}
                      className="led-grid__cell__body"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LEDGrid;
