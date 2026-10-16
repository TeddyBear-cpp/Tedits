// Local-only enquiry demonstration. No network requests, storage, or uploads.
const enquiryForm = document.getElementById('enquiry-form');
const material = document.getElementById('sample-material');
const description = document.getElementById('project-description');
const customFields = document.getElementById('custom-project-fields');
const summary = document.getElementById('enquiry-summary');
const panelTitle = document.getElementById('panel-title');
const dimensions = document.getElementById('sample-dimensions');
const quantity = document.getElementById('sample-quantity');
const dimensionsUnknown = document.getElementById('dimensions-unknown');
const quantityUnknown = document.getElementById('quantity-unknown');
const drawingInput = document.getElementById('project-drawings');
const drawingList = document.getElementById('drawing-list');
const drawingFeedback = document.getElementById('drawing-feedback');
const drawingDropzone = document.getElementById('drawing-dropzone');
const drawings = [];
let drawingId = 0;
const drawingTypes = {pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
const drawingSize = file => file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

function renderDrawings() {
  drawingList.replaceChildren();
  drawings.forEach(drawing => {
    const item = document.createElement('li');
    if (drawing.url) {
      const image = document.createElement('img');
      image.src = drawing.url;
      image.alt = `Local preview of ${drawing.file.name}`;
      image.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = 'drawing-type';
        fallback.textContent = 'IMAGE';
        image.replaceWith(fallback);
      }, {once:true});
      item.append(image);
    } else {
      const type = document.createElement('span');
      type.className = 'drawing-type';
      type.textContent = 'PDF';
      item.append(type);
    }
    const info = document.createElement('span');
    info.className = 'drawing-info';
    const name = document.createElement('b');
    name.textContent = drawing.file.name;
    const size = document.createElement('small');
    size.textContent = `${drawingSize(drawing.file)} · Local preview`;
    info.append(name,size);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-drawing';
    remove.textContent = '×';
    remove.setAttribute('aria-label',`Remove ${drawing.file.name}`);
    remove.addEventListener('click', () => {
      const index = drawings.findIndex(item => item.id === drawing.id);
      if (index === -1) return;
      if (drawing.url) URL.revokeObjectURL(drawing.url);
      drawings.splice(index,1);
      renderDrawings();
      drawingFeedback.textContent = `${drawing.file.name} removed. ${drawings.length} of 3 files selected.`;
      drawingInput.focus({preventScroll:true});
    });
    item.append(info,remove);
    drawingList.append(item);
  });
}

function addDrawings(files) {
  const messages = [];
  Array.from(files).forEach(file => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!drawingTypes[extension] || (file.type && file.type !== drawingTypes[extension])) {
      messages.push(`${file.name}: choose a PDF, JPG, PNG, or WEBP file.`); return;
    }
    if (!file.size) { messages.push(`${file.name}: this file is empty.`); return; }
    if (file.size > 10 * 1024 * 1024) { messages.push(`${file.name}: the limit is 10 MB per file.`); return; }
    if (drawings.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) {
      messages.push(`${file.name} is already selected.`); return;
    }
    if (drawings.length >= 3) { messages.push('You can select up to 3 drawings. Remove a file to add another.'); return; }
    drawings.push({id:++drawingId,file,url:extension === 'pdf' ? null : URL.createObjectURL(file)});
  });
  renderDrawings();
  drawingFeedback.textContent = [...new Set(messages),`${drawings.length} of 3 files selected. Nothing has been uploaded.`].join(' ');
}
drawingInput.addEventListener('change', () => {addDrawings(drawingInput.files);drawingInput.value='';});
['dragenter','dragover'].forEach(event => drawingDropzone.addEventListener(event,e=>{e.preventDefault();drawingDropzone.classList.add('drag-active');}));
['dragleave','drop'].forEach(event => drawingDropzone.addEventListener(event,e=>{e.preventDefault();drawingDropzone.classList.remove('drag-active');}));
drawingDropzone.addEventListener('drop',event=>{if(event.dataTransfer?.files)addDrawings(event.dataTransfer.files);});
window.addEventListener('pagehide',event=>{if(!event.persisted)drawings.forEach(drawing=>{if(drawing.url)URL.revokeObjectURL(drawing.url);});});

function showForm() {
  summary.hidden = true;
  enquiryForm.hidden = false;
}

function updateMaterial() {
  const customMode = material.value === 'custom' || material.value === 'unsure';
  customFields.hidden = !customMode;
  description.disabled = !customMode;
  description.required = customMode;
  description.setCustomValidity('');
  panelTitle.textContent = customMode ? 'TELL US ABOUT YOUR PROJECT' : 'PLAN YOUR ENQUIRY';
}

function updateUnknown(input, checkbox) {
  // Keep any earlier value in memory so unchecking restores the typed detail.
  input.disabled = checkbox.checked;
  input.setAttribute('aria-disabled', String(checkbox.checked));
}

material.addEventListener('change', updateMaterial);
description.addEventListener('input', () => {
  description.setCustomValidity(description.required && !description.value.trim() ? 'Please add a short description of your project.' : '');
});
dimensionsUnknown.addEventListener('change', () => updateUnknown(dimensions, dimensionsUnknown));
quantityUnknown.addEventListener('change', () => updateUnknown(quantity, quantityUnknown));

document.querySelectorAll('a[data-material]').forEach(link => {
  link.addEventListener('click', () => {
    showForm();
    material.value = link.dataset.material;
    updateMaterial();
    // The normal #quote anchor handles scrolling; focus moves without extra scroll.
    requestAnimationFrame(() => {
      (description.required ? description : material).focus({preventScroll:true});
    });
  });
});

enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  if (description.required && !description.value.trim()) {
    description.setCustomValidity('Please add a short description of your project.');
    description.reportValidity();
    return;
  }
  if (!enquiryForm.reportValidity()) return;
  document.getElementById('summary-material').textContent = material.selectedOptions[0].textContent;
  document.getElementById('summary-description-row').hidden = !description.required;
  document.getElementById('summary-description').textContent = description.required ? description.value.trim() : '';
  document.getElementById('summary-dimensions').textContent = dimensionsUnknown.checked ? 'Not sure yet' : dimensions.value.trim() || 'Not specified';
  document.getElementById('summary-quantity').textContent = quantityUnknown.checked ? 'Not sure yet' : quantity.value.trim() || 'Not specified';
  document.getElementById('summary-drawings-row').hidden = drawings.length === 0;
  const drawingSummary = document.getElementById('summary-drawings');
  drawingSummary.replaceChildren();
  drawings.forEach(drawing => {
    const item = document.createElement('li');
    item.textContent = `${drawing.file.name} (${drawingSize(drawing.file)})`;
    drawingSummary.append(item);
  });
  enquiryForm.hidden = true;
  summary.hidden = false;
  panelTitle.textContent = 'YOUR ENQUIRY PREVIEW';
  document.getElementById('summary-title').focus();
});

document.getElementById('edit-enquiry').addEventListener('click', () => {
  showForm();
  updateMaterial();
  material.focus();
});
updateMaterial();
document.getElementById('enquiry-fields').disabled = false;
