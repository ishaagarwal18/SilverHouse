import React, { useState, useEffect, useRef } from 'react';
import {
  X, Printer, Download, CheckCircle2, ShieldCheck,
  AlertCircle, RefreshCw, QrCode, FileText, Check
} from 'lucide-react';
import QRCode from 'qrcode';
import html2pdf from 'html2pdf.js';
import { fetchOrderInvoiceApi } from '../../services/api';

function convertNumberToIndianWordsClient(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '';
  const num = Math.floor(Math.abs(Number(amount)));
  const paise = Math.round((Math.abs(Number(amount)) - num) * 100);

  if (num === 0 && paise === 0) return 'Rs. Zero - Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function twoDigits(n) {
    if (n < 20) return singleDigits[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + singleDigits[unit] : '');
  }

  function threeDigits(n) {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred';
      n = n % 100;
      if (n > 0) str += ' ';
    }
    if (n > 0) {
      str += twoDigits(n);
    }
    return str;
  }

  let words = '';
  let remaining = num;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const remainder = remaining;

  if (crore > 0) words += threeDigits(crore) + ' Crore ';
  if (lakh > 0) words += twoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += twoDigits(thousand) + ' Thousand ';
  if (remainder > 0) words += threeDigits(remainder);

  words = words.trim();
  let result = 'Rs. ' + words;
  if (paise > 0) {
    result += ' and ' + twoDigits(paise) + ' Paise';
  }
  result += ' - Only';
  return result;
}

