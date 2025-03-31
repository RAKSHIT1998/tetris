// Google AdSense Configuration
const ADSENSE_CONFIG = {
    publisherId: 'ca-pub-YOUR_PUBLISHER_ID', // Replace with your Publisher ID
    slots: {
        banner: 'YOUR_BANNER_SLOT_ID',       // Replace with your Banner Ad Slot ID
        interstitial: 'YOUR_INTERSTITIAL_SLOT_ID', // Replace with your Interstitial Ad Slot ID
        rewarded: 'YOUR_REWARDED_SLOT_ID'    // Replace with your Rewarded Ad Slot ID
    }
};

// Ad Display Functions
const AdsManager = {
    // Initialize ads
    init() {
        // Load Google AdSense script
        (adsbygoogle = window.adsbygoogle || []).push({});
    },

    // Show banner ad
    showBanner() {
        // Refresh banner ad
        (adsbygoogle = window.adsbygoogle || []).push({});
    },

    // Show interstitial ad on game over
    showGameOverAd() {
        // Display interstitial ad
        (adsbygoogle = window.adsbygoogle || []).push({});
    },

    // Show rewarded ad for power-ups
    showRewardedAd(callback) {
        // Display rewarded ad
        (adsbygoogle = window.adsbygoogle || []).push({
            reward_callback: callback
        });
    }
};

export { ADSENSE_CONFIG, AdsManager };