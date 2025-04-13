const fetch = require('node-fetch');

const STATUSPAGE_API = 'https://api.statuspage.io/v1';

const updateComponentStatus = async (status) => {
  try {
    const response = await fetch(`${STATUSPAGE_API}/pages/${process.env.STATUSPAGE_PAGE_ID}/components/${process.env.STATUSPAGE_COMPONENT_ID}.json`, {
      method: 'PATCH',
      headers: {
        Authorization: `OAuth ${process.env.STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ component: { status } }),
    });

    if (!response.ok) throw new Error(`Failed to update status: ${response.statusText}`);

    console.log(`✅ Statuspage updated to: ${status}`);
  } catch (error) {
    console.error('❌ Error updating Statuspage:', error);
  }
};

module.exports = { updateComponentStatus };
