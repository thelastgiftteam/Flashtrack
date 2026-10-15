// Sample parcels for the /demo pages. Times are generated relative to "now"
// so the demo always looks current. Names, numbers and offices are made up.

export const DEMO_CONFIG = {
  brandName: 'Demo Store',
  bottomBar: {
    mode: 'button',
    text: 'Want this for your brand? Chat with FlashTrack',
    link: 'https://wa.me/917902411421',
    active: true,
  },
};

const ORDERS = [
  {
    id: 'DM100000001IN', orderId: 'DEM-001', name: 'Anjali Menon', pincode: '695010',
    type: 'SP_INLAND_PARCEL', from: ['Ernakulam HO', '682011'], to: ['Kesavadasapuram SO', '695010'],
    delivered: true,
    steps: [
      [52, 'Item Booked', 'Ernakulam HO'],
      [49, 'Item Bagged', 'Ernakulam HO'],
      [47, 'Item Dispatched', 'Ernakulam HO'],
      [30, 'Item Received', 'Thiruvananthapuram RMS'],
      [26, 'Item Dispatched', 'Thiruvananthapuram RMS'],
      [10, 'Item received at Destination', 'Kesavadasapuram SO'],
      [8,  'Taken out for delivery', 'Kesavadasapuram SO'],
      [5,  'Item Delivered', 'Kesavadasapuram SO'],
    ],
  },
  {
    id: 'DM100000002IN', orderId: 'DEM-002', name: 'Rahul Krishnan', pincode: '682030',
    type: 'SP_INLAND_PARCEL', from: ['Ernakulam HO', '682011'], to: ['Kakkanad SO', '682030'],
    steps: [
      [28, 'Item Booked', 'Ernakulam HO'],
      [25, 'Item Dispatched', 'Ernakulam HO'],
      [6,  'Item received at Destination', 'Kakkanad SO'],
      [2,  'Taken out for delivery', 'Kakkanad SO'],
    ],
  },
  {
    id: 'DM100000003IN', orderId: 'DEM-003', name: 'Fathima Shirin', pincode: '680001',
    type: 'SP_INLAND_PARCEL', from: ['Ernakulam HO', '682011'], to: ['Thrissur HO', '680001'],
    steps: [
      [50, 'Item Booked', 'Ernakulam HO'],
      [46, 'Item Dispatched', 'Ernakulam HO'],
      [20, 'Item received at Destination', 'Thrissur HO'],
      [7,  'Taken out for delivery', 'Thrissur HO'],
      [3,  'Item Kept on Hold', 'Thrissur HO', 'Intimation Delivered'],
    ],
  },
  {
    id: 'DM100000004IN', orderId: 'DEM-004', name: 'Karthik S', pincode: '641002',
    type: 'SP_INLAND_DOC', from: ['Ernakulam HO', '682011'], to: ['R S Puram HO', '641002'],
    steps: [
      [20, 'Item Booked', 'Ernakulam HO'],
      [17, 'Item Bagged', 'Ernakulam HO'],
      [15, 'Item Dispatched', 'Ernakulam HO'],
      [4,  'Bag Received', 'Coimbatore PH'],
    ],
  },
  {
    id: 'DM100000005IN', orderId: 'DEM-005', name: 'Neha Varghese', pincode: '560034',
    type: 'SP_INLAND_PARCEL', from: ['Ernakulam HO', '682011'], to: ['Koramangala SO', '560034'],
    steps: [
      [170, 'Item Booked', 'Ernakulam HO'],
      [166, 'Item Dispatched', 'Ernakulam HO'],
      [140, 'Item received at Destination', 'Koramangala SO'],
      [120, 'Item Kept on Hold', 'Koramangala SO', 'Addressee not available'],
      [12,  'Item Returned', 'Koramangala SO', 'Unclaimed', true],
    ],
  },
];

// "YYYY-MM-DDTHH:MM:SS" and "HH:MM:SS" in IST for a time `hoursAgo` before now.
function ist(hoursAgo, now) {
  const s = new Date(now - hoursAgo * 3600 * 1000)
    .toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata', hour12: false }); // "2026-10-14 16:05:00"
  const [d, t] = s.split(' ');
  return { date: `${d}T${t}`, time: t };
}

const STATUS = {
  'DM100000001IN': 'Delivered',
  'DM100000002IN': 'Out for delivery',
  'DM100000003IN': 'Held at post office',
  'DM100000004IN': 'In transit',
  'DM100000005IN': 'Returning to sender',
};

export function demoList(now = Date.now()) {
  return ORDERS.map(o => ({
    id: o.id, orderId: o.orderId, name: o.name, pincode: o.pincode,
    status: STATUS[o.id],
    shippedOn: ist(o.steps[0][0], now).date.slice(0, 10),
  }));
}

export function demoParcel(id, now = Date.now()) {
  const o = ORDERS.find(x => x.id === id);
  if (!o) return { found: false, id };
  const events = o.steps
    .map(([h, event, office, remarks = '', rts = false]) => ({ ...ist(h, now), event, office, remarks, rts }))
    .reverse(); // newest first
  const booked = ist(o.steps[0][0], now);
  return {
    found: true,
    id: o.id,
    status: STATUS[o.id],
    delivered: !!o.delivered,
    booking: {
      bookedAt: o.from[0], originPincode: o.from[1],
      deliveryLocation: o.to[0], destinationPincode: o.to[1],
      bookedOn: booked.date, articleType: o.type,
      deliveredOn: o.delivered ? events[0].date : '',
    },
    events,
    fetchedAt: new Date(now).toISOString(),
  };
}

export const DEMO_IDS = ORDERS.map(o => o.id);

// Cards for the demo list and the homepage phones. Sample numbers can't be
// tracked on a real tracking site, so Track opens a sample tracking result.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = s => { const [, m, d] = s.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]}`; };

export function demoCards(now = Date.now()) {
  return demoList(now)
    .sort((a, b) => (a.shippedOn < b.shippedOn ? 1 : -1))
    .map((o, i) => ({
      name: o.name, orderId: o.orderId, pincode: o.pincode, trackingId: o.id,
      trackingLink: `/demo/${o.id}`, shippedOn: fmtDay(o.shippedOn), isNew: i === 0,
    }));
}
