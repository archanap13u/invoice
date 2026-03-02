// Invoice Template Generator - EDTECH Innovate Format
// Generates HTML matching the exact EDTECH invoice layout (PERFORMA INVOICE Style)

function generateInvoiceHTML(data) {
    const {
        invoiceNumber,
        invoiceDate,
        reverseCharge,
        placeOfSupply,
        seller,
        buyer,
        items,
        bank,
        terms,
        enableGST
    } = data;

    const isGSTEnabled = enableGST !== false; // Default to true if undefined

    // Calculate totals
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    items.forEach(item => {
        const taxableValue = parseFloat(item.taxableValue) || 0;
        subtotal += taxableValue;

        if (isGSTEnabled) {
            const cgstRate = parseFloat(item.cgstRate) || 0;
            const sgstRate = parseFloat(item.sgstRate) || 0;
            const igstRate = parseFloat(item.igstRate) || 0;

            totalCGST += (taxableValue * cgstRate / 100);
            totalSGST += (taxableValue * sgstRate / 100);
            totalIGST += (taxableValue * igstRate / 100);
        }
    });

    const grandTotal = subtotal + totalCGST + totalSGST + totalIGST;

    // Generate line items HTML
    const itemsHTML = items.map((item, index) => {
        const taxableValue = parseFloat(item.taxableValue) || 0;
        let cgstAmount = 0, sgstAmount = 0, igstAmount = 0, total = taxableValue;

        if (isGSTEnabled) {
            const cgstRate = parseFloat(item.cgstRate) || 0;
            const sgstRate = parseFloat(item.sgstRate) || 0;
            const igstRate = parseFloat(item.igstRate) || 0;

            cgstAmount = (taxableValue * cgstRate / 100);
            sgstAmount = (taxableValue * sgstRate / 100);
            igstAmount = (taxableValue * igstRate / 100);
            total += cgstAmount + sgstAmount + igstAmount;
        }

        if (isGSTEnabled) {
            return `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>
                        <div style="font-weight: bold;">${item.description || ''}</div>
                        ${item.sac ? '<div style="font-size: 0.9em;">SAC: ' + item.sac + '</div>' : ''}
                    </td>
                    <td style="text-align: center;">${item.sac || ''}</td>
                    <td style="text-align: right;">${taxableValue.toFixed(2)}</td>
                    <td style="text-align: center;">${parseFloat(item.igstRate) > 0 ? item.igstRate + '%' : ''}</td>
                    <td style="text-align: right;">${igstAmount > 0 ? igstAmount.toFixed(2) : '0'}</td>
                    <td style="text-align: center;">${parseFloat(item.cgstRate) > 0 ? item.cgstRate + '%' : ''}</td>
                    <td style="text-align: right;">${cgstAmount > 0 ? cgstAmount.toFixed(2) : '0'}</td>
                    <td style="text-align: center;">${parseFloat(item.sgstRate) > 0 ? item.sgstRate + '%' : ''}</td>
                    <td style="text-align: right;">${sgstAmount > 0 ? sgstAmount.toFixed(2) : '0'}</td>
                    <td style="text-align: right;">${total.toFixed(2)}</td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td><div style="font-weight: bold;">${item.description || ''}</div></td>
                    <td style="text-align: right;">${taxableValue.toFixed(2)}</td>
                </tr>
            `;
        }
    }).join('');

    // Generate header branding
    // Generate header branding
    const branding = data.branding || { full: 'ProHostix', subtitle: 'Leading Hosting Solutions', color: '#009966', split: 3 };
    const brandFull = branding.full || 'EDTECH';
    const splitIndex = parseInt(branding.split) || 2;
    const brandColor = branding.color || '#FF6B00';
    const brandPart1 = brandFull.substring(0, splitIndex);
    const brandPart2 = brandFull.substring(splitIndex);

    // Dynamic Title based on context or default
    const invoiceTitle = isGSTEnabled ? 'PERFORMA INVOICE' : 'INVOICE';

    return `
        <div class="invoice-box">
            
            <!-- Header -->
            <div class="inv-header-row">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="20" r="10" fill="#009966"/>
                            <circle cx="20" cy="50" r="10" fill="#009966"/>
                            <rect x="20" y="46" width="60" height="8" fill="black"/>
                            <circle cx="80" cy="50" r="10" fill="#009966"/>
                            <circle cx="50" cy="80" r="10" fill="#009966"/>
                        </svg>
                        <div style="font-family: 'Inter', sans-serif; font-weight: 800; font-size: 16px; margin-top: -5px; color: #000;">
                            <span style="color: #009966;">Pro</span>Hostix
                        </div>
                    </div>
                    <div>
                        <div class="inv-logo-text">
                            <span>${brandFull}</span>
                        </div>
                        <div class="inv-logo-sub">${branding.subtitle || 'Leading Hosting Solutions'}</div>
                    </div>
                </div>
                <div class="inv-title">${invoiceTitle}</div>
            </div>

            <!-- Invoice Meta Box -->
            <div class="inv-border">
                <div class="inv-flex" style="font-weight: bold; font-size: 11px;">
                    <div class="inv-flex-1" style="padding: 4px; border-right: 1px solid black;">
                        Reverse Charge: <span style="font-weight: normal;">${reverseCharge || 'No'}</span>
                    </div>
                     <div class="inv-flex-1" style="padding: 4px; border-right: 1px solid black;">
                        Invoice No: <span style="font-weight: normal;">${invoiceNumber}</span>
                    </div>
                     <div class="inv-flex-1" style="padding: 4px; border-right: 1px solid black;">
                        Invoice Date: <span style="font-weight: normal;">${invoiceDate}</span>
                    </div>
                     <div class="inv-flex-1" style="padding: 4px; border-right: 1px solid black;">
                        Place Of Supply: <span style="font-weight: normal;">${placeOfSupply || ''}</span>
                    </div>
                     <div class="inv-flex-1" style="padding: 4px;">
                        State: <span style="font-weight: normal;">${seller.state || ''}</span>
                    </div>
                </div>
            </div>

            <!-- Party Details Box -->
            <div class="inv-flex inv-border inv-border-top-none">
                <!-- Receiver / Billed To -->
                <div class="inv-w-half" style="border-right: 1px solid black;">
                    <div class="inv-section-header">Details Of Receiver/Billed To:</div>
                    <div style="padding: 8px;">
                        <div class="inv-field-row"><span class="inv-label">Name:</span> <span>${buyer.name}</span></div>
                        <div class="inv-field-row"><span class="inv-label">Address:</span> <span>${buyer.address}</span></div>
                        <div class="inv-field-row"><span class="inv-label">GSTIN:</span> <span>${buyer.gstin || '-'}</span></div>
                        <div class="inv-field-row">
                             <span class="inv-label">State:</span> <span>${buyer.state}</span>
                             <div style="border: 2px solid black; padding: 0 5px; margin-left: auto;">
                                <span class="inv-label">State code:</span> <span>${buyer.stateCode || '-'}</span>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Supplier / Service Provider -->
                <div class="inv-w-half">
                    <div class="inv-section-header">Details Of Supplier/Service Provider</div>
                    <div style="padding: 8px;">
                         <div class="inv-field-row"><span class="inv-label">Name:</span> <span>${seller.name}</span></div>
                        <div class="inv-field-row"><span class="inv-label">Address:</span> <span>${seller.address}</span></div>
                        <div class="inv-field-row"><span class="inv-label">GSTIN:</span> <span>${seller.gstin || '-'}</span></div>
                        <div class="inv-field-row">
                             <span class="inv-label">State:</span> <span>${seller.state}</span>
                             <div style="border: 2px solid black; padding: 0 5px; margin-left: auto;">
                                <span class="inv-label">State code:</span> <span>${seller.stateCode || '-'}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="inv-border inv-border-top-none">
                <table class="inv-table">
                    <thead>
                        ${isGSTEnabled ? `
                        <tr>
                            <th rowspan="2" style="width: 40px;">S.no</th>
                            <th rowspan="2">Name Of Service</th>
                            <th rowspan="2" style="width: 60px;">SAC</th>
                            <th rowspan="2">Taxable Value</th>
                            <th colspan="2">IGST</th>
                            <th colspan="2">CGST</th>
                            <th colspan="2">SGST</th>
                            <th rowspan="2">Total</th>
                        </tr>
                        <tr>
                            <th style="background-color: #f2f2f2 !important;">Rate</th>
                            <th style="background-color: #f2f2f2 !important;">Amount</th>
                             <th style="background-color: #f2f2f2 !important;">Rate</th>
                            <th style="background-color: #f2f2f2 !important;">Amount</th>
                             <th style="background-color: #f2f2f2 !important;">Rate</th>
                            <th style="background-color: #f2f2f2 !important;">Amount</th>
                        </tr>
                        ` : `
                        <tr>
                            <th style="width: 40px;">S.no</th>
                            <th>Name Of Service</th>
                            <th style="width: 100px;">Total</th>
                        </tr>
                        `}
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <!-- Total Row in Table -->
                        <tr style="font-weight: bold; background-color: ${brandColor}22;">
                            <td colspan="${isGSTEnabled ? 3 : 2}" style="text-align: right;">Total</td>
                            <td style="text-align: right;">${subtotal.toFixed(2)}</td>
                            ${isGSTEnabled ? `
                            <td colspan="2" style="text-align: right;">${totalIGST.toFixed(2)}</td>
                             <td colspan="2"style="text-align: center;">-</td> 
                             <td colspan="2"style="text-align: center;">-</td> 
                            <td style="text-align: right;">${grandTotal.toFixed(2)}</td>
                            ` : ''}
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Terms Header Line -->
             <div class="inv-flex inv-border inv-border-top-none">
                <div class="inv-flex-1 inv-blue-header" style="border-right: 1px solid black;">Terms & Conditions</div>
                <div class="inv-totals-box inv-border-top-none inv-border-bottom-none" style="border-left: none;">
                    <div class="inv-total-row">
                        <span>Total Amount Before Tax</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Footer Section -->
            <div class="inv-flex inv-border inv-border-top-none">
                 <!-- Left: Terms & Bank -->
                 <div class="inv-flex-1" style="border-right: 1px solid black; display: flex; flex-direction: column;">
                    <div style="flex: 1; padding: 5px; border-bottom: 1px solid black;">
                        ${terms || 'Invoice is raised against for the November 2025'}
                    </div>
                    
                    <div class="inv-blue-header" style="border-bottom: 1px solid black; border-top: 1px solid black;">Payment Details</div>
                    <div style="padding: 5px; font-size: 11px;">
                        <div class="inv-field-row"><span class="inv-label">Beneficiary Name:</span> <span>${seller.name.toUpperCase()}</span></div>
                        <div class="inv-field-row"><span class="inv-label">Account No:</span> <span>${bank.accountNumber || '-'}</span></div>
                        <div class="inv-field-row"><span class="inv-label">IFSC Code:</span> <span>${bank.ifscCode || '-'}</span></div>
                        <div class="inv-field-row"><span class="inv-label">Bank Name:</span> <span>${bank.name || '-'}</span></div>
                        <div class="inv-field-row"><span class="inv-label">PAN:</span> <span>${bank.panNumber || '-'}</span></div>
                    </div>
                 </div>

                 <!-- Right: Tax & Signatory -->
                 <div class="inv-totals-box" style="border: none; display: flex; flex-direction: column;">
                    <div class="inv-total-row"><span>Add: CGST</span> <span>${totalCGST > 0 ? totalCGST.toFixed(2) : '-'}</span></div>
                    <div class="inv-total-row"><span>Add: SGST</span> <span>${totalSGST > 0 ? totalSGST.toFixed(2) : '-'}</span></div>
                    <div class="inv-total-row"><span>Add: IGST</span> <span>${totalIGST > 0 ? totalIGST.toFixed(2) : '-'}</span></div>
                    <div class="inv-total-row inv-bold" style="border-top: 2px solid black; background: #f9f9f9;">
                        <span>Total Amount After Tax</span> <span>${grandTotal.toFixed(2)}</span>
                    </div>

                    <div style="border-top: 2px solid black; padding: 5px; text-align: center; margin-top: auto;">
                        <div class="inv-bold" style="margin-bottom: 30px;">Certified that the particulars given above are true & correct</div>
                        <div style="margin-bottom: 40px; text-align: right; padding-right: 10px;">For ${seller.name}</div>
                        <div style="text-align: right; font-size: 10px; padding-right: 10px;">Authorized Signatory</div>
                    </div>
                 </div>
            </div>

            <!-- Bottom Notes -->
            <div class="inv-notes">Notes</div>
            <div class="inv-border inv-border-top-none" style="padding: 5px; min-height: 60px;">
                ${data.notes || 'Please share your feedback and suggestions at support@prohostix.com'}
            </div>

        </div>
    `;
}
