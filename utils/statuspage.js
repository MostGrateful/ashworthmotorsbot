const fetch = require('node-fetch');

const STATUSPAGE_API_URL = `https://api.statuspage.io/v1/pages/${process.env.STATUSPAGE_PAGE_ID}/components/${process.env.STATUSPAGE_COMPONENT_ID}`;

async function updateStatus(status) {
  try {
    const response = await fetch(STATUSPAGE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `OAuth ${process.env.STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        component: { status }
      })
    });

    if (!response.ok) {
      console.error(`❌ Failed to update Statuspage: ${response.statusText}`);
    } else {
      console.log(`✅ Statuspage updated: ${status}`);
    }

  } catch (error) {
    console.error('❌ Error updating Statuspage:', error);
  }
}

module.exports = updateStatus;
