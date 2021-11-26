import React, {useState} from 'react';
import './App.scss';
import LEDGrid from './components/led-grid';

interface ILEDConfiguration {
  dimensions: number
  speed: number
  isInteractive: boolean
  renderPattern: 'random' | 'waterfall' | 'flip'
  isFullScreen: boolean
}

/**
 * @return {JSX.Element} the main contents of the app
 */
function App(): JSX.Element {
  const [areControlsOpen, setAreControlsOpen] = useState<boolean>(false);
  const [fields, setFields] = useState<ILEDConfiguration>({
    dimensions: 7,
    speed: 17,
    isInteractive: false,
    renderPattern: 'random',
    isFullScreen: false,
  });

  const renderPatterns = ['random', 'waterfall', 'flip'];

  const toggleControls = (): void => {
    setAreControlsOpen((prevState: boolean) => !prevState);
  };

  const toggleFullScreen = (fullscreenRequested: boolean): void => {
    if (!document.fullscreenElement && fullscreenRequested) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const updateFields = (event: React.SyntheticEvent) => {
    const target = event.target as (HTMLInputElement);
    let value: any;

    switch (target.name) {
    case 'dimensions':
      value = Math.max(0, Math.min(+target.value, 20));
      break;

    case 'isFullScreen':
      toggleFullScreen(target.checked);
      value = target.checked;
      break;

    case 'isInteractive':
      value = target.checked;
      break;

    default:
      value = target.value;
      break;
    }

    setFields((prevState) => ({
      ...prevState,
      [target.name]: value,
    }));
  };


  return (
    <main className="App">
      <section className="led-board">
        <LEDGrid
          dimensions={fields.dimensions}
          speed={fields.speed}
          isInteractive={fields.isInteractive}
          renderPattern={fields.renderPattern}
        />
      </section>

      <aside className={`led-controls ${areControlsOpen ? 'open' : ''}`}>
        <button
          className="led-controls__toggle"
          onClick={toggleControls}
        >
          <p>
            Settings
          </p>
        </button>

        <label htmlFor="dimensions">
          Dimensions: {fields.dimensions} x {fields.dimensions}
          <input
            type="range"
            id="dimensions"
            name="dimensions"
            min={1}
            max={15}
            value={fields.dimensions}
            onChange={updateFields}
          />
        </label>

        <label htmlFor="speed">
          Speed: {fields.speed}
          <input
            type="range"
            id="speed"
            name="speed"
            min={1}
            max={50}
            value={fields.speed}
            onChange={updateFields}
          />
        </label>

        <label htmlFor="renderPattern">
          Render pattern:
          <select
            name="renderPattern"
            id="renderPattern"
            value={fields.renderPattern}
            onChange={updateFields}
          >
            { renderPatterns.map((pattern) => (
              <option key={pattern} value={pattern}>
                { pattern }
              </option>
            )) }
          </select>
        </label>

        <label htmlFor="isInteractive">
          Interactive (may impact performance):
          <input
            type="checkbox"
            id="isInteractive"
            name="isInteractive"
            checked={fields.isInteractive}
            onChange={updateFields}
          />
        </label>

        <label htmlFor="isFullScreen">
          Fullscreen:
          <input
            type="checkbox"
            id="isFullScreen"
            name="isFullScreen"
            checked={fields.isFullScreen}
            onChange={updateFields}
          />
        </label>

        <div className="source-link-wrapper">
          Source:
          <a
            href="https://github.com/Chunxei/led-board"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chunxei&apos;s github
          </a>
        </div>
      </aside>
    </main>
  );
}

export default App;
