// Invoice Manager Application
// Main application logic for creating, editing, and managing invoices

// ===== State Management =====
let invoices = [];
let currentInvoiceId = null;
let editMode = false;

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    renderInvoiceList();
    setupEventListeners();
    addLineItem(); // Add first line item by default

    // Set today's date as default
    document.getElementById('invoiceDate').valueAsDate = new Date();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterInvoices(e.target.value);
    });

    // Form input listeners for live preview
    const form = document.getElementById('invoiceForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });

    // GST Toggle Listener
    const enableGST = document.getElementById('enableGST');
    if (enableGST) {
        enableGST.addEventListener('change', (e) => {
            toggleGSTFields(e.target.checked);
        });
    }

    // New Invoice Button Listener
    document.getElementById('newInvoiceBtn').addEventListener('click', () => {
        showEditor();
    });
}

function toggleGSTFields(enabled) {
    const form = document.getElementById('invoiceForm');
    if (enabled) {
        form.classList.remove('gst-disabled');
    } else {
        form.classList.add('gst-disabled');
    }
    updateLivePreview();
}

// ===== View Navigation =====
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showList() {
    showView('listView');
    renderInvoiceList();
}

function showEditor(invoiceId = null) {
    showView('editorView');
    editMode = !!invoiceId;
    currentInvoiceId = invoiceId;

    if (invoiceId) {
        document.getElementById('editorTitle').textContent = 'Edit Invoice';
        loadInvoiceToForm(invoiceId);
    } else {
        document.getElementById('editorTitle').textContent = 'Create Invoice';
        resetForm();
        // Generate next invoice number
        const nextNumber = generateInvoiceNumber();
        document.getElementById('invoiceNumber').value = nextNumber;

        // Reset GST toggle
        const gstToggle = document.getElementById('enableGST');
        if (gstToggle) {
            gstToggle.checked = false;
            toggleGSTFields(false);
        }
    }

    updateLivePreview();
}

function showPreview(invoiceId) {
    showView('previewView');
    currentInvoiceId = invoiceId;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        document.getElementById('invoicePreview').innerHTML = generateInvoiceHTML(invoice);
    }
}

// ===== Invoice CRUD Operations =====
function saveInvoice() {
    const formData = getFormData();

    // Validate
    if (!formData.invoiceNumber || !formData.invoiceDate || !formData.buyer.name || !formData.seller.name) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    if (formData.items.length === 0) {
        alert('Please add at least one item');
        return;
    }

    if (editMode && currentInvoiceId) {
        // Update existing invoice
        const index = invoices.findIndex(inv => inv.id === currentInvoiceId);
        if (index !== -1) {
            invoices[index] = { ...formData, id: currentInvoiceId };
        }
    } else {
        // Create new invoice
        const newInvoice = {
            ...formData,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        invoices.push(newInvoice);
    }

    saveToLocalStorage();
    showList();
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        invoices = invoices.filter(inv => inv.id !== invoiceId);
        saveToLocalStorage();
        renderInvoiceList();
    }
}

function editCurrentInvoice() {
    if (currentInvoiceId) {
        showEditor(currentInvoiceId);
    }
}

