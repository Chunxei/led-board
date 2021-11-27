/* eslint-disable no-unused-vars */
import React, {useEffect, useState} from 'react';
import './style.scss';
import {ILEDGridProps, LEDMatrixType} from './types';
import {RENDER_PALETTE, RENDER_PATTERNS} from '../../utils/constants';
import HELPERS from '../../utils/helpers';


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
    renderPattern = RENDER_PATTERNS.random,
    renderPalette = RENDER_PALETTE.random,
    padding = 1,
  } = props;

  console.log('palette:', renderPalette);

  const [/* tableMatrix */, setTableMatrix] = useState<LEDMatrixType>([[1, 1]]);
  const [
    colorRotationInterval,
    setColorRotationInterval,
  ] = useState<number>();

  const [
    renderPatternTimeouts,
    setRenderPatternTimeouts,
  ] = useState<number[]>([]);

  /* for performance reasons, do not exceed 15 */
  const safeDimensions = Math.max(1, Math.min(dimensions, 15));

  /* for performance reasons, do not exceed 50 */
  const safeSpeed = Math.max(1, Math.min(speed, 50));

  const safePadding = Math.max(0, Math.min(padding, 5));

  const dimensionRange = Array.from(
    {length: safeDimensions},
    (_, dim) => dim + 1,
  );

  const clearTimers = (): void => {
    window.clearInterval(colorRotationInterval);

    renderPatternTimeouts.forEach((timeout: any) => {
      window.clearTimeout(timeout);
    });

    setRenderPatternTimeouts([] as number[]);
  };

  /**
   * takes a matrix and uses RNG to assign color values
   * its cells to elements corresponding to its cells
   *
   * @param {LEDMatrixType} matrix - the matrix to generate color groups from
   */
  const generateColorGroups = (matrix: LEDMatrixType): void => {
    const timeouts = [] as any[];

    switch (renderPattern) {
    case RENDER_PATTERNS.waterfall:
    case RENDER_PATTERNS.curtain:
    case RENDER_PATTERNS.flip:
      dimensionRange.forEach((rowIndex) => {
        const rowElement = document
          .getElementById(`row-${rowIndex}`);

        let cellColor = HELPERS.generateColor();

        const colorOptions = {
          [['r', 'g', 'b'][HELPERS.rng(0, 2)]]: HELPERS.rng(0, 255),
        };

        if (rowElement) {
          Array.prototype.forEach.call(
            rowElement.children,
            (child, childIndex) => {
              let currentCell = child.children[0];

              const addedTime = renderPattern === 'curtain' ?
                (childIndex * 100) : 0;

              switch (renderPalette) {
              case RENDER_PALETTE.random:
                cellColor = HELPERS.generateColor();
                break;

              case RENDER_PALETTE.gradient:
                const colorGraduation = Math.min(255, HELPERS.rng(
                  ((childIndex + 1) * 17),
                  ((childIndex + 2) * 17),
                ));

                cellColor = HELPERS.generateColor({
                  r: colorGraduation,
                  g: colorGraduation,
                  b: colorGraduation,
                  ...colorOptions,
                });
                break;

              case RENDER_PALETTE.column:
                currentCell = document
                  .getElementById(`cell-body-${childIndex + 1}-${rowIndex}`);
                break;

              case RENDER_PALETTE.row:
              default:
                break;
              }

              const time = renderPattern === RENDER_PATTERNS.flip ?
                0 : (rowIndex * 50) + addedTime - (safeSpeed * 5);

              const cellTimeout = window
                .setTimeout((element: HTMLElement, color: string) => {
                  element.style.backgroundColor = color;
                },
                /* to stagger each row's repaint, and sync it with safeSpeed */
                time,
                currentCell,
                cellColor);

              timeouts.push(cellTimeout);
            });
        }
      });
      break;

    case RENDER_PATTERNS.random:
    default:
      const rowColors = [] as any[];

      Array.from({length: safeSpeed * 10})
        .forEach((_, i) => {
          let cellColor = HELPERS.generateColor();

          const randomCell = matrix[HELPERS.rng(0, matrix.length - 1)];

          let cellElement = document
            .getElementById(`cell-body-${randomCell[0]}-${randomCell[1]}`);

          switch (renderPalette) {
          case RENDER_PALETTE.row:
          case RENDER_PALETTE.column:
            if (
              !rowColors[randomCell[0]] ||
              typeof rowColors[randomCell[0]] !== 'string'
            ) {
              rowColors[randomCell[0]] = HELPERS.generateColor();
            }

            cellColor = rowColors[randomCell[0]] as string;

            if (renderPalette === RENDER_PALETTE.column) {
              cellElement = document
                .getElementById(`cell-body-${randomCell[1]}-${randomCell[0]}`);
            }
            break;

          case RENDER_PALETTE.random:
          default:
            break;
          }

          if (cellElement) {
            const cellTimeout = window.setTimeout(
              (element: HTMLElement) => {
                element.style.backgroundColor = cellColor;
              },
              /* no reason, just vibes */
              HELPERS.rng(100, 4500),
              cellElement);

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

    setColorRotationInterval(window.setInterval(() => {
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
  }, [dimensions, speed, isInteractive, renderPattern, renderPalette, padding]);

  useEffect(() => {
    const allTimersTimer = window.setInterval(
      (clearTimersFn: () => void) => {
        clearTimersFn();
      },
      (5500 - (safeSpeed * 100)) * 2,
      // 7000,
      clearTimers);

    return () => {
      window.clearInterval(allTimersTimer);
    };
  }, []);

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
                    style={{
                      width: `${100 / safeDimensions}%`,
                      padding: `${safePadding}px`,
                    }}
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
                      style={{borderRadius: safePadding > 0 ? '2px' : '0'}}
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
