(() => {
    'use strict';

    let originalTitle = document.title;
    let leaveTime = null;
    let tickTimer = null;
    let sleepTriggered = false;

    // Update the "away" title based on elapsed seconds
    function updateAwayTitle() {
        if (!leaveTime) return;
        const elapsed = Math.floor((Date.now() - leaveTime) / 1000);
        // Still within first 10s — keep initial message
        if (elapsed < 10) return;

        // Lookup table: [threshold_seconds, message]
        const stages = [
            [30,  '已离开超过 10 秒……'],
            [60,  '已离开超过 30 秒……'],
            [120, '已离开超过 1 分钟……'],
        ];

        let text = '页面将睡眠以节约浏览器资源……';
        for (let i = 0; i < stages.length; i++) {
            if (elapsed < stages[i][0]) {
                text = stages[i][1];
                break;
            }
        }

        // Trigger sleep once when entering the final stage
        if (text === '页面将睡眠以节约浏览器资源……' && !sleepTriggered) {
            sleepTriggered = true;
            document.documentElement.dataset.pageSleeping = '';
            document.dispatchEvent(new CustomEvent('pagestart.sleep'));
        }
        document.title = text;
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            // --- Tab hidden: start tracking ---
            originalTitle = document.title;
            leaveTime = Date.now();

            // Initial "away" title
            document.title = '检测到用户离开，开始计时……';

            // Tick every second to update the title
            tickTimer = setInterval(updateAwayTitle, 1000);
        } else {
            // --- Tab visible again: welcome back ---
            if (tickTimer) {
                clearInterval(tickTimer);
                tickTimer = null;
            }
            leaveTime = null;
            sleepTriggered = false;

            // Wake from sleep: restore resources
            delete document.documentElement.dataset.pageSleeping;
            document.dispatchEvent(new CustomEvent('pagestart.wake'));

            document.title = '啊，你回来了';

            // Restore original title after 500 ms
            // Capture current value in closure to survive rapid tab switches
            const titleToRestore = originalTitle;
            setTimeout(function () {
                document.title = titleToRestore;
            }, 500);
        }
    });
})();