// ===== Form Operations =====
function getFormData() {
    // Get all line items
    const items = [];
    document.querySelectorAll('.line-item').forEach((item) => {
        const description = item.querySelector('[data-field="description"]').value;
        const sac = item.querySelector('[data-field="sac"]').value;
        const taxableValue = item.querySelector('[data-field="taxableValue"]').value;
        const cgstRate = item.querySelector('[data-field="cgstRate"]').value;
        const sgstRate = item.querySelector('[data-field="sgstRate"]').value;
        const igstRate = item.querySelector('[data-field="igstRate"]').value;

        if (description || taxableValue) {
            items.push({
                description,
                sac,
                taxableValue,
                cgstRate,
                sgstRate,
                igstRate
            });
        }
    });

    // Update color text input from picker if it exists
    const brandColorInput = document.getElementById('brandColor');
    if (brandColorInput) {
        brandColorInput.addEventListener('input', (e) => {
            const colorTextInfo = document.getElementById('brandColorText');
            if (colorTextInfo) colorTextInfo.value = e.target.value;
        });
    }

    return {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        reverseCharge: document.getElementById('reverseCharge').value,
        placeOfSupply: document.getElementById('placeOfSupply').value,
        enableGST: document.getElementById('enableGST') ? document.getElementById('enableGST').checked : true,
        branding: {
            full: document.getElementById('brandFull') ? document.getElementById('brandFull').value : 'ProHostix',
            subtitle: document.getElementById('brandSubtitle') ? document.getElementById('brandSubtitle').value : 'Leading Hosting Solutions',
            color: document.getElementById('brandColor') ? document.getElementById('brandColor').value : '#009966',
            split: document.getElementById('splitIndex') ? document.getElementById('splitIndex').value : '3'
        },
        seller: {
            name: document.getElementById('sellerName').value,
            address: document.getElementById('sellerAddress').value,
            gstin: document.getElementById('sellerGSTIN').value,
            state: document.getElementById('sellerState').value,
            stateCode: document.getElementById('sellerStateCode').value
        },
        buyer: {
            name: document.getElementById('buyerName').value,
            address: document.getElementById('buyerAddress').value,
            gstin: document.getElementById('buyerGSTIN').value,
            state: document.getElementById('buyerState').value,
            stateCode: document.getElementById('buyerStateCode').value
        },
        items,
        bank: {
            name: document.getElementById('bankName').value,
            accountNumber: document.getElementById('accountNumber').value,
            ifscCode: document.getElementById('ifscCode').value,
            panNumber: document.getElementById('panNumber').value
        },
        terms: document.getElementById('terms').value,
        notes: document.getElementById('notes').value
    };
}

function loadInvoiceToForm(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Basic details
    document.getElementById('invoiceNumber').value = invoice.invoiceNumber || '';
    document.getElementById('invoiceDate').value = invoice.invoiceDate || '';
    document.getElementById('reverseCharge').value = invoice.reverseCharge || 'No';
    document.getElementById('placeOfSupply').value = invoice.placeOfSupply || '';

    // Enable GST Toggle
    const enableGST = invoice.enableGST !== false; // Default to true if undefined
    const toggle = document.getElementById('enableGST');
    if (toggle) {
        toggle.checked = enableGST;
        toggleGSTFields(enableGST);
    }

    // Branding
    if (document.getElementById('brandFull')) {
        document.getElementById('brandFull').value = invoice.branding?.full || 'ProHostix';
        document.getElementById('brandSubtitle').value = invoice.branding?.subtitle || 'Leading Hosting Solutions';
        document.getElementById('brandColor').value = invoice.branding?.color || '#009966';
        if (document.getElementById('brandColorText')) {
            document.getElementById('brandColorText').value = invoice.branding?.color || '#009966';
        }
        document.getElementById('splitIndex').value = invoice.branding?.split || '3';
    }

    // Seller
    document.getElementById('sellerName').value = invoice.seller?.name || '';
    document.getElementById('sellerAddress').value = invoice.seller?.address || '';
    document.getElementById('sellerGSTIN').value = invoice.seller?.gstin || '';
    document.getElementById('sellerState').value = invoice.seller?.state || '';
    document.getElementById('sellerStateCode').value = invoice.seller?.stateCode || '';

    // Buyer
    document.getElementById('buyerName').value = invoice.buyer?.name || '';
    document.getElementById('buyerAddress').value = invoice.buyer?.address || '';
    document.getElementById('buyerGSTIN').value = invoice.buyer?.gstin || '';
    document.getElementById('buyerState').value = invoice.buyer?.state || '';
    document.getElementById('buyerStateCode').value = invoice.buyer?.stateCode || '';

    // Bank
    document.getElementById('bankName').value = invoice.bank?.name || '';
    document.getElementById('accountNumber').value = invoice.bank?.accountNumber || '';
    document.getElementById('ifscCode').value = invoice.bank?.ifscCode || '';
    document.getElementById('panNumber').value = invoice.bank?.panNumber || '';

    // Terms
    document.getElementById('terms').value = invoice.terms || '';

    // Notes
    document.getElementById('notes').value = invoice.notes || '';

    // Line items
    const container = document.getElementById('lineItemsContainer');
    container.innerHTML = '';
    if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
            addLineItem(item);
        });
    } else {
        addLineItem();
    }
}

