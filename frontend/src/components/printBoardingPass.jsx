const printBoardingPass = (p) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Boarding Pass</title>
            <style>
                @page { size: landscape; margin: 15mm; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Courier New', monospace; background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .bp-wrapper { border: 3px solid #1a202c; border-radius: 12px; overflow: hidden; display: flex; width: 100%; max-width: 900px; }
                .bp-main { flex: 1; padding: 35px; display: flex; flex-direction: column; gap: 20px; }
                .bp-title { font-size: 1.4rem; font-weight: 900; letter-spacing: 6px; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
                .bp-row { display: flex; gap: 40px; align-items: flex-start; }
                .bp-label { font-weight: 900; font-size: 0.85rem; text-transform: uppercase; }
                .bp-value { font-size: 0.95rem; font-weight: normal; }
                .bp-seat-box { border: 2px solid #1a202c; padding: 10px 20px; text-align: center; margin-left: auto; }
                .bp-seat-box .seat-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
                .bp-seat-box .seat-num { font-size: 2rem; font-weight: 900; }
                .bp-divider { width: 1px; background: repeating-linear-gradient(to bottom, #1a202c 0px, #1a202c 8px, transparent 8px, transparent 14px); margin: 0 5px; }
                .bp-stub { width: 180px; background: white; padding: 25px 20px; display: flex; flex-direction: column; align-items: center; gap: 15px; border-left: 3px dashed #1a202c; }
                .bp-plane { font-size: 2.5rem; text-align: center; }
                .bp-route-stub { font-size: 1rem; font-weight: 900; letter-spacing: 2px; text-align: center; }
                .bp-stub-field { text-align: center; width: 100%; }
                .bp-stub-field .stub-label { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; }
                .bp-stub-field .stub-value { font-size: 0.85rem; font-weight: 700; }
                .bp-barcode { display: flex; gap: 2px; align-items: flex-end; height: 60px; margin: 5px 0; }
                .bp-barcode span { background: #1a202c; width: 3px; display: inline-block; }
                @media print { body { min-height: unset; } }
            </style>
        </head>
        <body>
            <div class="bp-wrapper">
                <div class="bp-main">
                    <div class="bp-title">Boarding Pass</div>

                    <div class="bp-row">
                        <div><span class="bp-label">Name of Passenger: </span><span class="bp-value">${p.first_name} ${p.last_name}</span></div>
                    </div>

                    <div class="bp-row">
                        <div><span class="bp-label">Origin: </span><span class="bp-value">${p.origin_iata || '—'}</span></div>
                        <div><span class="bp-label">Destination: </span><span class="bp-value">${p.destination_iata || '—'}</span></div>
                    </div>

                    <div class="bp-row">
                        <div><span class="bp-label">Boarding Group: </span><span class="bp-value">${p.boarding_group || '—'}</span></div>
                        <div><span class="bp-label">Passport: </span><span class="bp-value">${p.passport_number || '—'}</span></div>
                    </div>

                    <div class="bp-row" style="align-items: flex-end;">
                        <div>
                            <div><span class="bp-label">Flight: </span><span class="bp-value">AC-${p.flight_instance_id}</span></div>
                            <div style="margin-top: 10px;"><span class="bp-label">Bags: </span><span class="bp-value">${p.baggage_count || 0}</span></div>
                        </div>
                        <div class="bp-seat-box">
                            <div class="seat-label">Seat</div>
                            <div class="seat-num">${p.seat_id || '—'}</div>
                        </div>
                    </div>
                </div>

                <div class="bp-divider"></div>

                <div class="bp-stub">
                    <div class="bp-plane">✈</div>
                    <div class="bp-route-stub">${p.origin_iata || '—'} – ${p.destination_iata || '—'}</div>
                    <div class="bp-barcode">
                        ${Array.from({length: 30}, (_, i) => 
                            `<span style="height: ${Math.random() > 0.3 ? (40 + Math.floor(Math.random() * 20)) : (20 + Math.floor(Math.random() * 15))}px; width: ${Math.random() > 0.7 ? '5px' : '3px'}"></span>`
                        ).join('')}
                    </div>
                    <div class="bp-stub-field">
                        <div class="stub-label">To</div>
                        <div class="stub-value">${p.first_name} ${p.last_name}</div>
                    </div>
                    <div class="bp-stub-field">
                        <div class="stub-label">Flight</div>
                        <div class="stub-value">AC-${p.flight_instance_id}</div>
                    </div>
                    <div class="bp-stub-field">
                        <div class="stub-label">Seat</div>
                        <div class="stub-value">${p.seat_id || '—'}</div>
                    </div>
                </div>
            </div>
            <script>window.onload = () => { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

export default printBoardingPass;
