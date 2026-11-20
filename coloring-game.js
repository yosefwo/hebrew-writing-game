const openColoring = (() => {
  const topicTitles = [
    'רֹאשׁ הַשָּׁנָה', 'סֻכּוֹת', 'שִׂמְחַת תּוֹרָה', 'חֲנֻכָּה',
    'ט״ו בִּשְׁבָט', 'פּוּרִים', 'פֶּסַח', 'לַ״ג בָּעֹמֶר',
    'שָׁבוּעוֹת', 'יוֹם הָעַצְמָאוּת', 'יוֹם יְרוּשָׁלַיִם', 'י״ז בְּתַמּוּז',
    'תִּשְׁעָה בְּאָב', 'נְטִילַת יָדַיִם', 'קְרִיאַת שְׁמַע עַל הַמִּטָּה',
    'נוֹתְנִים וּמְשַׁתְּפִים', 'שַׁבָּת', 'מְסַדְּרִים צַעֲצוּעִים'
  ];
  const colors = [
    ['#d62c34', 'אָדֹם'], ['#f38c28', 'כָּתֹם'], ['#f5cd20', 'צָהֹב'],
    ['#3a9a54', 'יָרֹק'], ['#57c8ee', 'תְּכֵלֶת'], ['#2464cb', 'כָּחֹל'],
    ['#6346a8', 'אִינְדִּיגוֹ'], ['#934aba', 'סָגֹל'], ['#ec7cae', 'וָרֹד'],
    ['#8c5438', 'חוּם'], ['#808890', 'אָפֹר'], ['#242833', 'שָׁחֹר'], ['#ffffff', 'לָבָן']
  ];
  const fileName = path => path.split('?')[0].split('/').pop();
  const pages = [
    ...puzzlePictureGroups.map((group, index) => ({ title: topicTitles[index], images: group.images })),
    { title: 'כִּתָּה א׳', images: [puzzleThemes.grade1.image] },
    { title: 'גַּן יְלָדִים', images: [puzzleThemes.kindergarten.image] }
  ];
  const page = byId('coloring-page');
  const editor = byId('coloring-editor');
  const status = byId('coloring-status');
  const niqqud = byId('coloring-niqqud');
  const pen = byId('coloring-pen');
  const bucket = byId('coloring-bucket');
  const palette = byId('coloring-palette');
  const custom = byId('coloring-custom');
  const width = byId('coloring-width');
  const undo = byId('coloring-undo');
  const clear = byId('coloring-clear');
  const canvas = byId('coloring-paint');
  const outline = byId('coloring-outline');
  const paint = canvas.getContext('2d', { willReadFrequently: true });
  const ink = outline.getContext('2d', { willReadFrequently: true });
  const history = [];
  const drawings = new Map();
  let color = colors[0][0];
  let tool = 'pen';
  let previousScreen = 'grade1';
  let activePage;
  let request = 0;
  let boundary;
  let stroke;
  let dirty = false;

  function textWithNiqqud(value) {
    return niqqud.checked ? value : value.replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
  }

  function renderLabels() {
    byId('coloring').querySelectorAll('[data-coloring-label]').forEach(element => {
      element.dataset.coloringLabel ||= element.textContent;
      element.textContent = textWithNiqqud(element.dataset.coloringLabel);
    });
    status.textContent = textWithNiqqud(status.dataset.message || '');
  }

  function showStatus(message) {
    status.dataset.message = message;
    status.textContent = textWithNiqqud(message);
  }

  for (const { title, images } of pages) {
    images.forEach((image, index) => {
      const option = document.createElement('option');
      option.value = fileName(image);
      option.dataset.coloringLabel = images.length > 1 ? `${title} · ${index + 1}` : title;
      page.append(option);
    });
  }

  for (const [value, name] of colors) {
    const button = document.createElement('button');
    button.type = 'button';
    button.value = value;
    const swatch = document.createElement('span');
    swatch.className = 'coloring-swatch';
    swatch.style.setProperty('--swatch', value);
    const label = document.createElement('span');
    label.dataset.coloringLabel = name;
    button.append(swatch, label);
    button.addEventListener('click', () => chooseColor(value));
    palette.append(button);
  }

  function chooseColor(value) {
    color = value;
    custom.value = value;
    for (const button of palette.children) {
      button.setAttribute('aria-pressed', String(button.value === value));
    }
  }

  function chooseTool(value) {
    tool = value;
    const usingPen = value === 'pen';
    pen.setAttribute('aria-pressed', String(usingPen));
    bucket.setAttribute('aria-pressed', String(!usingPen));
    width.disabled = !usingPen;
  }

  function updateActions() {
    undo.disabled = history.length === 0;
    clear.disabled = !dirty;
  }

  function snapshot(data = paint.getImageData(0, 0, canvas.width, canvas.height)) {
    history.push({ data, dirty });
    if (history.length > 10) history.shift();
    dirty = true;
    updateActions();
  }

  function loadPage(file) {
    const currentRequest = ++request;
    if (file === activePage) {
      editor.classList.remove('hidden');
      showStatus('');
      return;
    }
    if (dirty) drawings.set(activePage, paint.getImageData(0, 0, canvas.width, canvas.height));
    else drawings.delete(activePage);

    editor.classList.add('hidden');
    showStatus('טוֹעֲנִים אֶת הַצִּיּוּר…');
    const image = new Image();
    image.onload = () => {
      if (currentRequest !== request) return;

      canvas.width = outline.width = image.naturalWidth;
      canvas.height = outline.height = image.naturalHeight;
      ink.drawImage(image, 0, 0);
      const lineArt = ink.getImageData(0, 0, outline.width, outline.height);
      boundary = new Uint8Array(outline.width * outline.height);
      for (let pixel = 0; pixel < boundary.length; pixel++) {
        const offset = pixel * 4;
        const data = lineArt.data;
        const darkness = 255 - Math.min(data[offset], data[offset + 1], data[offset + 2]);
        boundary[pixel] = darkness > 90;
        data[offset] = data[offset + 1] = data[offset + 2] = 0;
        data[offset + 3] = darkness < 24 ? 0 : darkness;
      }
      ink.putImageData(lineArt, 0, 0);

      const saved = drawings.get(file);
      if (saved) paint.putImageData(saved, 0, 0);
      activePage = file;
      dirty = Boolean(saved);
      stroke = undefined;
      history.length = 0;
      updateActions();
      editor.classList.remove('hidden');
      showStatus('');
    };
    image.onerror = () => {
      if (currentRequest === request) showStatus('הַצִּיּוּר לֹא נִטְעַן. בַּחֲרוּ צִיּוּר אַחֵר.');
    };
    image.src = `assets/coloring/${file}`;
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width - 1, Math.floor((event.clientX - rect.left) * canvas.width / rect.width))),
      y: Math.max(0, Math.min(canvas.height - 1, Math.floor((event.clientY - rect.top) * canvas.height / rect.height)))
    };
  }

  function draw(from, to) {
    const size = Number(width.value);
    paint.fillStyle = paint.strokeStyle = color;
    paint.lineWidth = size;
    paint.lineCap = 'round';
    paint.beginPath();
    if (from.x === to.x && from.y === to.y) {
      paint.arc(to.x, to.y, size / 2, 0, 2 * Math.PI);
      paint.fill();
    } else {
      paint.moveTo(from.x, from.y);
      paint.lineTo(to.x, to.y);
      paint.stroke();
    }
  }

  function fill({ x, y }) {
    const { width: w, height: h } = canvas;
    const start = y * w + x;
    if (boundary[start]) return;

    const image = paint.getImageData(0, 0, w, h);
    const data = image.data;
    const target = data.slice(start * 4, start * 4 + 4);
    const number = Number.parseInt(color.slice(1), 16);
    const chosen = [number >> 16, (number >> 8) & 255, number & 255, 255];
    if (target.every((channel, index) => channel === chosen[index])) return;
    snapshot(paint.getImageData(0, 0, w, h));

    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let count = 0;
    function add(pixel) {
      if (visited[pixel] || boundary[pixel]) return;
      visited[pixel] = 1;
      const offset = pixel * 4;
      if (target.some((channel, index) => Math.abs(channel - data[offset + index]) > 18)) return;
      queue[count++] = pixel;
      data.set(chosen, offset);
    }

    add(start);
    for (let cursor = 0; cursor < count; cursor++) {
      const pixel = queue[cursor];
      const column = pixel % w;
      if (column > 0) add(pixel - 1);
      if (column + 1 < w) add(pixel + 1);
      if (pixel >= w) add(pixel - w);
      if (pixel < w * (h - 1)) add(pixel + w);
    }
    paint.putImageData(image, 0, 0);
  }

  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || stroke) return;
    const position = point(event);
    if (tool === 'bucket') {
      fill(position);
      return;
    }
    canvas.setPointerCapture(event.pointerId);
    snapshot();
    stroke = { id: event.pointerId, position };
    draw(position, position);
  });

  canvas.addEventListener('pointermove', event => {
    if (stroke?.id !== event.pointerId) return;
    const position = point(event);
    draw(stroke.position, position);
    stroke.position = position;
  });

  canvas.addEventListener('lostpointercapture', event => {
    if (stroke?.id === event.pointerId) stroke = undefined;
  });

  undo.onclick = () => {
    const entry = history.pop();
    if (!entry) return;
    paint.putImageData(entry.data, 0, 0);
    dirty = entry.dirty;
    updateActions();
  };
  clear.onclick = () => {
    snapshot();
    paint.clearRect(0, 0, canvas.width, canvas.height);
    dirty = false;
    updateActions();
  };
  pen.onclick = () => chooseTool('pen');
  bucket.onclick = () => chooseTool('bucket');
  custom.oninput = () => chooseColor(custom.value);
  page.onchange = () => loadPage(page.value);
  niqqud.onchange = renderLabels;
  byId('coloring-back').onclick = () => show(previousScreen);

  chooseColor(color);
  renderLabels();

  return (back, image) => {
    previousScreen = back;
    show('coloring');
    if (image) page.value = fileName(image);
    loadPage(page.value);
  };
})();