function resetForm() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('lineItemsContainer').innerHTML = '';
    addLineItem();
    document.getElementById('invoiceDate').valueAsDate = new Date();

    // Reset branding defaults
    if (document.getElementById('brandFull')) {
        document.getElementById('brandFull').value = 'ProHostix';
        document.getElementById('brandSubtitle').value = 'Leading Hosting Solutions';
        document.getElementById('brandColor').value = '#009966';
        if (document.getElementById('brandColorText')) {
            document.getElementById('brandColorText').value = '#009966';
        }
        document.getElementById('splitIndex').value = '3';
    }

    // Reset GST toggle
    const gstToggle = document.getElementById('enableGST');
    if (gstToggle) {
        gstToggle.checked = true;
        toggleGSTFields(true);
    }
}

// ===== Line Items Management =====
function addLineItem(data = null) {
    const container = document.getElementById('lineItemsContainer');
    const itemNumber = container.children.length + 1;

    const lineItem = document.createElement('div');
    lineItem.className = 'line-item';
    lineItem.innerHTML = `
        <div class="line-item-header">
            <h4>Item ${itemNumber}</h4>
            <button type="button" class="btn-remove" onclick="removeLineItem(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Service Description *</label>
                <textarea data-field="description" rows="2" required>${data?.description || ''}</textarea>
            </div>
            <div class="form-group gst-field">
                <label>SAC Code</label>
                <input type="text" data-field="sac" value="${data?.sac || ''}">
            </div>
            <div class="form-group">
                <label>Amount (₹) *</label>
                <input type="number" step="0.01" data-field="taxableValue" value="${data?.taxableValue || ''}" required>
            </div>
            <div class="form-group gst-field">
                <label>CGST Rate (%)</label>
                <input type="number" step="0.01" data-field="cgstRate" value="${data?.cgstRate || '0'}">
            </div>
            <div class="form-group gst-field">
                <label>SGST Rate (%)</label>
                <input type="number" step="0.01" data-field="sgstRate" value="${data?.sgstRate || '0'}">
            </div>
            <div class="form-group gst-field">
                <label>IGST Rate (%)</label>
                <input type="number" step="0.01" data-field="igstRate" value="${data?.igstRate || '0'}">
            </div>
        </div>
    `;

    container.appendChild(lineItem);

    // Add event listeners for live preview
    lineItem.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });

    // Apply current GST state
    const gstToggle = document.getElementById('enableGST');
    if (gstToggle) {
        toggleGSTFields(gstToggle.checked);
    }
}

function removeLineItem(button) {
    const container = document.getElementById('lineItemsContainer');
    if (container.children.length > 1) {
        button.closest('.line-item').remove();
        // Renumber items
        container.querySelectorAll('.line-item').forEach((item, index) => {
            item.querySelector('h4').textContent = `Item ${index + 1}`;
        });
        updateLivePreview();
    } else {
        alert('At least one item is required');
    }
}

// ===== Live Preview =====
function updateLivePreview() {
    const formData = getFormData();
    const previewContainer = document.getElementById('livePreview');
    previewContainer.innerHTML = generateInvoiceHTML(formData);
}

