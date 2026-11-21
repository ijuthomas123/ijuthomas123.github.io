// PEBEC ReportGov Frontend Logic - by Ijudigal Thomas
// Connects frontend to backend API

const API = 'http://localhost:3000/api';

async function testAPI() {
  try {
    let res = await fetch(API + '/health');
    let data = await res.json();
    console.log('PEBEC API:', data);
    return data;
  } catch(e) {
    console.log('Backend not running locally - using demo mode');
    return null;
  }
}

async function submitReportToAPI(reportData) {
  try {
    let res = await fetch(API + '/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return await res.json();
  } catch(e) {
    return { error: 'Backend offline, saved in browser demo' };
  }
}

async function getStats() {
  try {
    let res = await fetch(API + '/stats');
    return await res.json();
  } catch(e) { return { totalReports: 1240, mdas: 69 }; }
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('PEBEC ReportGov Frontend Loaded - by Ijudigal Thomas');
  testAPI();
});
