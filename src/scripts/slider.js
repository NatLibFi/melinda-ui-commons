//****************************************************************************//
//                                                                            //
// Sliders (styles/slider.css)                                                //
//                                                                            //
//****************************************************************************//
//
// Keeps each .slider-track in sync with its range inputs:
//    - sets --slider-start and --slider-end (0 ... 1) for the fill and values
//    - writes the current value to the <output for="..."> of each input
//    - sets aria-valuetext, so screen readers read the value with its unit
//    - stops the thumbs of a range slider (.slider-range) from crossing
//    - draws the bars of a histogram (.slider-histogram-bars with
//      data-slider-histogram="2,5,9,..."), highlights the bars in the selected
//      range and writes the sum of their counts to .slider-histogram-total
//
// Value texts come from data attributes on the input:
//    data-slider-unit="%"          43%   (put a space in the unit for "150 €")
//    data-slider-texts="a|b|c"     texts of the labelled scale points, spread
//                                  evenly from min to max. With more steps
//                                  than texts (e.g. min="0" max="10") the
//                                  values between the points are read as
//    data-slider-between-text      "{value}, between {below} and {above}"
//                                  (default, set it to translate)
// An <output> always shows the number and unit.
//
// Call initializeSliders() once after the page has loaded, and again with the
// new element as root after adding sliders to the page.

let sliderInputListenerAdded = false;


export function initializeSliders(root = document) {
  root.querySelectorAll('.slider-track').forEach(track => updateSlider(track));

  if (!sliderInputListenerAdded) {
    document.addEventListener('input', handleSliderInput);
    sliderInputListenerAdded = true;
  }
}


export function updateSlider(track, changedInput = null) {
  const inputs = Array.from(track.querySelectorAll('input[type="range"]'));

  if (inputs.length === 0) {
    return;
  }

  const [lower, upper] = inputs;

  if (upper) {
    keepThumbsApart(lower, upper, changedInput);
  }

  inputs.forEach(updateValueText);

  const start = upper ? getPosition(lower) : 0;
  const end = getPosition(upper ?? lower);

  track.style.setProperty('--slider-start', start);
  track.style.setProperty('--slider-end', end);

  if (upper) {
    lower.classList.toggle('slider-input-raised', start > 0.5);
  }

  updateHistogram(track.closest('.slider'), lower, upper);
}


//****************************************************************************//


function handleSliderInput(event) {
  const input = event.target;

  if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
    return;
  }

  const track = input.closest('.slider-track');

  if (track) {
    updateSlider(track, input);
  }
}

function keepThumbsApart(lower, upper, changedInput) {
  const lowerValue = Number(lower.value);
  const upperValue = Number(upper.value);

  if (lowerValue <= upperValue) {
    return;
  }

  if (changedInput === upper) {
    upper.value = lowerValue;
    return;
  }

  lower.value = upperValue;
}

function getPosition(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);

  if (max <= min) {
    return 0;
  }

  return (Number(input.value) - min) / (max - min);
}

function updateValueText(input) {
  input.setAttribute('aria-valuetext', getValueText(input));

  if (input.id) {
    const output = input.closest('.slider-track')?.querySelector(`output[for="${CSS.escape(input.id)}"]`);

    if (output) {
      output.textContent = getNumberText(input);
    }
  }
}

function getNumberText(input) {
  return `${input.value}${input.dataset.sliderUnit ?? ''}`;
}

// Scale texts are spread evenly from min to max, whatever the step:
// 5 texts on 0-10 are at 0, 2.5, 5, 7.5 and 10. On a text point the text is
// read, between two points the number and the texts on both sides.
function getValueText(input) {
  const texts = input.dataset.sliderTexts?.split('|');

  if (!texts || texts.length < 2) {
    return texts?.[0] ?? getNumberText(input);
  }

  const point = getPosition(input) * (texts.length - 1);
  const nearest = Math.round(point);

  if (Math.abs(point - nearest) < 1e-6) {
    return texts[nearest];
  }

  const template = input.dataset.sliderBetweenText ?? '{value}, between {below} and {above}';

  return template
    .replace('{value}', getNumberText(input))
    .replace('{below}', texts[Math.floor(point)])
    .replace('{above}', texts[Math.ceil(point)]);
}

function updateHistogram(slider, lower, upper) {
  const bars = slider?.querySelector('.slider-histogram-bars[data-slider-histogram]');

  if (!bars) {
    return;
  }

  const counts = bars.dataset.sliderHistogram.split(',').map(Number);

  if (bars.children.length !== counts.length) {
    drawHistogramBars(bars, counts);
  }

  // A bin is selected when its centre is inside the selected range.
  // A single value slider selects from the minimum to the value.
  const min = Number(lower.min || 0);
  const max = Number(lower.max || 100);
  const from = upper ? Number(lower.value) : min;
  const to = Number((upper ?? lower).value);
  const binWidth = (max - min) / counts.length;

  const total = counts.reduce((sum, count, index) => {
    const centre = min + (index + 0.5) * binWidth;
    const selected = centre >= from && centre <= to;

    bars.children[index].classList.toggle('slider-histogram-bar-selected', selected);

    return selected ? sum + count : sum;
  }, 0);

  slider.querySelectorAll('.slider-histogram-total').forEach(element => {
    element.textContent = total;
  });
}

function drawHistogramBars(bars, counts) {
  const highest = Math.max(...counts, 1);

  bars.replaceChildren(...counts.map(count => {
    const bar = document.createElement('span');
    bar.style.setProperty('--slider-bar-height', count / highest);
    return bar;
  }));
}