// ===== Invoice List Rendering =====
function renderInvoiceList() {
    const container = document.getElementById('invoiceList');
    const emptyState = document.getElementById('emptyState');

    if (invoices.length === 0) {
        container.innerHTML = '';
        emptyState.classList.add('visible');
        return;
    }

    emptyState.classList.remove('visible');

    container.innerHTML = invoices.map(invoice => {
        const total = calculateInvoiceTotal(invoice);
        return `
            <div class="invoice-card" onclick="showPreview('${invoice.id}')">
                <div class="invoice-card-header">
                    <div class="invoice-number">${invoice.invoiceNumber}</div>
                    <div class="invoice-date">${formatDate(invoice.invoiceDate)}</div>
                </div>
                <div class="invoice-details">
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Client:</span>
                        <span class="invoice-detail-value">${invoice.buyer?.name || 'N/A'}</span>
                    </div>
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Items:</span>
                        <span class="invoice-detail-value">${invoice.items?.length || 0}</span>
                    </div>
                </div>
                <div class="invoice-total">₹${total.toFixed(2)}</div>
                <div class="invoice-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-secondary" onclick="showEditor('${invoice.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                        </svg>
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteInvoice('${invoice.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterInvoices(searchTerm) {
    const cards = document.querySelectorAll('.invoice-card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
}

// ===== Download/Print =====
function downloadInvoice(event) {
    const invoice = invoices.find(inv => inv.id === currentInvoiceId);

    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
        console.warn('html2pdf library not loaded. Using print dialog instead.');
        alert('PDF download library not loaded. Using browser print dialog.\n\nTo save as PDF:\n1. Select "Save as PDF" or "Microsoft Print to PDF" as printer\n2. Click Save');
        window.print();
        return;
    }

    if (!invoice) {
        window.print();
        return;
    }

    try {
        const invoiceElement = document.getElementById('invoicePreview');
        if (!invoiceElement) {
            throw new Error('Invoice preview element not found');
        }

        const filename = `Invoice_${invoice.invoiceNumber.replace(/[/\\]/g, '-')}.pdf`;

        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        // Show a loading indicator if button was clicked
        if (event && event.target) {
            const originalText = event.target.textContent;
            event.target.textContent = 'Generating PDF...';
            event.target.disabled = true;

            // Generate PDF
            html2pdf().set(opt).from(invoiceElement).save().then(() => {
                // Reset button
                event.target.textContent = originalText;
                event.target.disabled = false;
            }).catch((error) => {
                console.error('PDF generation error:', error);
                alert('Failed to generate PDF. Using print dialog instead.');
                event.target.textContent = originalText;
                event.target.disabled = false;
                window.print();
            });
        } else {
            // No event object, just generate PDF
            html2pdf().set(opt).from(invoiceElement).save().catch((error) => {
                console.error('PDF generation error:', error);
                alert('Failed to generate PDF. Using print dialog instead.');
                window.print();
            });
        }
    } catch (error) {
        console.error('Error in downloadInvoice:', error);
        alert('Error generating PDF. Using print dialog instead.');
        window.print();
    }
}

// ===== Helper Functions =====
function calculateInvoiceTotal(invoice) {
    let total = 0;
    if (invoice.items) {
        const enableGST = invoice.enableGST !== false;
        invoice.items.forEach(item => {
            const taxableValue = parseFloat(item.taxableValue) || 0;

            if (enableGST) {
                const cgstRate = parseFloat(item.cgstRate) || 0;
                const sgstRate = parseFloat(item.sgstRate) || 0;
                const igstRate = parseFloat(item.igstRate) || 0;

                const cgst = taxableValue * cgstRate / 100;
                const sgst = taxableValue * sgstRate / 100;
                const igst = taxableValue * igstRate / 100;

                total += taxableValue + cgst + sgst + igst;
            } else {
                total += taxableValue;
            }
        });
    }
    return total;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = invoices.length + 1;
    return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
}

// Format Date helper
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// ===== Local Storage =====
function saveToLocalStorage() {
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function loadInvoices() {
    const stored = localStorage.getItem('invoices');
    if (stored) {
        try {
            invoices = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading invoices:', e);
            invoices = [];
        }
    }
}
