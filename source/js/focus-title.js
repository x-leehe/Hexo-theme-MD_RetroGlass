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

        if (elapsed < 10) {
            // still within the first 10s — keep initial message
            return;
        }

        let text;
        if (elapsed < 30) {
            text = '已离开超过 10 秒……';
        } else if (elapsed < 60) {
            text = '已离开超过 30 秒……';
        } else if (elapsed < 120) {
            text = '已离开超过 1 分钟……';
        } else {
            text = '页面将睡眠以节约浏览器资源……';
            if (!sleepTriggered) {
                sleepTriggered = true;
                document.documentElement.dataset.pageSleeping = '';
                document.dispatchEvent(new CustomEvent('pagestart.sleep'));
            }
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