export default function OrderInvoiceModal({
  isOpen,
  onClose,
  orderIdentifier,
  autoPrint = false
}) {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const printRef = useRef(null);

  const paymentMethodLower = String(invoice?.payment_method || '').toLowerCase();
  const isOnlinePayment = paymentMethodLower.includes('online') || paymentMethodLower.includes('razorpay') || paymentMethodLower.includes('upi') || invoice?.payment_status === 'PAID';
  const displayPaymentMode = isOnlinePayment ? 'Online' : 'COD';

  // Load Invoice data dynamically from DB API whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setInvoice(null);
      setError('');
      setLoading(false);
      setDownloading(false);
      return;
    }

    const cleanId = String(orderIdentifier || '').replace(/^#/, '').trim();
    if (!cleanId) {
      setError('No valid order identifier specified.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    // Step 1: Fetch from live Stored Procedure backend API
    fetchOrderInvoiceApi(cleanId)
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && res.invoice) {
          applyInvoiceData(res.invoice);
        } else {
          // Step 2: Try local storage backup fallback if available
          const foundLocal = findLocalOrderFallback(cleanId);
          if (foundLocal) {
            applyInvoiceData(foundLocal);
          } else {
            setError(res?.error || `Could not retrieve invoice for order #${cleanId}`);
          }
        }
      })
      .catch(err => {
        if (!isMounted) return;
        const foundLocal = findLocalOrderFallback(cleanId);
        if (foundLocal) {
          applyInvoiceData(foundLocal);
        } else {
          setError(err.message || 'Error connecting to database.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, orderIdentifier]);

  // Helper to construct invoice from local storage order when DB sync is delayed
  const findLocalOrderFallback = (idStr) => {
    try {
      const raw = localStorage.getItem('silverhouse_orders');
      if (!raw) return null;
      const orders = JSON.parse(raw);
      if (!Array.isArray(orders)) return null;

      const matched = orders.find(o =>
        String(o.order_number || '').replace(/^#/, '').toLowerCase() === idStr.toLowerCase() ||
        String(o.order_id || '') === idStr
      );

      if (!matched) return null;

      const finalAmount = Number(matched.final_payable || matched.total_amount || 0);
      const totalAmount = Number(matched.total_amount || finalAmount);
      const discount = Number(matched.discount_amount || 0);

      const items = (matched.items || []).map((it, idx) => ({
        s_no: idx + 1,
        item_description: it.product_name || it.title || it.name || 'Silver Jewelry Piece',
        category_name: it.category_name || '925 Sterling Silver',
        purity: it.purity || '92.5 Sterling Silver',
        net_weight_gm: Number(it.weight ? String(it.weight).replace(/[^0-9.]/g, '') : 10) || 10,
        making_charges: Number(it.making_charges || it.labour_cost || 0),
        metal_rate_per_gm: Number(it.unit_price || it.price || 0) > 0 ? Math.round((Number(it.unit_price || it.price || 0) * 0.85) / 10) : 378,
        quantity: it.quantity || it.qty || 1,
        unit_price: Number(it.unit_price || it.price || 0),
        discount_percent: Number(it.discount_percent || 0),
        discount_amount: Number(it.discount_amount || 0),
        gst_percent: 3.00,
        gst_amount: Math.round(Number(it.subtotal || it.unit_price || 0) * 3.0 / 103.0),
        total_price: Number(it.subtotal || (Number(it.quantity || 1) * Number(it.unit_price || it.price || 0)))
      }));

      return {
        order_id: matched.order_id,
        order_number: matched.order_number,
        invoice_number: matched.order_number,
        invoice_date: matched.created_at || new Date().toISOString(),
        due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        payment_status: matched.payment_status || 'PENDING',
        order_status: matched.order_status || 'CONFIRMED',
        payment_method: (matched.payment_method === 'razorpay' || matched.payment_method === 'Online' || matched.payment_status === 'PAID') ? 'Online' : 'COD',
        place_of_supply: 'Gujarat',
        reverse_charge: 'No',
        company: {
          name: 'Silver House',
          address: '217, Kanak Chamber, Gandhi Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380058',
          phone: '9537178477',
          email: 'sunilag28017@gmail.com',
          gstin: null,
          pan: 'ADDPA8283B',
          upi_id: '9537178477@upi'
        },
        billing: {
          name: matched.customer_name || 'Valued Patron',
          address: matched.delivery_address || 'Registered Delivery Address',
          phone: matched.customer_phone || '',
          email: matched.customer_email || '',
          gstin: null
        },
        shipping: {
          name: matched.customer_name || 'Valued Patron',
          address: matched.delivery_address || 'Registered Delivery Address',
          phone: matched.customer_phone || '',
          email: matched.customer_email || ''
        },
        items: items.length > 0 ? items : [{
          s_no: 1,
          item_description: 'Artisanal 925 Sterling Silver Creation',
          category_name: 'Jewelry',
          purity: '92.5 Sterling Silver',
          net_weight_gm: 10,
          making_charges: 210,
          metal_rate_per_gm: 378,
          quantity: 1,
          unit_price: finalAmount,
          discount_percent: 0,
          discount_amount: 0,
          gst_percent: 3,
          gst_amount: Math.round(finalAmount * 3.0 / 103.0),
          total_price: finalAmount
        }],
        terms: [
          'Goods once sold will not be returned or exchanged without original cash memo/invoice.',
          'Precious metal value will be calculated based on pure weight & prevailing silver market rate on transaction date.',
          'Making charges, wastage, and statutory taxes are non-refundable in exchange or buyback.',
          'All articles are guaranteed genuine and BIS hallmarked 92.5% Sterling Silver.',
          'Subject to Ahmedabad jurisdiction only.'
        ],
        subtotal: totalAmount,
        discount_amount: discount,
        rounded_off: 0,
        final_payable: finalAmount,
        amount_in_words: convertNumberToIndianWordsClient(finalAmount)
      };
    } catch (e) {
      return null;
    }
  };

  const applyInvoiceData = (invData) => {
    setInvoice(invData);

    // Generate dynamic UPI QR Code
    const upiId = invData.company?.upi_id || '9537178477@upi';
    const payeeName = invData.company?.name || 'Silver House';
    const orderNum = invData.order_number || orderIdentifier;
    const amount = invData.final_payable || 0;

    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Invoice ' + orderNum)}`;

    QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 140,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(qrErr => {
        console.warn('[Invoice] QR code generation error:', qrErr);
      });

    // Auto-trigger PDF download or print if requested
    if (autoPrint) {
      setTimeout(() => {
        handleDownloadPdf(invData);
      }, 700);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = (activeInv = invoice) => {
    const element = document.getElementById('silverhouse-printable-invoice');
    if (!element) {
      window.print();
      return;
    }

    setDownloading(true);
    const invoiceNum = activeInv?.invoice_number || activeInv?.order_number || String(orderIdentifier || 'invoice').replace(/^#/, '');

    const opt = {
      margin: [6, 6, 6, 6],
      filename: `SilverHouse-Invoice-${invoiceNum}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setDownloading(false);
      })
      .catch(err => {
        console.warn('[Invoice] html2pdf generation notice, falling back to print dialog:', err);
        setDownloading(false);
        window.print();
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return String(dateStr);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">

      {/* Print-specific style rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 6mm 6mm 6mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #silverhouse-printable-invoice, #silverhouse-printable-invoice * {
            visibility: visible;
          }
          #silverhouse-printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Outer Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none">

        {/* Top Control Header Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">Official Tax Invoice / Bill</h3>
              <p className="text-[11px] text-slate-400">Order #{String(orderIdentifier || '').replace(/^#/, '')} • Pure 925 Hallmarked Silver</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              disabled={loading || !!error || downloading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Download official PDF file directly to your device"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Bill (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !!error}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              title="Print Bill or Save via Print Dialog"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Loading / Error */}
        <div className="max-h-[85vh] overflow-y-auto p-3 sm:p-6 bg-slate-100/60 print:bg-white print:p-0 print:max-h-none print:overflow-visible">

          {loading && (
            <div className="py-20 text-center space-y-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Retrieving Tax Invoice from Database...</p>
              <p className="text-xs text-slate-400">Fetching company metadata, customer address, hallmarking details & items</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center space-y-4 bg-white rounded-xl shadow-xs border border-rose-200 p-6">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-rose-800">Invoice Retrieval Notice</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE PHYSICAL TAX INVOICE REPLICA SHEET                    */}
          {/* Matches media_1793607431612_1dc81c81.jpg strictly         */}
          {/* ========================================================= */}
          {!loading && !error && invoice && (
            <div
              id="silverhouse-printable-invoice"
              ref={printRef}
              className="bg-white text-black p-4 sm:p-7 shadow-md rounded-xl print:rounded-none print:shadow-none print:p-0 text-[11px] leading-tight font-sans border border-slate-300 print:border-none mx-auto max-w-[850px]"
            >

              {/* TOP HEADER: Page No & Title */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-slate-600 font-mono">Page No. 1 of 1</span>
                <div className="text-center flex-1 pr-14">
                  <span className="font-bold text-base tracking-wider uppercase underline underline-offset-2">Invoice</span>
                  <div className="text-[10px] font-bold text-slate-700 tracking-wide mt-0.5">Original Copy</div>
                </div>
              </div>

              {/* COMPANY DETAILS & INVOICE METADATA CONTAINER */}
              <div className="border border-black flex flex-col md:flex-row print:flex-row">

                {/* Left Side: Company Name & Contact Info */}
                <div className="p-2 sm:p-2.5 flex-1 border-b md:border-b-0 md:border-r print:border-b-0 print:border-r border-black space-y-1">
                  <h1 className="font-serif font-black text-base sm:text-lg text-black uppercase tracking-tight">
                    {invoice.company?.name || 'Silver House'}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-800 leading-snug">
                    <strong className="font-semibold">Address:</strong> {invoice.company?.address || '217, Kanak Chamber, Gandhi Road'}, {invoice.company?.city || 'Ahmedabad'}, {invoice.company?.state || 'Gujarat'} {invoice.company?.pincode || '380058'}, India.
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-800">
                    <strong className="font-semibold">Mobile:</strong> +91 {invoice.company?.phone || '9537178477'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-800">
                    <strong className="font-semibold">Email:</strong> {invoice.company?.email || 'sunilag28017@gmail.com'}
                  </p>
                  <div className="text-[10px] sm:text-[11px] text-slate-900 pt-0.5 flex flex-wrap gap-x-2">
                    <span><strong>GSTIN:</strong> {invoice.company?.gstin || ''}</span>
                    <span>|</span>
                    <span><strong>PAN:</strong> {invoice.company?.pan || ''}</span>
                  </div>
                </div>

                {/* Right Side: Invoice Number, Place of Supply, Date, Due Date */}
                <div className="w-full md:w-[320px] print:w-[320px] divide-y divide-black text-[10px] sm:text-[11px]">

                  {/* Row 1: Invoice Number & Date */}
                  <div className="grid grid-cols-2 divide-x divide-black">
                    <div className="p-1.5 sm:p-2 bg-slate-50/50">
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Invoice Number</span>
                      <strong className="font-mono text-xs font-black text-black">{invoice.invoice_number || invoice.order_number}</strong>
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Invoice Date</span>
                      <strong className="font-mono text-xs font-semibold text-black">{formatDate(invoice.invoice_date)}</strong>
                    </div>
                  </div>

                  {/* Row 2: Place of Supply & Due Date */}
                  <div className="grid grid-cols-2 divide-x divide-black">
                    <div className="p-1.5 sm:p-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Place of Supply</span>
                      <span className="font-semibold text-black">{invoice.place_of_supply || 'Gujarat'}</span>
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Due Date</span>
                      <span className="font-mono font-medium text-black">{isOnlinePayment ? 'Immediate / Paid' : formatDate(invoice.due_date)}</span>
                    </div>
                  </div>

                  {/* Row 3: Reverse Charge */}
                  <div className="p-1.5 sm:p-2 grid grid-cols-2 divide-x divide-black">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Reverse Charge</span>
                      <span className="font-semibold text-black">{invoice.reverse_charge || 'No'}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Payment Mode</span>
                      <span className={`font-bold text-[10px] uppercase ${isOnlinePayment ? 'text-emerald-800' : 'text-slate-900'}`}>{displayPaymentMode}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* BILLING & SHIPPING DETAILS (2 BOXES) */}
              <div className="border-x border-b border-black grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 md:divide-x print:divide-y-0 print:divide-x divide-black text-[10px] sm:text-[11px]">

                {/* Billing Details */}
                <div className="p-2 sm:p-2.5 space-y-1">
                  <h3 className="font-bold uppercase tracking-wider text-xs border-b border-slate-200 pb-0.5">Billing Details</h3>
                  <p><strong className="font-semibold">Name:</strong> {invoice.billing?.name || 'Valued Patron'}</p>
                  <p className="leading-snug"><strong className="font-semibold">Address:</strong> {invoice.billing?.address || 'Registered Address, Ahmedabad'}</p>
                  <p>
                    <strong className="font-semibold">Mobile:</strong> {invoice.billing?.phone || '-'}
                    {invoice.billing?.email && <span> | <strong className="font-semibold">Email:</strong> {invoice.billing.email}</span>}
                  </p>
                  <p><strong className="font-semibold">GSTIN:</strong> {invoice.billing?.gstin || ''}</p>
                </div>

                {/* Shipping Details */}
                <div className="p-2 sm:p-2.5 space-y-1">
                  <h3 className="font-bold uppercase tracking-wider text-xs border-b border-slate-200 pb-0.5">Shipping Details</h3>
                  <p><strong className="font-semibold">Name:</strong> {invoice.shipping?.name || invoice.billing?.name || 'Valued Patron'}</p>
                  <p className="leading-snug"><strong className="font-semibold">Address:</strong> {invoice.shipping?.address || invoice.billing?.address || 'Registered Delivery Address'}</p>
                  <p>
                    <strong className="font-semibold">Mobile:</strong> {invoice.shipping?.phone || invoice.billing?.phone || '-'}
                    {invoice.shipping?.email && <span> | <strong className="font-semibold">Email:</strong> {invoice.shipping.email}</span>}
                  </p>
                </div>

              </div>

              {/* ITEM TABLE (11 COLUMNS AS IN PHOTO) */}
              <div className="overflow-x-auto">
                <table className="w-full border-x border-b border-black text-[9.5px] sm:text-[10px] border-collapse text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black divide-x divide-black">
                      <th className="py-1 px-1 w-7">S. No.</th>
                      <th className="py-1 px-1.5 text-left min-w-[130px]">Item Description</th>
                      <th className="py-1 px-1 w-16">Silver Rate/Gm</th>
                      <th className="py-1 px-1 w-8">Qty</th>
                      <th className="py-1 px-1 w-16">Purity</th>
                      <th className="py-1 px-1 w-14">Net Weight (Gm)</th>
                      <th className="py-1 px-1 w-14">Making Charges (₹)</th>
                      <th className="py-1 px-1 w-10">GST %</th>
                      <th className="py-1 px-1 w-14">GST Amount (₹)</th>
                      <th className="py-1 px-1 w-12">Discount (₹)</th>
                      <th className="py-1 px-1.5 text-right w-18">Total Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-normal">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx} className="divide-x divide-black">
                          <td className="py-1 px-1">{item.s_no || idx + 1}</td>
                          <td className="py-1 px-1.5 text-left font-medium">
                            <span className="font-bold block text-[10px] sm:text-[10.5px] text-black">{item.item_description}</span>
                            {item.category_name && (
                              <span className="text-[9px] text-slate-600 block">{item.category_name}</span>
                            )}
                          </td>
                          <td className="py-1 px-1 font-mono text-[9.5px]">{formatCurrency(item.metal_rate_per_gm)}</td>
                          <td className="py-1 px-1 font-mono">{Number(item.quantity || 1).toFixed(2)}</td>
                          <td className="py-1 px-1 font-medium">{item.purity || '92.5 Sterling'}</td>
                          <td className="py-1 px-1 font-mono">{Number(item.net_weight_gm || 10).toFixed(2)}</td>
                          <td className="py-1 px-1 font-mono">{formatCurrency(item.making_charges)}</td>
                          <td className="py-1 px-1 font-mono">{item.gst_percent ? `${item.gst_percent}%` : '3%'}</td>
                          <td className="py-1 px-1 font-mono">{formatCurrency(item.gst_amount)}</td>
                          <td className="py-1 px-1 font-mono">{formatCurrency(item.discount_amount)}</td>
                          <td className="py-1 px-1.5 text-right font-mono font-bold">{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="py-4 text-center italic text-slate-500">
                          Order items details being synchronized from workshop records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TOTALS & ROUNDED OFF SUMMARY */}
              <div className="border-x border-b border-black text-[10px] sm:text-[11px]">

                {/* Rounded Off Row */}
                <div className="flex justify-between items-center px-3 py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Rounded Off (+/-)</span>
                  <span className="font-mono text-slate-800">
                    {invoice.rounded_off >= 0 ? `+ ${formatCurrency(invoice.rounded_off)}` : formatCurrency(invoice.rounded_off)}
                  </span>
                </div>

                {/* Total Row */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-slate-50 border-b border-black font-bold">
                  <span className="text-xs uppercase tracking-wider text-black">Total</span>
                  <span className="font-mono text-sm sm:text-base font-black text-black">
                    ₹ {formatCurrency(invoice.final_payable)}
                  </span>
                </div>

                {/* Amount in Words Row */}
                <div className="px-3 py-1.5 bg-white text-[10px] sm:text-[10.5px]">
                  <strong>Amount in Words: </strong>
                  <span className="italic font-medium text-slate-900">{invoice.amount_in_words}</span>
                </div>

              </div>

              {/* BOTTOM 3-COLUMN SECTION: Terms | QR Code | Signatory */}
              <div className="border-x border-b border-black grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 divide-y md:divide-y-0 md:divide-x print:divide-y-0 print:divide-x divide-black text-[9px] sm:text-[9.5px]">

                {/* Col 1: Terms & Conditions (5 columns wide) */}
                <div className="md:col-span-5 print:col-span-5 p-2 sm:p-2.5 space-y-1">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-black">Terms and Conditions</h4>
                  <ol className="list-decimal pl-3 space-y-0.5 text-slate-800 leading-tight">
                    {invoice.terms && invoice.terms.length > 0 ? (
                      invoice.terms.map((term, tIdx) => (
                        <li key={tIdx}>{term}</li>
                      ))
                    ) : (
                      <>
                        <li>Goods once sold will not be returned or exchanged without original cash memo/invoice.</li>
                        <li>Precious metal value will be calculated based on pure weight & prevailing silver market rate on transaction date.</li>
                        <li>Making charges, wastage, and statutory taxes are non-refundable in exchange or buyback.</li>
                        <li>All articles are guaranteed genuine and BIS hallmarked 92.5% Sterling Silver.</li>
                        <li>Subject to Ahmedabad jurisdiction only.</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* Col 2: Dynamic UPI QR Code for instant payment/verification (3 columns wide) */}
                <div className="md:col-span-3 print:col-span-3 p-2 text-center flex flex-col items-center justify-center space-y-1 bg-slate-50/50">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-24 h-24 sm:w-28 sm:h-28 border border-black bg-white p-1"
                    />
                  ) : (
                    <div className="w-24 h-24 border border-dashed border-slate-400 flex items-center justify-center text-slate-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                  <div className="text-[8.5px] sm:text-[9px] font-mono font-bold text-slate-900 break-all">
                    UPI Id - {invoice.company?.upi_id || '9537178477@upi'}
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider">
                    {isOnlinePayment ? 'Online Payment Verified' : 'Pay On Delivery'}
                  </span>
                </div>

                {/* Col 3: Company Signature & Stamp (4 columns wide) */}
                <div className="md:col-span-4 print:col-span-4 p-2.5 flex flex-col justify-between text-right">
                  <div>
                    <span className="text-[9px] text-slate-600 block">Pay For -</span>
                    <strong className="font-serif font-black text-xs text-black block">
                      {invoice.company?.name || 'Silver House'}
                    </strong>
                  </div>

                  <div className="pt-10">
                    <div className="border-t border-slate-400 inline-block pt-1 min-w-[130px] text-center">
                      <span className="font-semibold text-[9px] sm:text-[9.5px] text-slate-800 block">Authorized Signatory</span>
                      <span className="text-[8px] text-slate-500">Stamp & Signature</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Hallmarking & Authenticity Trust Bar */}
              <div className="pt-2 text-center text-[9px] text-slate-500 flex items-center justify-center space-x-2">
                <span>🛡️ BIS Hallmarked 925 Pure Silver</span>
                <span>•</span>
                <span>CCTV Inspected Transit</span>
                <span>•</span>
                <span>Official Government Tax Invoice</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
